import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h2>Перенаправление...</h2>
        <p style={{ textAlign: "center", color: "var(--tg-theme-hint-color, #8e8e93)" }}>
          Вход в админку теперь происходит автоматически через Telegram
        </p>
      </div>
    </div>
  );
}