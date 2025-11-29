import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import "./admin.css";

export default function LogsAdmin() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.get("/api/admin/logs")
      .then(r => setLogs(r.data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-card">
      <h2>Логи админов</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tg-theme-hint-color, #8e8e93)' }}>
          Загрузка...
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tg-theme-hint-color, #8e8e93)' }}>
          Нет логов
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {logs.map(l => (
            <div key={l._id} className="log-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <strong>{l.action}</strong>
                <span style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color, #8e8e93)', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                  {formatDate(l.createdAt)}
                </span>
              </div>
              {l.details && Object.keys(l.details).length > 0 && (
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {JSON.stringify(l.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
