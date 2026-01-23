import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle, AlertTriangle as AlertIcon, AlertTriangle, Trophy } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch, downloadFile } from "../app/api.js";
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

  const [planOpen, setPlanOpen] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");
  const [planData, setPlanData] = useState(null);

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
        <div className="mt-2 text-sm text-slate-300">{t("admin_only_section")}</div>
      </div>
    );
  }

  const chartData = leaders.map((x) => ({ name: x.studentName.split(" ")[0], index: x.performanceIndex }));
  const groupChart = groups.map((x) => ({ name: x.groupName, index: x.performanceIndex }));

  async function runPlan(studentId) {
    setPlanError("");
    setPlanLoading(true);
    setPlanOpen(true);
    try {
      const data = await apiFetch("/api/assistant/intervention-plan", { token, method: "POST", body: { studentId } });
      setPlanData(data);
    } catch (e) {
      setPlanError(e.message);
      setPlanData(null);
    } finally {
      setPlanLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-extrabold tracking-tight">{t("admin_analytics_title")}</div>
          <div className="mt-1 text-sm text-slate-300">{t("admin_analytics_sub")}</div>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={async () => {
            await downloadFile("/api/export/weekly-report.pdf", { token, filename: "weekly-college-report.pdf" });
          }}
        >
          {t("download_weekly_report")}
        </button>
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div>}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="text-sm font-bold">{t("leaders")}</div>
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
          <div className="mt-2 text-xs text-slate-300">{t("top_students_by_pi")}</div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-bold">{t("risk_list")}</div>
          <div className="mt-3 space-y-2">
            {risk.slice(0, 8).map((s) => (
              <div key={s.studentId} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div>
                  <div className="text-sm font-bold">{s.studentName}</div>
                  <div className="mt-1 text-xs text-slate-300">{s.groupName} · PI {s.performanceIndex}</div>
                  <div className="mt-2">
                    <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => runPlan(s.studentId)}>
                      {t("run_intervention")}
                    </button>
                  </div>
                </div>
                <span className={`badge-icon ${s.risk.level}`}>
                  {s.risk.level === "green" ? <CheckCircle size={14} /> : s.risk.level === "yellow" ? <AlertIcon size={14} /> : <AlertTriangle size={14} />}
                </span>
              </div>
            ))}
            {risk.length === 0 && <div className="text-sm text-slate-300">{t("no_students")}</div>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card reveal p-4">
          <div className="text-sm font-bold">{t("top_absentees")}</div>
          <div className="mt-3 space-y-2">
            {absentees.slice(0, 5).map((s, idx) => (
              <div key={s.studentId} className="reveal flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3" style={{ animationDelay: `${idx * 50}ms` }}>
                <div>
                  <div className="text-sm font-bold">{s.studentName}</div>
                  <div className="mt-1 text-xs text-slate-300">{s.groupName}</div>
                </div>
              </div>
            ))}
            {absentees.length === 0 && <div className="text-sm text-slate-300">{t("no_students")}</div>}
          </div>
        </div>

        <div className="card reveal p-4">
          <div className="text-sm font-bold">{t("top_groups")}</div>
          <div className="mt-3 space-y-2">
            {groups.slice(0, 5).map((g, idx) => (
              <div key={g.groupId} className="reveal flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3" style={{ animationDelay: `${idx * 50}ms` }}>
                <div>
                  <div className="text-sm font-bold">{g.groupName}</div>
                  <div className="mt-1 text-xs text-slate-300">{t("avg_pi")}: {g.performanceIndex.toFixed(1)}</div>
                </div>
              </div>
            ))}
            {groups.length === 0 && <div className="text-sm text-slate-300">{t("no_groups")}</div>}
          </div>
        </div>
      </div>

      {planOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="card w-full max-w-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold">{t("intervention_plan")}</div>
                {planData?.studentName && (
                  <div className="mt-1 text-sm text-slate-300">
                    {planData.studentName}{planData.groupName ? ` · ${planData.groupName}` : ""}
                  </div>
                )}
              </div>
              <button type="button" className="btn-ghost" onClick={() => setPlanOpen(false)}>
                {t("close")}
              </button>
            </div>

            {planLoading && <div className="mt-4 text-sm text-slate-300">...</div>}
            {planError && (
              <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                {planError}
              </div>
            )}

            {planData && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-bold">{t("intervention_plan")}</div>
                  <div className="mt-3 space-y-2">
                    {(planData.plan || []).map((x, idx) => (
                      <div key={idx} className="text-sm text-slate-100">
                        {idx + 1}. {x}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => navigator.clipboard?.writeText((planData.plan || []).map((x, i) => `${i + 1}. ${x}`).join("\n"))}
                    >
                      {t("copy")}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-bold">{t("notification_draft")}</div>
                  <textarea className="mt-3 w-full rounded-xl" rows={8} readOnly value={planData.notification?.body || ""} />
                  <div className="mt-3">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => navigator.clipboard?.writeText(planData.notification?.body || "")}
                    >
                      {t("copy")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
