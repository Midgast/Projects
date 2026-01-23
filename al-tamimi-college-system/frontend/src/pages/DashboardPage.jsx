import React, { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";
import { RiskPill } from "../ui/RiskPill.jsx";
import { AssistantWidget } from "../ui/AssistantWidget.jsx";

function StatCard({ title, value, sub, icon: Icon }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500">{title}</div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-50 text-slate-700">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const [studentStats, setStudentStats] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    (async () => {
      const n = await apiFetch("/api/news", { token });
      setNews(n.items || []);

      if (user?.role === "student") {
        const data = await apiFetch("/api/attendance/my", { token });
        setStudentStats(data.stats);
      } else {
        setStudentStats(null);
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
          <div className="mt-1 text-sm text-slate-500">Role-based view for {user?.role}</div>
        </div>
        {user?.role === "student" && studentStats?.risk && <RiskPill level={studentStats.risk.level} score={studentStats.risk.score} />}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Attendance" value={user?.role === "student" ? `${Math.round((studentStats?.attendanceRate ?? 1) * 100)}%` : "—"} sub={user?.role === "student" ? `${studentStats?.attended ?? 0}/${studentStats?.total ?? 0} classes` : "Student-only"} icon={CheckCircle2} />
        <StatCard title="Performance Index" value={user?.role === "student" ? `${studentStats?.performanceIndex ?? 0}` : "—"} sub={user?.role === "student" ? `Avg grade: ${Math.round(studentStats?.avgGrade ?? 0)}` : "Student-only"} icon={TrendingUp} />
        <StatCard title="Risk" value={user?.role === "student" ? (studentStats?.risk?.level || "—") : "—"} sub={user?.role === "student" ? "Green/Yellow/Red" : "Student-only"} icon={AlertTriangle} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card p-4 md:col-span-2">
          <div className="text-sm font-bold">Weekly trend (demo)</div>
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
          <div className="mt-2 text-xs text-slate-500">For hackathon demo: shows KPI trend with minimal visuals.</div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-bold">Latest announcements</div>
          <div className="mt-3 space-y-3">
            {news.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-500">{new Date(n.published_at).toLocaleString()}</div>
                <div className="mt-1 text-sm font-bold">{n.title}</div>
                <div className="mt-1 text-xs text-slate-600 line-clamp-3">{n.body}</div>
              </div>
            ))}
            {news.length === 0 && <div className="text-sm text-slate-500">No announcements yet.</div>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AssistantWidget />
      </div>
    </div>
  );
}
