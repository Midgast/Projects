import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, CalendarDays, LogOut, Medal, Newspaper, Users, Wrench, Target, Settings, Trophy, UserCheck } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { useI18n } from "../app/i18n/I18nContext.jsx";

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`
      }
      end
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export function Shell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoOk, setLogoOk] = useState(true);
  const { lang, setLang, t } = useI18n();

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";
  const isParent = user?.role === "parent";

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="card p-4">
            <Link to="/" className="block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {logoOk ? (
                    <img
                      src="/logo.png"
                      alt="AL TAMIMI"
                      className="h-9 w-9 object-contain"
                      onError={() => setLogoOk(false)}
                    />
                  ) : (
                    <div className="logo-fallback h-9 w-9 text-[10px] font-extrabold">AT</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-extrabold tracking-tight">AL TAMIMI</div>
                  <div className="text-xs text-slate-300">{t("login_title")}</div>
                </div>
              </div>
            </Link>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-slate-300">{t("signed_in_as")}</div>
              <div className="mt-1 text-sm font-bold text-white">{user?.fullName}</div>
              <div className="mt-1 inline-flex items-center gap-2 text-xs text-slate-300">
                <Users size={14} />
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>

            <nav className="mt-4 space-y-1">
              <NavItem to="/" icon={BarChart3} label={t("dashboard")} />
              {isStudent && <NavItem to="/student-goals" icon={Target} label={t("student_goals")}/>}
              {(isTeacher || isAdmin) && <NavItem to="/teacher-tools" icon={Wrench} label={t("teacher_tools")} />}
              {isAdmin && <NavItem to="/admin-tools" icon={Settings} label={t("admin_tools")} />}
              <NavItem to="/schedule" icon={CalendarDays} label={t("schedule")} />
              {(isTeacher || isAdmin) && <NavItem to="/journal" icon={Users} label={t("journal")} />}
              <NavItem to="/news" icon={Newspaper} label={t("announcements")} />
              <NavItem to="/badges" icon={Medal} label={t("badges")} />
              {isAdmin && <NavItem to="/analytics" icon={BarChart3} label={t("analytics")} />}
              <NavItem to="/gamification" icon={Trophy} label={t("gamification")} />
              {isParent && <NavItem to="/parent" icon={UserCheck} label={t("parent_portal")} />}
            </nav>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-slate-300">{t("language")}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`btn-ghost w-full ${lang === "ru" ? "bg-white/10" : ""}`}
                  onClick={() => setLang("ru")}
                >
                  {t("ru")}
                </button>
                <button
                  type="button"
                  className={`btn-ghost w-full ${lang === "ky" ? "bg-white/10" : ""}`}
                  onClick={() => setLang("ky")}
                >
                  {t("ky")}
                </button>
              </div>
            </div>

            <button
              className="btn-ghost mt-4 w-full"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={16} />
              {t("log_out")}
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="card p-4 md:p-6">
            <Outlet />
          </div>
          <div className="mt-4 text-center text-xs text-slate-400">
            {t("footer_tagline")}
          </div>
        </main>
      </div>
    </div>
  );
}
