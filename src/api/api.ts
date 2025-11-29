import axios from "axios";
import WebApp from "@twa-dev/sdk";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
});

// ---------- КАТАЛОГ ----------
export async function getCostumes() {
  const res = await fetch(`${API_BASE}/api/costumes`);
  if (!res.ok) throw new Error("Ошибка загрузки костюмов");
  return res.json();
}

// ---------- БРОНИРОВАНИЕ ----------
export async function createBooking(data: any) {
  const res = await api.post("/api/bookings", data);
  return res.data;
}

// ---------- ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ ----------
export async function getUserInfo(tgId?: number) {
  const userId = tgId || WebApp.initDataUnsafe?.user?.id;

  if (!userId) {
    throw new Error("Telegram ID not found");
  }

  const res = await fetch(`${API_BASE}/api/users/me`, {
    headers: {
      "x-tg-id": String(userId),
      "x-tg-username": WebApp.initDataUnsafe?.user?.username || "",
      "x-tg-firstname": WebApp.initDataUnsafe?.user?.first_name || "",
      "x-tg-lastname": WebApp.initDataUnsafe?.user?.last_name || "",
    },
  });

  if (!res.ok) {
    throw new Error("Ошибка при получении данных пользователя");
  }

  return res.json();
}
