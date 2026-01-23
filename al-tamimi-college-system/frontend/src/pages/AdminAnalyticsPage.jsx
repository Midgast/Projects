import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { RiskPill } from "../ui/RiskPill.jsx";

export function AdminAnalyticsPage() {
  const { token, user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [risk, setRisk] = useState([]);
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
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div>
        <div className="text-xl font-extrabold tracking-tight">Analytics</div>
        <div className="mt-2 text-sm text-slate-500">This section is available for Admin role.</div>
      </div>
    );
  }

  const chartData = leaders.map((x) => ({ name: x.studentName.split(" ")[0], index: x.performanceIndex }));

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
              <div key={s.studentId} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div>
                  <div className="text-sm font-bold">{s.studentName}</div>
                  <div className="mt-1 text-xs text-slate-500">{s.groupName} · PI {s.performanceIndex}</div>
                </div>
                <RiskPill level={s.risk.level} score={s.risk.score} />
              </div>
            ))}
            {risk.length === 0 && <div className="text-sm text-slate-500">No students.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
