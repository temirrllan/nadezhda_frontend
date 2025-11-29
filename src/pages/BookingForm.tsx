import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { createBooking, getCostumes } from "../api/api";
import WebApp from "@twa-dev/sdk";
import { useBackButton } from "../hooks/useBackButton";
import Loader from "../components/Loader";
import BookingCalendar from "../components/BookingCalendar";
import "./BookingForm.css";

export default function BookingForm() {
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [costume, setCostume] = useState<any>(null);

  useBackButton();
  
  const [selectedDate, setSelectedDate] = useState<string>(
    (location.state as any)?.selectedDate || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    (location.state as any)?.selectedSize || ""
  );
  
  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    childName: "",
    childAge: "",
    childHeight: "",
  });

  useEffect(() => {
    getCostumes().then((all) => {
      const found = all.find((c: any) => c._id === id);
      setCostume(found);
      
      if (found && !selectedSize) {
        const stockBySize = found.stockBySize || {};
        const firstAvailable = found.sizes?.find((s: string) => (stockBySize[s] || 0) > 0);
        if (firstAvailable) {
          setSelectedSize(firstAvailable);
        }
      }
    });
  }, [id, selectedSize]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!form.clientName || !form.phone || !selectedSize) {
      WebApp.showAlert("⚠️ Заполните обязательные поля!");
      return;
    }

    if (!selectedDate) {
      WebApp.showAlert("⚠️ Пожалуйста, выберите дату бронирования!");
      return;
    }

    try {
      setLoading(true);

      await createBooking({
        userTgId: WebApp.initDataUnsafe?.user?.id || 0,
        costumeId: id,
        size: selectedSize,
        bookingDate: selectedDate,
        ...form,
      });

      setSuccess(true);
      WebApp.showAlert("✅ Заявка успешно отправлена!");

      setTimeout(() => {
        WebApp.close();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Ошибка при отправке. Попробуйте снова.";
      WebApp.showAlert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Отправляем заявку..." />;
  if (!costume) return <Loader text="Загрузка данных..." />;

  const stockBySize = costume.stockBySize || {};
  const availableSizes = costume.sizes?.filter((size: string) => (stockBySize[size] || 0) > 0) || [];

  return (
    <div className="booking-wrapper">
      <h2 className="booking-title">Бронирование костюма</h2>

      <div className="booking-form">
        {/* Календарь */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            📅 Дата аренды *
          </label>
          <BookingCalendar
            costumeId={costume._id}
            size={selectedSize}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          {selectedDate && (
            <p style={{ 
              marginTop: "12px", 
              padding: "10px", 
              background: "rgba(0, 122, 255, 0.1)", 
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#007aff"
            }}>
              ✓ Выбрана дата: {new Date(selectedDate).toLocaleDateString("ru-RU", { 
                day: "numeric", 
                month: "long", 
                year: "numeric" 
              })}
            </p>
          )}
        </div>

        <div className="input-group">
          <input name="clientName" placeholder=" " value={form.clientName} onChange={handleChange} required />
          <label>Ваше имя *</label>
        </div>

        <div className="input-group">
          <input name="phone" placeholder=" " value={form.phone} onChange={handleChange} required />
          <label>Телефон *</label>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            Размер *
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {availableSizes.map((size: string) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: selectedSize === size ? "2px solid #007aff" : "2px solid #e0e0e0",
                  background: selectedSize === size ? "#007aff" : "#fff",
                  color: selectedSize === size ? "#fff" : "#1c1c1e",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {size} ({stockBySize[size]} шт.)
              </button>
            ))}
          </div>
        </div>

        {availableSizes.length === 0 && (
          <p style={{ color: "#ff3b30", fontSize: "14px", textAlign: "center" }}>
            ❌ Все размеры закончились
          </p>
        )}

        <div className="input-group">
          <input name="childName" placeholder=" " value={form.childName} onChange={handleChange} />
          <label>Имя ребёнка</label>
        </div>

        <div className="input-group">
          <input name="childAge" placeholder=" " value={form.childAge} onChange={handleChange} />
          <label>Возраст ребёнка</label>
        </div>

        <div className="input-group">
          <input name="childHeight" placeholder=" " value={form.childHeight} onChange={handleChange} />
          <label>Рост ребёнка (см)</label>
        </div>

        <button 
          className="submit-btn" 
          onClick={handleSubmit} 
          disabled={availableSizes.length === 0 || !selectedDate}
          style={{
            opacity: availableSizes.length === 0 || !selectedDate ? 0.5 : 1,
            cursor: availableSizes.length === 0 || !selectedDate ? "not-allowed" : "pointer",
          }}
        >
          Отправить заявку
        </button>

        {success && <p className="form-message success">✅ Заявка отправлена!</p>}
      </div>
    </div>
  );
}