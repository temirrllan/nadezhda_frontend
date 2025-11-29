import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import "./admin.css";

export default function BookingsAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const load = () => {
    setLoading(true);
    adminApi.get("/api/admin/bookings")
      .then(r => setList(r.data))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id: string, status: string) => {
    await adminApi.put(`/api/admin/bookings/${id}/status`, { status });
    load();
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      new: "Новая",
      confirmed: "Подтверждена",
      cancelled: "Отменена",
      completed: "Завершена"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: "#007aff",
      confirmed: "#34c759",
      cancelled: "#ff3b30",
      completed: "#8e8e93"
    };
    return colors[status] || "#8e8e93";
  };

  return (
    <div className="admin-card">
      <h2>Бронирования</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tg-theme-hint-color, #8e8e93)' }}>
          Загрузка...
        </div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tg-theme-hint-color, #8e8e93)' }}>
          Нет бронирований
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {list.map(b => (
            <div className="admin-item" key={b._id}>
              <div>
                <strong>{b.clientName}</strong>
                <div style={{ marginTop: '4px', fontSize: '14px', color: 'var(--tg-theme-hint-color, #8e8e93)' }}>
                  📞 {b.phone}
                </div>
                <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--tg-theme-text-color, #1c1c1e)' }}>
                  {b.costumeTitle}
                </div>
                <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--tg-theme-hint-color, #8e8e93)' }}>
                  Размер: {b.size}
                  {b.childName && ` • Ребёнок: ${b.childName}`}
                  {b.childAge && ` (${b.childAge} лет)`}
                  {b.childHeight && ` • Рост: ${b.childHeight} см`}
                </div>
              </div>
              <div>
                <select 
                  value={b.status} 
                  onChange={(e) => changeStatus(b._id, e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `2px solid ${getStatusColor(b.status)}`,
                    background: 'var(--tg-theme-secondary-bg-color, #fff)',
                    color: 'var(--tg-theme-text-color, #1c1c1e)',
                    fontWeight: '500',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {["new","confirmed","cancelled","completed"].map(s => (
                    <option key={s} value={s}>{getStatusLabel(s)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
