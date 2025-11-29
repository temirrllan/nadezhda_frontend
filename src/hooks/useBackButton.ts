import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import WebApp from "@twa-dev/sdk";


export function useBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("═══════════════════════════════════════");
    console.log("🔍 [DEBUG] useBackButton начал работу");
    console.log("📍 [DEBUG] Текущий путь:", location.pathname);
    console.log("📱 [DEBUG] Telegram WebApp версия:", WebApp.version);
    console.log("🖥️ [DEBUG] Платформа:", WebApp.platform);

    if (!WebApp.BackButton) {
      console.error("❌ [ERROR] WebApp.BackButton не существует!");
      console.log("💡 [HINT] Возможно, используется старая версия Telegram");
      console.log("💡 [HINT] Минимальная версия для BackButton: 6.1");
      return;
    }

    const backButton = WebApp.BackButton;
    console.log("✅ [DEBUG] BackButton объект найден:", backButton);

    console.log("🔧 [DEBUG] Доступные методы:", {
      show: typeof backButton.show,
      hide: typeof backButton.hide,
      onClick: typeof backButton.onClick,
      offClick: typeof backButton.offClick,
      isVisible: backButton.isVisible,
    });

    const isMainPage = location.pathname === "/";
    console.log("🏠 [DEBUG] Это главная страница?", isMainPage);

    if (isMainPage) {
      console.log("👻 [ACTION] Скрываем BackButton...");
      try {
        backButton.hide();
        console.log("✅ [SUCCESS] BackButton.hide() выполнен");
        console.log("👁️ [STATE] isVisible:", backButton.isVisible);
      } catch (e) {
        console.error("❌ [ERROR] Ошибка при скрытии:", e);
      }
    } else {
      console.log("👁️ [ACTION] Показываем BackButton...");
      
      try {
        backButton.show();
        console.log("✅ [SUCCESS] BackButton.show() выполнен");
        console.log("👁️ [STATE] isVisible:", backButton.isVisible);
      } catch (e) {
        console.error("❌ [ERROR] Ошибка при показе:", e);
      }

      const handleBackClick = () => {
        console.log("⬅️ [EVENT] BackButton нажата!");
        console.log("🔙 [ACTION] Переход назад...");
        navigate(-1);
      };

      try {
        backButton.onClick(handleBackClick);
        console.log("✅ [SUCCESS] onClick обработчик установлен");
      } catch (e) {
        console.error("❌ [ERROR] Ошибка установки onClick:", e);
      }

      return () => {
        console.log("🧹 [CLEANUP] Удаление обработчика...");
        try {
          backButton.offClick(handleBackClick);
          console.log("✅ [SUCCESS] Обработчик удалён");
        } catch (e) {
          console.error("❌ [ERROR] Ошибка удаления обработчика:", e);
        }
      };
    }

    console.log("═══════════════════════════════════════");
  }, [location.pathname, navigate]);
}

export function debugBackButton() {
  console.log("🔍 ========== DEBUG INFO ==========");
  console.log("WebApp:", WebApp);
  console.log("BackButton:", WebApp.BackButton);
  
  if (WebApp.BackButton) {
    console.log("BackButton.isVisible:", WebApp.BackButton.isVisible);
    console.log("Попытка показать...");
    WebApp.BackButton.show();
    console.log("После show() - isVisible:", WebApp.BackButton.isVisible);
  } else {
    console.error("BackButton недоступен!");
  }
  console.log("==================================");
}

if (typeof window !== "undefined") {
  (window as any).debugBackButton = debugBackButton;
  console.log("💡 Для отладки используй: window.debugBackButton()");
}