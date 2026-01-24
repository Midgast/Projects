import React, { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, TrendingUp, CheckCircle, AlertTriangle as AlertIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";
import { RiskPill } from "../ui/RiskPill.jsx";
import { AssistantWidget } from "../ui/AssistantWidget.jsx";

function StatCard({ title, value, sub, icon: Icon }) {
  return (
    <div className="card reveal p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500">{title}</div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [studentStats, setStudentStats] = useState(null);
  const [teacherStats, setTeacherStats] = useState(null);
  const [news, setNews] = useState([]);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    (async () => {
      const n = await apiFetch("/api/news", { token });
      setNews(n.items || []);

      if (user?.role === "student") {
        const data = await apiFetch("/api/attendance/my", { token });
        setStudentStats(data.stats);
        setTeacherStats(null);
      } else if (user?.role === "teacher") {
        // Teacher stats
        const students = await apiFetch("/api/meta/students", { token });
        const attendance = await apiFetch("/api/attendance", { token });
        setTeacherStats({
          totalStudents: students.items?.length || 0,
          totalAttendance: attendance.items?.length || 0,
          avgAttendance: attendance.items?.length ? 
            Math.round((attendance.items.filter(a => a.status === 'present').length / attendance.items.length) * 100) : 0
        });
        setStudentStats(null);
      } else {
        setStudentStats(null);
        setTeacherStats(null);
      }
    })();
  }, [token, user?.role]);

  const perfSeries = useMemo(() => {
    const base = studentStats?.performanceIndex ?? 70;
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      arr.push({
        day: `D-${i}`,
        value: Math.max(0, Math.min(100, base + (i % 2 === 0 ? 2 : -3))),
      });
    }
    return arr;
  }, [studentStats]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-extrabold tracking-tight">{t("dashboard")}</div>
          <div className="mt-1 text-sm text-slate-300">
            {t("role_based_view_for")} {user?.role}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost" onClick={() => { setTourStep(0); setTourOpen(true); }}>
            {t("demo_tour")}
          </button>
          {user?.role === "student" && studentStats?.risk && (
            <span className={`badge-icon ${studentStats.risk.level}`}>
              {studentStats.risk.level === "green" ? <CheckCircle size={14} /> : studentStats.risk.level === "yellow" ? <AlertIcon size={14} /> : <AlertTriangle size={14} />}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {user?.role === "student" ? (
          <>
            <StatCard
              title={t("attendance")}
              value={`${Math.round((studentStats?.attendanceRate ?? 1) * 100)}%`}
              sub={`${studentStats?.attended ?? 0}/${studentStats?.total ?? 0} ${t("classes")}`}
              icon={CheckCircle2}
            />
            <StatCard
              title={t("performance")}
              value={studentStats?.performanceIndex?.toFixed(1) ?? "—"}
              sub={t("performance_index")}
              icon={TrendingUp}
            />
            <StatCard
              title={t("risk")}
              value={studentStats?.risk?.level.toUpperCase() ?? "—"}
              sub={t("risk_level")}
              icon={AlertTriangle}
            />
          </>
        ) : user?.role === "teacher" ? (
          <>
            <StatCard
              title={t("total_students")}
              value={teacherStats?.totalStudents ?? 0}
              sub={t("students")}
              icon={CheckCircle2}
            />
            <StatCard
              title={t("avg_attendance")}
              value={`${teacherStats?.avgAttendance ?? 0}%`}
              sub={t("attendance_rate")}
              icon={TrendingUp}
            />
            <StatCard
              title={t("total_records")}
              value={teacherStats?.totalAttendance ?? 0}
              sub={t("attendance_records")}
              icon={AlertTriangle}
            />
          </>
        ) : (
          <>
            <StatCard
              title={t("dashboard")}
              value="—"
              sub={t("admin_view")}
              icon={CheckCircle2}
            />
            <StatCard
              title={t("analytics")}
              value="—"
              sub={t("admin_only")}
              icon={TrendingUp}
            />
            <StatCard
              title={t("tools")}
              value="—"
              sub={t("admin_tools")}
              icon={AlertTriangle}
            />
          </>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card reveal p-4 md:col-span-2">
          <div className="text-sm font-bold">{t("weekly_trend_demo")}</div>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={perfSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-slate-300">{t("weekly_trend_sub")}</div>
        </div>

        <div className="card reveal p-4">
          <div className="text-sm font-bold">{t("latest_announcements")}</div>
          <div className="mt-3 space-y-3">
            {news.slice(0, 3).map((n, idx) => (
              <div key={n.id} className="reveal rounded-xl border border-white/10 bg-white/5 p-3" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="text-xs font-semibold text-slate-300">{new Date(n.published_at).toLocaleString()}</div>
                <div className="mt-1 text-sm font-bold">{n.title}</div>
                <div className="mt-1 text-xs text-slate-200 line-clamp-3">{n.body}</div>
              </div>
            ))}
            {news.length === 0 && <div className="text-sm text-slate-300">{t("no_announcements_yet")}</div>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {/* Quick Actions based on role */}
        {user?.role === "student" && (
          <div className="card p-4">
            <div className="text-sm font-bold">{t("quick_actions")}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => navigate("/schedule")} className="btn-ghost text-sm">
                {t("view_schedule")}
              </button>
              <button onClick={() => navigate("/badges")} className="btn-ghost text-sm">
                {t("my_badges")}
              </button>
              <button onClick={() => navigate("/gamification")} className="btn-ghost text-sm">
                {t("my_progress")}
              </button>
              <button onClick={() => navigate("/goals")} className="btn-ghost text-sm">
                {t("my_goals")}
              </button>
            </div>
          </div>
        )}

        {user?.role === "teacher" && (
          <div className="card p-4">
            <div className="text-sm font-bold">{t("teacher_actions")}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => navigate("/journal")} className="btn-ghost text-sm">
                {t("attendance_journal")}
              </button>
              <button onClick={() => navigate("/tools")} className="btn-ghost text-sm">
                {t("award_badges")}
              </button>
              <button onClick={() => navigate("/schedule")} className="btn-ghost text-sm">
                {t("view_schedule")}
              </button>
              <button onClick={() => navigate("/analytics")} className="btn-ghost text-sm">
                {t("group_analytics")}
              </button>
            </div>
          </div>
        )}

        <AssistantWidget />
      </div>

      {tourOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="card w-full max-w-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold">{t("tour_title")}</div>
                <div className="mt-1 text-sm text-slate-300">{t("mission_text")}</div>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setTourOpen(false)}>
                {t("close")}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className={`rounded-2xl border p-3 ${tourStep === 0 ? "border-brand-400/30 bg-brand-500/10" : "border-white/10 bg-white/5"}`}>
                <div className="text-sm font-extrabold">{t("tour_step_student")}</div>
              </div>
              <div className={`rounded-2xl border p-3 ${tourStep === 1 ? "border-brand-400/30 bg-brand-500/10" : "border-white/10 bg-white/5"}`}>
                <div className="text-sm font-extrabold">{t("tour_step_teacher")}</div>
              </div>
              <div className={`rounded-2xl border p-3 ${tourStep === 2 ? "border-brand-400/30 bg-brand-500/10" : "border-white/10 bg-white/5"}`}>
                <div className="text-sm font-extrabold">{t("tour_step_admin")}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button type="button" className="btn-ghost" disabled={tourStep === 0} onClick={() => setTourStep((s) => Math.max(0, s - 1))}>
                  {t("tour_back")}
                </button>
                <button type="button" className="btn-primary" disabled={tourStep === 2} onClick={() => setTourStep((s) => Math.min(2, s + 1))}>
                  {t("tour_next")}
                </button>
              </div>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  const path = tourStep === 0 ? "/student-goals" : tourStep === 1 ? "/journal" : "/analytics";
                  setTourOpen(false);
                  navigate(path);
                }}
              >
                {t("tour_go")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
