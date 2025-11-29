import axios from "axios";
import WebApp from "@twa-dev/sdk";

//Базовый адрес API
export const API_BASE =
  (import.meta.env.VITE_API_URL?.replace(/\/+$/, "")) ||
  "http://localhost:4000";

//Создаём инстанс axios для админ-запросов
export const adminApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

//Interceptor для автоматического добавления x-tg-id в каждый запрос
adminApi.interceptors.request.use(
  (config) => {
    const tgId = WebApp.initDataUnsafe?.user?.id;
    if (tgId) {
      config.headers["x-tg-id"] = String(tgId);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// формируем полный URL к файлу
export function getFullUrl(path?: string): string {
  if (!path) return "https://via.placeholder.com/400x300?text=Нет+фото";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;
}

// функция загрузки фото (до 5 файлов, 5 МБ каждый)
export async function uploadPhotos(files: FileList) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("photos", files[i]);
  }

  const res = await adminApi.post("/api/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; 
}