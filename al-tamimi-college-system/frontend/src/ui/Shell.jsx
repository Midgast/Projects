import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, CalendarDays, LogOut, Medal, Newspaper, Users, Wrench, Target, Settings, Trophy, UserCheck, MessageCircle, Users2, BarChart, MessageSquare, Hammer } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { useI18n } from "../app/i18n/I18nContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { SocialModal } from "../components/SocialModal.jsx";
import { AnalyticsModal } from "../components/AnalyticsModal.jsx";
import { EnhancedAnalyticsModal } from "../components/EnhancedAnalyticsModal.jsx";
import { ChatModal } from "../components/ChatModal.jsx";
import { TeacherToolsModal } from "../components/TeacherToolsModal.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { getInitials, getColorFromRole } from "../lib/utils.js";

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${
          isActive
            ? "bg-white/10 text-white shadow-lg"
            : "text-slate-300 hover:bg-white/5 hover:text-white hover:scale-105"
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
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();
  const { success, error } = useToast();
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isEnhancedAnalyticsOpen, setIsEnhancedAnalyticsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTeacherToolsOpen, setIsTeacherToolsOpen] = useState(false);
  const [logoOk, setLogoOk] = useState(true);

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";
  const isParent = user?.role === "parent";

  const handleLogout = () => {
    logout();
    navigate("/login");
    success("Вы успешно вышли из системы");
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6">
        <aside className="hidden w-72 shrink-0 md:block">
          {/* Desktop sidebar content */}
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
              {isAdmin && <NavItem to="/admin-tools" icon={Settings} label={t("admin_tools")} />}
              <NavItem to="/schedule" icon={CalendarDays} label={t("schedule")} />
              {(isTeacher || isAdmin) && <NavItem to="/journal" icon={Users} label={t("journal")} />}
              <NavItem to="/news" icon={Newspaper} label={t("announcements")} />
              <NavItem to="/badges" icon={Medal} label={t("badges")} />
              {isAdmin && <NavItem to="/analytics" icon={BarChart3} label={t("analytics")} />}
              
              {/* Social Network Modal Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-300 transition-all hover:bg-blue-500/20 hover:text-blue-200"
                onClick={() => setIsSocialOpen(true)}
              >
                <Users2 size={18} />
                {t("social_network")}
              </motion.button>

              {/* Chat Modal Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 hover:text-cyan-200"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageSquare size={18} />
                {t("chat")}
              </motion.button>

              {/* Teacher Tools Modal Button */}
              {(isTeacher || isAdmin) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-300 transition-all hover:bg-orange-500/20 hover:text-orange-200"
                  onClick={() => setIsTeacherToolsOpen(true)}
                >
                  <Hammer size={18} />
                  {t("teacher_tools")}
                </motion.button>
              )}

              {/* Analytics Modal Button */}
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-300 transition-all hover:bg-green-500/20 hover:text-green-200"
                  onClick={() => setIsEnhancedAnalyticsOpen(true)}
                >
                  <BarChart size={18} />
                  Enhanced Analytics
                </motion.button>
              )}
            </nav>
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

        {/* Mobile Floating Buttons */}
        <div className="md:hidden fixed bottom-4 right-4 z-40 flex flex-col gap-2">
          {/* Chat Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="btn-ghost rounded-full p-3 shadow-lg border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-400"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageSquare size={18} />
          </motion.button>

          {/* Teacher Tools Button */}
          {(isTeacher || isAdmin) && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn-ghost rounded-full p-3 shadow-lg border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-400"
              onClick={() => setIsTeacherToolsOpen(true)}
            >
              <Hammer size={18} />
            </motion.button>
          )}

          {/* Analytics Button */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn-ghost rounded-full p-3 shadow-lg border-green-500/20 hover:bg-green-500/10 hover:text-green-400"
              onClick={() => setIsEnhancedAnalyticsOpen(true)}
            >
              <BarChart size={18} />
            </motion.button>
          )}

          {/* Social Network Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="btn-ghost rounded-full p-3 shadow-lg border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-400"
            onClick={() => setIsSocialOpen(true)}
          >
            <Users2 size={18} />
          </motion.button>
        </div>
      </div>

      {/* Modals */}
      <SocialModal isOpen={isSocialOpen} onClose={() => setIsSocialOpen(false)} />
      <AnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
      <EnhancedAnalyticsModal isOpen={isEnhancedAnalyticsOpen} onClose={() => setIsEnhancedAnalyticsOpen(false)} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <TeacherToolsModal isOpen={isTeacherToolsOpen} onClose={() => setIsTeacherToolsOpen(false)} />
    </div>
  );
}
