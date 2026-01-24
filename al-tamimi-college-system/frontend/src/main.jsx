import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nProvider } from "./app/i18n/I18nContext.jsx";
import { AuthProvider } from "./app/auth/AuthContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import "./styles/simple.css";
import { App } from "./app/App.jsx";

// Оптимизированный компонент приложения
const OptimizedApp = () => {
  useEffect(() => {
    // Простая инициализация без сложных зависимостей
    console.log('🚀 AL TAMIMI College System starting...');
    
    // Базовые оптимизации
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        console.log('✅ App initialized successfully');
      });
    }
  }, []);
  
  return <App />;
};

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <ToastProvider>
            <OptimizedApp />
          </ToastProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
