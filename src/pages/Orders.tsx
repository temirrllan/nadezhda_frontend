import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { api } from "../api/api";
import Loader from "../components/Loader";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const tgId = WebApp.initDataUnsafe?.user?.id;
      if (!tgId) {
        WebApp.showAlert("❌ Не удалось получить ваш Telegram ID");
        return;
      }

      const res = await api.get("/api/bookings/my", {
        headers: { "x-tg-id": String(tgId) },
      });
      
      setOrders(res.data);
    } catch (err) {
      console.error("Ошибка загрузки заказов:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm("Вы уверены, что хотите отменить этот заказ?")) return;

    try {
      const tgId = WebApp.initDataUnsafe?.user?.id;
      await api.put(`/api/bookings/${orderId}/cancel`, {}, {
        headers: { "x-tg-id": String(tgId) },
      });

      WebApp.showAlert("✅ Заказ успешно отменён!");
      loadOrders();
    } catch (err: any) {
      console.error("Ошибка отмены заказа:", err);
      const errorMsg = err.response?.data?.error || "Ошибка при отмене заказа";
      WebApp.showAlert(`❌ ${errorMsg}`);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      new: "🕐 Ожидает подтверждения",
      confirmed: "✅ Выдан в руки",
      cancelled: "❌ Отменена",
      completed: "✔️ Возвращён",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: "#007aff",
      confirmed: "#ff9500",
      cancelled: "#ff3b30",
      completed: "#34c759",
    };
    return colors[status] || "#8e8e93";
  };

  const getStatusDescription = (status: string, order: any) => {
    const descriptions: { [key: string]: string } = {
      new: "Ожидаем, пока администратор подтвердит вашу заявку",
      confirmed: `Костюм выдан. Не забудьте вернуть до ${new Date(order.returnDate).toLocaleDateString("ru-RU")} до 17:00`,
      cancelled: "Заказ был отменён",
      completed: "Костюм успешно возвращён. Спасибо!",
    };
    return descriptions[status] || "";
  };

  if (loading) return <Loader text="Загрузка заказов..." />;

  return (
    <div className="orders-page">
      <header className="orders-header">
        {/* <button className="back-btn" onClick={() => nav("/")}>
          ←
        </button> */}
        <h1 className="orders-title">Мои заказы</h1>
      </header>

      {orders.length === 0 ? (
        <div className="empty">
          <p>У вас пока нет заказов</p>
          <button onClick={() => nav("/")}>Перейти к каталогу</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>{order.costumeTitle}</h3>
                <span
                  className="order-status"
                  style={{ 
                    color: getStatusColor(order.status),
                    background: `${getStatusColor(order.status)}15`
                  }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div style={{
                padding: "12px",
                background: `${getStatusColor(order.status)}10`,
                borderRadius: "10px",
                marginBottom: "12px",
                fontSize: "14px",
                color: "var(--tg-theme-hint-color, #8e8e93)",
                lineHeight: "1.4"
              }}>
                {getStatusDescription(order.status, order)}
              </div>

              <div className="order-details">
                <div className="order-row">
                  <span className="label">Размер:</span>
                  <span className="value">{order.size}</span>
                </div>

                <div className="order-row">
                  <span className="label">Дата мероприятия:</span>
                  <span className="value">
                    {new Date(order.eventDate || order.bookingDate).toLocaleDateString("ru-RU")}
                  </span>
                </div>

                {order.pickupDate && (
                  <div className="order-row">
                    <span className="label">📦 Выдача:</span>
                    <span className="value">
                      {new Date(order.pickupDate).toLocaleDateString("ru-RU")} 17:00-19:00
                    </span>
                  </div>
                )}

                {order.returnDate && (
                  <div className="order-row">
                    <span className="label">🔄 Возврат:</span>
                    <span className="value">
                      {new Date(order.returnDate).toLocaleDateString("ru-RU")} до 17:00
                    </span>
                  </div>
                )}

                {order.childName && (
                  <div className="order-row">
                    <span className="label">Ребёнок:</span>
                    <span className="value">{order.childName}</span>
                  </div>
                )}

                {order.childAge && (
                  <div className="order-row">
                    <span className="label">Возраст:</span>
                    <span className="value">{order.childAge} лет</span>
                  </div>
                )}

                <div className="order-row">
                  <span className="label">Дата заказа:</span>
                  <span className="value">
                    {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>

              {order.status === "new" && (
                <button
                  className="cancel-btn"
                  onClick={() => cancelOrder(order._id)}
                >
                  ❌ Отменить заказ
                </button>
              )}

              {order.status === "cancelled" && (
                <div className="cancelled-notice">
                  Заказ отменён
                </div>
              )}

              {order.status === "completed" && (
                <div style={{
                  padding: "12px",
                  background: "rgba(52, 199, 89, 0.1)",
                  border: "2px solid #34c759",
                  borderRadius: "12px",
                  color: "#34c759",
                  textAlign: "center",
                  fontWeight: "600",
                  marginTop: "8px"
                }}>
                  ✅ Костюм возвращён
                </div>
              )}

              {order.status === "confirmed" && (
                <div style={{
                  padding: "12px",
                  background: "rgba(255, 149, 0, 0.1)",
                  border: "2px solid #ff9500",
                  borderRadius: "12px",
                  color: "#ff9500",
                  textAlign: "center",
                  fontWeight: "600",
                  marginTop: "8px"
                }}>
                  ⚠️ У вас на руках костюм
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}