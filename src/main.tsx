import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import WebApp from "@twa-dev/sdk";
import "./index.css";
import "./App.css";
import "./styles/app.css";

console.log("🚀 Инициализация Telegram Web App...");

WebApp.ready();
WebApp.expand();

WebApp.enableClosingConfirmation();

if (WebApp.BackButton) {
  console.log("✅ BackButton доступен");
  WebApp.BackButton.hide(); 
} else {
  console.warn("⚠️ BackButton недоступен (возможно, старая версия Telegram)");
}

const initDataUnsafe = WebApp.initDataUnsafe;
const user = initDataUnsafe?.user;
console.log("👤 Telegram user:", user);
console.log("📱 Platform:", WebApp.platform);
console.log("🎨 Version:", WebApp.version);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);