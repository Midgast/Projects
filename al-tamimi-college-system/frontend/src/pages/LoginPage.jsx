import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { useI18n } from "../app/i18n/I18nContext.jsx";
import { checkApiConnection } from "../app/api.js";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();

  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Проверяем соединение с API при загрузке страницы
  useEffect(() => {
    const testConnection = async () => {
      console.log('Testing API connection...');
      try {
        const isConnected = await checkApiConnection();
        console.log('API connection result:', isConnected);
        if (!isConnected) {
          setError("Backend not responding. Please restart backend server.");
        } else {
          console.log('✅ Backend is working!');
          // Если есть старая ошибка, очищаем ее
          if (error && error.includes("Backend not responding")) {
            setError("");
          }
        }
      } catch (err) {
        console.error('Connection test error:', err);
        setError("Connection error: " + err.message);
      }
    };
    
    // Добавляем задержку чтобы избежать ошибки с localStorage
    const timer = setTimeout(testConnection, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-12">
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="logo-fallback h-12 w-12 text-xs font-extrabold">AT</div>
                <img
                  src="/logo.png"
                  alt="AL TAMIMI"
                  className={`absolute inset-0 m-auto h-12 w-12 object-contain transition-opacity ${
                    logoLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setLogoLoaded(true)}
                />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight">{t("login_title")}</div>
                <div className="mt-1 text-sm text-slate-300">{t("login_subtitle")}</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-slate-300">{t("quick_role")}</div>
                <select className="rounded-xl" value={lang} onChange={(e) => setLang(e.target.value)}>
                  <option value="ru">{t("ru")}</option>
                  <option value="ky">{t("ky")}</option>
                </select>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  className="btn-ghost w-full"
                  onClick={() => {
                    setEmail("admin@admin.com");
                    setPassword("admin");
                  }}
                >
                  {t("admin")}
                </button>
                <button
                  type="button"
                  className="btn-ghost w-full"
                  onClick={() => {
                    setEmail("teacher@school.com");
                    setPassword("teacher");
                  }}
                >
                  {t("teacher")}
                </button>
                <button
                  type="button"
                  className="btn-ghost w-full"
                  onClick={() => {
                    setEmail("student@school.com");
                    setPassword("student");
                  }}
                >
                  {t("student")}
                </button>
                <button
                  type="button"
                  className="btn-ghost w-full"
                  onClick={() => {
                    setEmail("parent@school.com");
                    setPassword("parent");
                  }}
                >
                  {t("parent")}
                </button>
              </div>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setLoading(true);
                try {
                  await login(email, password);
                  navigate("/");
                } catch (err) {
                  setError(err.message || "Login failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div>
                <label className="text-xs font-semibold text-slate-300">{t("email")}</label>
                <input
                  className="mt-1 w-full rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">{t("password")}</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                  {error}
                  <button 
                    className="ml-2 underline text-xs"
                    onClick={() => {
                      setError("");
                      window.location.reload();
                    }}
                  >
                    Обновить страницу
                  </button>
                </div>
              )}

              <button className="btn-primary w-full" disabled={loading}>
                {loading ? t("signing_in") : t("sign_in")}
              </button>

              <div className="text-center text-xs text-slate-400">
                {t("demo_mode_note")}
              </div>
            </form>
          </div>

          <div className="card overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5 text-white">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-sm font-extrabold">{t("designed_for_judges")}</div>
                  <div className="mt-1 text-sm text-slate-300">{t("judges_subtitle")}</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-slate-300">{t("mission_title")}</div>
                  <div className="mt-2 text-sm text-slate-200">{t("mission_text")}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-slate-300">{t("risk_indicator")}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="badge border border-emerald-400/20 bg-emerald-500/10 text-emerald-100">{t("green")}</span>
                    <span className="badge border border-amber-400/20 bg-amber-500/10 text-amber-100">{t("yellow")}</span>
                    <span className="badge border border-rose-400/20 bg-rose-500/10 text-rose-100">{t("red")}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-slate-300">{t("mvp_modules")}</div>
                  <div className="mt-2 text-sm text-slate-200">Auth · Roles · Schedule · Attendance · Analytics · News · Badges · PDF/Excel</div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8" style={{ backgroundImage: "linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(79,70,229,0.30) 40%, rgba(147,51,234,0.25) 100%)" }}>
              <div className="text-sm font-extrabold">{t("identity_title")}</div>
              <div className="mt-1 text-sm text-slate-200/90">{t("identity_subtitle")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
