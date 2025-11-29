import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCostumes } from "../api/api";
import { API_BASE } from "../api/adminApi";
import BookingCalendar from "../components/BookingCalendar";
import "./CostumeDetails.css";

export default function CostumeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [costume, setCostume] = useState<any>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    getCostumes().then((all) => {
      const found = all.find((c: any) => c._id === id);
      setCostume(found);
      
      if (found?.sizes?.length > 0) {
        const stockBySize = found.stockBySize || {};
        const firstAvailable = found.sizes.find((s: string) => (stockBySize[s] || 0) > 0);
        if (firstAvailable) {
          setSelectedSize(firstAvailable);
        }
      }
    });
  }, [id]);

  if (!costume) return <p className="loading-text">Загрузка костюма...</p>;

  const photos =
    costume.photos && costume.photos.length > 0
      ? costume.photos.map((p: string) =>
          p.startsWith("http") ? p : `${API_BASE}${p.startsWith("/") ? p : "/" + p}`
        )
      : ["https://via.placeholder.com/600x400?text=Нет+фото"];

  const nextPhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const stockBySize = costume.stockBySize || {};
  const availableSizes = costume.sizes?.filter((size: string) => (stockBySize[size] || 0) > 0) || [];
  const unavailableSizes = costume.sizes?.filter((size: string) => (stockBySize[size] || 0) === 0) || [];

  const handleBooking = () => {
    if (!selectedDate) {
      alert("⚠️ Пожалуйста, выберите дату бронирования");
      return;
    }
        navigate(`/book/${costume._id}`, { 
      state: { 
        selectedDate, 
        selectedSize: selectedSize || availableSizes[0] 
      } 
    });
  };

  return (
    <div className="page-container">
      <header className="header">
        {/* <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button> */}
        <h1 className="page-title">{costume.title}</h1>
      </header>

      <div className="card">
        <div className="image-slider">
          <img
            src={photos[photoIndex]}
            alt={costume.title}
            className="costume-image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/600x400?text=Нет+фото";
            }}
          />
          {photos.length > 1 && (
            <>
              <button className="nav-btn prev" onClick={prevPhoto}>
                ‹
              </button>
              <button className="nav-btn next" onClick={nextPhoto}>
                ›
              </button>
              <div className="dots">
                {photos.map((_: string, i: number) => (
                  <span
                    key={i}
                    className={`dot ${i === photoIndex ? "active" : ""}`}
                    onClick={() => setPhotoIndex(i)}
                  ></span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="info">
          <h2>{costume.title}</h2>
          <p className="desc">{costume.description || "Описание отсутствует"}</p>

          <div className="price-block">
            <span className="price">{costume.price} ₽</span>
            <span className="label">за аренду</span>
          </div>

          <div className="details-section">
            {costume.sizes?.length > 0 && (
              <div>
                <strong>Выберите размер:</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {availableSizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        border: selectedSize === size ? "2px solid #007aff" : "2px solid #e0e0e0",
                        background: selectedSize === size ? "#007aff" : "#fff",
                        color: selectedSize === size ? "#fff" : "#1c1c1e",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                  {unavailableSizes.map((size: string) => (
                    <span
                      key={size}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        background: "#ff3b30",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: "600",
                        opacity: 0.6,
                      }}
                    >
                      ✗ {size}
                    </span>
                  ))}
                </div>
                {unavailableSizes.length > 0 && (
                  <p style={{ fontSize: "13px", color: "#ff3b30", marginTop: "8px" }}>
                    ⚠️ Размеры с ✗ временно недоступны
                  </p>
                )}
              </div>
            )}

            {costume.heightRange && (
              <p style={{ marginTop: "12px" }}>
                <strong>Рост:</strong> {costume.heightRange}
              </p>
            )}
            {costume.notes && (
              <p style={{ marginTop: "12px" }}>
                <strong>Примечание:</strong> {costume.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {availableSizes.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <h3 style={{ marginBottom: "12px", fontSize: "18px", fontWeight: "700" }}>
            📅 Выберите дату аренды
          </h3>
          <BookingCalendar
            costumeId={costume._id}
            size={selectedSize}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
      )}

      {availableSizes.length > 0 ? (
        <button 
          className="main-btn" 
          onClick={handleBooking}
          style={{
            opacity: selectedDate ? 1 : 0.5,
            cursor: selectedDate ? "pointer" : "not-allowed",
          }}
        >
          {selectedDate ? "Забронировать на " + new Date(selectedDate).toLocaleDateString("ru-RU") : "Выберите дату для бронирования"}
        </button>
      ) : (
        <button className="main-btn" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
          ❌ Все размеры недоступны
        </button>
      )}
    </div>
  );
}