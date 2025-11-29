// frontend/src/admin/Dashboard.tsx
import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import "./admin.css";

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.get("/api/admin/costumes").then(r => ({ costumes: r.data.length })).catch(() => ({ costumes: 0 })),
      adminApi.get("/api/admin/bookings").then(r => ({ bookings: r.data.length })).catch(() => ({ bookings: 0 })),
    ]).then(([costumesData, bookingsData]) => {
      setStats({ ...costumesData, ...bookingsData });
      setLoading(false);
    });
  }, []);

  return (
    <div className="admin-card">
      <h2>Панель управления</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginTop: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Костюмов</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>
            {loading ? "..." : (stats.costumes ?? 0)}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(245, 87, 108, 0.3)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Бронирований</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>
            {loading ? "..." : (stats.bookings ?? 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
