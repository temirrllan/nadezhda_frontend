import { useEffect, useState } from "react";
import { adminApi, getFullUrl } from "../api/adminApi";
import "../admin/admin.css";

export default function StockAdmin() {
  const [costumes, setCostumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi
      .get("/api/admin/stock")
      .then((r) => setCostumes(r.data))
      .catch(() => setCostumes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const adjustStock = async (costumeId: string, size: string, amount: number) => {
    try {
      await adminApi.post("/api/admin/stock/adjust", { costumeId, size, amount });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Ошибка при изменении стока");
    }
  };

  return (
    <div className="admin-card">
      <h2>Учёт аренды</h2>
      <p style={{ color: "var(--tg-theme-hint-color, #8e8e93)", marginBottom: "20px" }}>
        Управляйте остатками костюмов. Нажмите "−" при выдаче, "+" при возврате.
      </p>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--tg-theme-hint-color, #8e8e93)" }}>
          Загрузка...
        </div>
      ) : costumes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--tg-theme-hint-color, #8e8e93)" }}>
          Нет костюмов
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {costumes.map((c) => (
            <div key={c._id} className="stock-item">
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {/* Фото костюма */}
                {c.photos?.[0] && (
                  <img
                    src={getFullUrl(c.photos[0])}
                    alt={c.title}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      flexShrink: 0,
                    }}
                  />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: "16px", display: "block", marginBottom: "8px" }}>
                    {c.title}
                  </strong>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {c.sizes?.map((size: string) => {
                      const stock = c.stockBySize?.[size] || 0;
                      return (
                        <div
                          key={size}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            background: "var(--tg-theme-bg-color, #f2f2f7)",
                            borderRadius: "8px",
                          }}
                        >
                          <span style={{ fontSize: "15px", fontWeight: "600", minWidth: "40px" }}>
                            {size}
                          </span>
                          <span
                            style={{
                              fontSize: "14px",
                              color: stock > 0 ? "#34c759" : "#ff3b30",
                              fontWeight: "600",
                              minWidth: "60px",
                            }}
                          >
                            {stock > 0 ? `${stock} шт.` : "Нет"}
                          </span>

                          <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                            <button
                              onClick={() => adjustStock(c._id, size, -1)}
                              disabled={stock === 0}
                              style={{
                                width: "32px",
                                height: "32px",
                                padding: 0,
                                fontSize: "18px",
                                borderRadius: "8px",
                                background: stock > 0 ? "#ff3b30" : "#ccc",
                                color: "#fff",
                                cursor: stock > 0 ? "pointer" : "not-allowed",
                              }}
                            >
                              −
                            </button>
                            <button
                              onClick={() => adjustStock(c._id, size, 1)}
                              style={{
                                width: "32px",
                                height: "32px",
                                padding: 0,
                                fontSize: "18px",
                                borderRadius: "8px",
                                background: "#34c759",
                                color: "#fff",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}