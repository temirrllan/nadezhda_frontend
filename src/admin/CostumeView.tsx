import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi, getFullUrl } from "../api/adminApi";
import "./admin.css";

export default function CostumeView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [costume, setCostume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  const load = () => {
    setLoading(true);
    adminApi
      .get(`/api/admin/costumes`)
      .then((res) => {
        const found = res.data.find((c: any) => c._id === id);
        setCostume(found);
      })
      .catch((err) => console.error("Ошибка загрузки костюма:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const adjustStock = async (size: string, amount: number) => {
    try {
      await adminApi.post("/api/admin/stock/adjust", { costumeId: id, size, amount });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Ошибка при изменении стока");
    }
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: "center", padding: "40px", color: "var(--tg-theme-hint-color, #8e8e93)" }}>
          Загрузка...
        </div>
      </div>
    );
  }

  if (!costume) {
    return (
      <div className="admin-card">
        <p>Костюм не найден</p>
        <button onClick={() => nav("/costumes")}>← Назад</button>
      </div>
    );
  }

  const photos = costume.photos?.length > 0 
    ? costume.photos.map((p: string) => getFullUrl(p))
    : ["https://via.placeholder.com/600x400?text=Нет+фото"];

  return (
    <div className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0 }}>{costume.title}</h2>
        <button onClick={() => nav(`/costumes/${id}`)}>
          ✏️ Редактировать
        </button>
      </div>

      {photos.length > 0 && (
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <img
            src={photos[photoIndex]}
            alt={costume.title}
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              borderRadius: "16px",
            }}
          />
          {photos.length > 1 && (
            <>
              <button
                className="nav-btn prev"
                onClick={() => setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10px",
                  transform: "translateY(-50%) !important",
                }}
              >
                ‹
              </button>
              <button
                className="nav-btn next"
                onClick={() => setPhotoIndex((prev) => (prev + 1) % photos.length)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%) !important",
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}

      <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
        <div>
          <strong>Цена:</strong> {costume.price} ₽
        </div>
        {costume.description && (
          <div>
            <strong>Описание:</strong>
            <p style={{ marginTop: "4px", color: "var(--tg-theme-hint-color, #8e8e93)" }}>
              {costume.description}
            </p>
          </div>
        )}
        {costume.heightRange && (
          <div>
            <strong>Рост:</strong> {costume.heightRange}
          </div>
        )}
        {costume.notes && (
          <div>
            <strong>Примечание:</strong> {costume.notes}
          </div>
        )}
        <div>
          <strong>Статус:</strong>{" "}
          <span style={{ color: costume.available ? "#34c759" : "#ff3b30", fontWeight: "600" }}>
            {costume.available ? "✅ Доступен" : "❌ Недоступен"}
          </span>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: "16px" }}>📦 Управление размерами</h3>
        
        {costume.sizes?.length > 0 ? (
          <div style={{ display: "grid", gap: "12px" }}>
            {costume.sizes.map((size: string) => {
              const stock = costume.stockBySize?.[size] || 0;
              return (
                <div
                  key={size}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px",
                    background: stock > 0 
                      ? "linear-gradient(135deg, #34c759 0%, #28a745 100%)"
                      : "linear-gradient(135deg, #ff3b30 0%, #dc3545 100%)",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <span style={{ fontWeight: "700", fontSize: "20px", minWidth: "60px" }}>
                    {size}
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: "600", minWidth: "80px" }}>
                    {stock > 0 ? `${stock} шт.` : "Нет в наличии"}
                  </span>

                  {/* Кнопки +/− */}
                  <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => adjustStock(size, -1)}
                      disabled={stock === 0}
                      style={{
                        width: "40px",
                        height: "40px",
                        padding: 0,
                        fontSize: "20px",
                        borderRadius: "10px",
                        background: stock > 0 ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        cursor: stock > 0 ? "pointer" : "not-allowed",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      −
                    </button>
                    <button
                      onClick={() => adjustStock(size, 1)}
                      style={{
                        width: "40px",
                        height: "40px",
                        padding: 0,
                        fontSize: "20px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.3)",
                        color: "#fff",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--tg-theme-hint-color, #8e8e93)" }}>
            Размеры не указаны
          </p>
        )}
      </div>

      <div style={{ marginTop: "24px" }}>
        <button className="secondary" onClick={() => nav("/costumes")}>
          ← Назад к списку
        </button>
      </div>
    </div>
  );
}