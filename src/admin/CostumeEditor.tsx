import { useEffect, useState } from "react";
import { API_BASE, adminApi } from "../api/adminApi";
import { useNavigate, useParams } from "react-router-dom";
import "./admin.css";

export default function CostumeEditor() {
  const { id } = useParams();
  const nav = useNavigate();

  const [state, setState] = useState<any>({
    title: "",
    price: "",
    sizes: [],
    stockBySize: {},
    heightRange: "",
    notes: "",
    photos: [],
    available: true,
    description: "",
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  //Для модального окна с ошибкой
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Для добавления размеров
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");

  const toFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  };

  useEffect(() => {
    if (!id || id === "new") return;
    setLoading(true);
    adminApi
      .get(`/api/admin/costumes`)
      .then((res: any) => {
        const found = res.data.find((c: any) => c._id === id);
        if (found) {
          const fullPhotos = found.photos?.map((p: string) => toFullUrl(p)) || [];
          setState({ ...found, photos: fullPhotos, price: found.price || "" });
        } else {
          setErrorModal("Костюм не найден");
          setTimeout(() => nav("/costumes"), 2000);
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки костюма:", err);
        setErrorModal("Ошибка загрузки данных костюма");
      })
      .finally(() => setLoading(false));
  }, [id, nav]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setFiles(files);
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    const form = new FormData();
    for (let i = 0; i < files.length; i++) form.append("photos", files[i]);
    
    try {
      const r = await adminApi.post("/api/admin/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return r.data.urls;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Ошибка загрузки фото";
      throw new Error(errorMsg);
    }
  };

  // Добавлиние размера с количеством
  const addSize = () => {
    const trimmed = newSize.trim().toUpperCase();
    if (!trimmed) {
      setErrorModal("⚠️ Введите размер (например: S, M, L или 92, 104, 152)");
      return;
    }
    
    if (state.sizes.includes(trimmed)) {
      setErrorModal(`⚠️ Размер "${trimmed}" уже добавлен`);
      return;
    }

    const stockValue = Number(newStock) || 0;
    if (stockValue < 0) {
      setErrorModal("⚠️ Количество не может быть отрицательным");
      return;
    }

    setState({
      ...state,
      sizes: [...state.sizes, trimmed],
      stockBySize: { ...state.stockBySize, [trimmed]: stockValue },
    });

    setNewSize("");
    setNewStock("");
  };

  // Удалиние размера
  const removeSize = (size: string) => {
    const newSizes = state.sizes.filter((s: string) => s !== size);
    const newStock = { ...state.stockBySize };
    delete newStock[size];
    setState({ ...state, sizes: newSizes, stockBySize: newStock });
  };

  // Измениние количества по размеру
  const updateStock = (size: string, value: number) => {
    if (value < 0) {
      setErrorModal("⚠️ Количество не может быть отрицательным");
      return;
    }
    setState({
      ...state,
      stockBySize: { ...state.stockBySize, [size]: value },
    });
  };

  const save = async () => {
    // Валидация
    if (!state.title.trim()) {
      setErrorModal("⚠️ Введите название костюма");
      return;
    }
    
    const priceValue = Number(state.price);
    if (!state.price || priceValue <= 0) {
      setErrorModal("⚠️ Укажите цену больше 0");
      return;
    }
    
    if (state.sizes.length === 0) {
      setErrorModal("⚠️ Добавьте хотя бы один размер с количеством");
      return;
    }

    setSaving(true);
    try {
      const urls = await uploadFiles();
      const payload = { 
        ...state, 
        price: priceValue,
        photos: [...(state.photos || []), ...urls] 
      };

      if (id && id !== "new") {
        await adminApi.put(`/api/admin/costumes/${id}`, payload);
      } else {
        await adminApi.post(`/api/admin/costumes`, payload);
      }

      setErrorModal("✅ Костюм успешно сохранён!");
      setTimeout(() => nav("/costumes"), 1500);
    } catch (err: any) {
      console.error("Ошибка при сохранении:", err);
      const errorMsg = err.response?.data?.error || err.message || "Неизвестная ошибка";
      setErrorModal(`❌ Ошибка при сохранении:\n${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = (index: number) => {
    const updated = [...(state.photos || [])];
    updated.splice(index, 1);
    setState({ ...state, photos: updated });
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: "center", padding: "40px", color: "var(--tg-theme-hint-color, #8e8e93)" }}>
          Загрузка данных костюма...
        </div>
      </div>
    );
  }

  return (
    <>
      {errorModal && (
        <div className="error-modal-overlay" onClick={() => setErrorModal(null)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-content">
              {errorModal}
            </div>
            <button 
              className="error-modal-btn" 
              onClick={() => setErrorModal(null)}
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h2>{id === "new" ? "➕ Новый костюм" : "✏️ Редактировать костюм"}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Название костюма *
            </label>
            <input
              placeholder="Например: Платье Золушка"
              value={state.title}
              onChange={(e) => setState({ ...state, title: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Цена за аренду (₽) *
            </label>
            <input
              placeholder="Введите цену"
              type="number"
              value={state.price}
              onChange={(e) => setState({ ...state, price: e.target.value })}
              min="1"
              step="100"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>
              📏 Размеры и количество *
            </label>

            {state.sizes.length > 0 && (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "12px", 
                marginBottom: "16px" 
              }}>
                {state.sizes.map((size: string) => (
                  <div
                    key={size}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 16px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "12px",
                      color: "#fff",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                    }}
                  >
                    <span style={{ fontWeight: "700", fontSize: "18px", minWidth: "50px" }}>
                      {size}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={state.stockBySize?.[size] || 0}
                      onChange={(e) => updateStock(size, Number(e.target.value))}
                      style={{ 
                        width: "70px", 
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "700",
                        textAlign: "center"
                      }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>шт.</span>
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      style={{
                        marginLeft: "auto",
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "#fff",
                        padding: "6px 12px",
                        fontSize: "13px"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Добавление нового размера */}
            <div style={{ 
              display: "flex", 
              gap: "12px", 
              alignItems: "flex-end",
              padding: "16px",
              background: "var(--tg-theme-bg-color, #f2f2f7)",
              borderRadius: "12px"
            }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "13px", color: "var(--tg-theme-hint-color, #8e8e93)", marginBottom: "4px", display: "block" }}>
                  Размер
                </label>
                <input
                  placeholder="S, M, L или 92, 104, 152"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSize()}
                  style={{ textTransform: "uppercase" }}
                />
              </div>
              <div style={{ width: "120px" }}>
                <label style={{ fontSize: "13px", color: "var(--tg-theme-hint-color, #8e8e93)", marginBottom: "4px", display: "block" }}>
                  Количество
                </label>
                <input
                  type="number"
                  placeholder="Введите кол-во"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                />
              </div>
              <button 
                type="button" 
                onClick={addSize}
                style={{
                  background: "#34c759",
                  padding: "12px 20px",
                  fontSize: "15px"
                }}
              >
                ➕ Добавить
              </button>
            </div>
            <p className="hint" style={{ marginTop: "8px" }}>
              💡 Размеры могут быть буквенными (S, M, L) или числовыми (92, 104, 152)
            </p>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              📐 Рост ребёнка
            </label>
            <input
              placeholder="Например: 110–130 см"
              value={state.heightRange || ""}
              onChange={(e) => setState({ ...state, heightRange: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              📝 Примечание
            </label>
            <textarea
              placeholder="Добавьте уточнение (например, «Есть шляпа в комплекте»)"
              value={state.notes || ""}
              onChange={(e) => setState({ ...state, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              📄 Описание костюма
            </label>
            <textarea
              placeholder="Введите подробное описание"
              value={state.description}
              onChange={(e) => setState({ ...state, description: e.target.value })}
              rows={4}
            />
          </div>

          <div style={{
            padding: "16px",
            background: state.available ? "rgba(52, 199, 89, 0.1)" : "rgba(255, 59, 48, 0.1)",
            borderRadius: "12px",
            border: `2px solid ${state.available ? "#34c759" : "#ff3b30"}`
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <div
                onClick={() => setState({ ...state, available: !state.available })}
                style={{
                  width: 50,
                  height: 26,
                  background: state.available ? "#34c759" : "#ff3b30",
                  borderRadius: 20,
                  position: "relative",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    background: "#fff",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 2,
                    left: state.available ? 26 : 2,
                    transition: "0.3s",
                  }}
                />
              </div>
              <span style={{ fontWeight: "600", fontSize: "15px" }}>
                {state.available ? "✅ Доступен пользователям" : "❌ Недоступен пользователям"}
              </span>
            </label>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>
              📸 Фотографии (до 5 шт.)
            </label>

            {state.photos?.length > 0 && (
              <div className="photo-grid">
                {state.photos.map((photo: string, index: number) => (
                  <div key={index} className="photo-preview">
                    <img src={photo} alt={`Фото ${index + 1}`} />
                    <button className="danger" onClick={() => removePhoto(index)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {previewUrls.length > 0 && (
              <div className="photo-grid">
                {previewUrls.map((url, i) => (
                  <div key={i} className="photo-preview new">
                    <img src={url} alt="new" />
                  </div>
                ))}
              </div>
            )}

            <input 
              type="file" 
              multiple 
              accept="image/png,image/jpeg,image/webp" 
              onChange={handleFileChange}
              style={{ marginTop: "12px" }}
            />
            <p className="hint">До 5 фото (JPG, PNG, WebP, ≤ 5 МБ каждое)</p>
          </div>

          <div className="actions" style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button onClick={save} disabled={saving} style={{ flex: 1 }}>
              {saving ? "Сохранение..." : "💾 Сохранить костюм"}
            </button>
            <button className="secondary" onClick={() => nav("/costumes")}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </>
  );
}