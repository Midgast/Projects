import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { RiskPill } from "../ui/RiskPill.jsx";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function AdminAnalyticsPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const [leaders, setLeaders] = useState([]);
  const [risk, setRisk] = useState([]);
  const [absentees, setAbsentees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    (async () => {
      setError("");
      if (!isAdmin) return;
      try {
        const l = await apiFetch("/api/analytics/leaders", { token });
        setLeaders(l.items || []);
        const r = await apiFetch("/api/analytics/risk", { token });
        setRisk(r.items || []);
        const a = await apiFetch("/api/analytics/absentees", { token });
        setAbsentees(a.items || []);
        const g = await apiFetch("/api/analytics/groups", { token });
        setGroups(g.items || []);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div>
        <div className="text-xl font-extrabold tracking-tight">{t("analytics")}</div>
        <div className="mt-2 text-sm text-slate-500">This section is available for Admin role.</div>
      </div>
    );
  }

  const chartData = leaders.map((x) => ({ name: x.studentName.split(" ")[0], index: x.performanceIndex }));
  const groupChart = groups.map((x) => ({ name: x.groupName, index: x.performanceIndex }));

  return (
    <div>
      <div className="text-xl font-extrabold tracking-tight">Admin Analytics</div>
      <div className="mt-1 text-sm text-slate-500">Leaders + risk list (minimal MVP)</div>

      {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="text-sm font-bold">Leaders</div>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="index" fill="#2563eb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-slate-500">Top students by performance index.</div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-bold">Risk indicator list</div>
          <div className="mt-3 space-y-2">
            {risk.slice(0, 8).map((s) => (
              <div key={s.studentId} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div>
                  <div className="text-sm font-bold">{s.studentName}</div>
                  <div className="mt-1 text-xs text-slate-300">{s.groupName} · PI {s.performanceIndex}</div>
                </div>
                <RiskPill level={s.risk.level} score={s.risk.score} />
              </div>
            ))}
            {risk.length === 0 && <div className="text-sm text-slate-500">No students.</div>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="text-sm font-bold">Top absentees (прогульщики)</div>
          <div className="mt-3 space-y-2">
            {absentees.slice(0, 10).map((s) => (
              <div key={s.studentId} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div>
                  <div className="text-sm font-bold">{s.studentName}</div>
                  <div className="mt-1 text-xs text-slate-300">
                    {s.groupName} · Absences {s.absences}/{s.total} ({Math.round((s.absenceRate || 0) * 100)}%)
                  </div>
                </div>
                <span className="badge border border-rose-400/20 bg-rose-500/10 text-rose-100">#{s.absences}</span>
              </div>
            ))}
            {absentees.length === 0 && <div className="text-sm text-slate-500">No data.</div>}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-bold">Top groups (рейтинг групп)</div>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="index" fill="#22c55e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-2">
            {groups.slice(0, 5).map((g) => (
              <div key={g.groupId} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div>
                  <div className="text-sm font-bold">{g.groupName}</div>
                  <div className="mt-1 text-xs text-slate-300">
                    PI {g.performanceIndex} · Attendance {Math.round((g.attendanceRate || 0) * 100)}% · Avg grade {Math.round(g.avgGrade || 0)}
                  </div>
                </div>
                <span className="badge border border-emerald-400/20 bg-emerald-500/10 text-emerald-100">{g.performanceIndex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
