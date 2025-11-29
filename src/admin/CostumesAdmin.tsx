import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useNavigate } from "react-router-dom";
import "./admin.css";

export default function CostumesAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const load = () => {
    setLoading(true);
    adminApi.get("/api/admin/costumes")
      .then(r => setList(r.data))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Удалить костюм?")) return;
    await adminApi.delete(`/api/admin/costumes/${id}`);
    load();
  };

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Костюмы</h2>
        <button onClick={() => nav("/costumes/new/edit")} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>+</span> Добавить
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tg-theme-hint-color, #8e8e93)' }}>
          Загрузка...
        </div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tg-theme-hint-color, #8e8e93)' }}>
          Нет костюмов. Добавьте первый костюм!
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {list.map(c => {
            // Подсчитываем общий сток
            const totalStock = Object.values(c.stockBySize || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
            
            return (
              <div key={c._id} className="admin-item">
                <div>
                  <strong>{c.title}</strong>
                  <div style={{ marginTop: '6px', fontSize: '16px', fontWeight: '600', color: 'var(--tg-theme-link-color, #007aff)' }}>
                    {c.price} ₽
                  </div>
                  {c.description && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--tg-theme-hint-color, #8e8e93)', lineHeight: '1.4' }}>
                      {c.description.length > 100 ? `${c.description.substring(0, 100)}...` : c.description}
                    </div>
                  )}
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--tg-theme-hint-color, #8e8e93)' }}>
                    {c.photos?.length > 0 ? `📷 ${c.photos.length} фото` : 'Нет фото'}
                    <span style={{ marginLeft: '12px' }}>
                      📦 Всего в наличии: <strong>{totalStock} шт.</strong>
                    </span>
                    {c.available !== undefined && (
                      <span style={{ marginLeft: '12px', color: c.available ? '#34c759' : '#ff3b30' }}>
                        {c.available ? '✓ Доступен' : '✗ Недоступен'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button onClick={() => nav(`/costumes/${c._id}`)}>👁️ Просмотр</button>
                  <button onClick={() => nav(`/costumes/${c._id}/edit`)}>✏️ Редактировать</button>
                  <button className="danger" onClick={() => remove(c._id)}>🗑️ Удалить</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}