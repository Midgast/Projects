import React, { useEffect, useMemo, useState } from "react";
import { Flame, FileSpreadsheet, Trophy } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function TeacherToolsPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();

  const [students, setStudents] = useState([]);
  const [badges, setBadges] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [badgeCode, setBadgeCode] = useState("");
  const [status, setStatus] = useState("");

  const [planOpen, setPlanOpen] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");
  const [planData, setPlanData] = useState(null);

  const canSee = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    (async () => {
      if (!canSee) return;
      const s = await apiFetch("/api/meta/students", { token });
      setStudents(s.items || []);
      const b = await apiFetch("/api/awards/badges", { token });
      setBadges(b.items || []);
    })();
  }, [token, canSee]);

  useEffect(() => {
    if (!studentId && students[0]?.id) setStudentId(String(students[0].id));
  }, [students, studentId]);

  useEffect(() => {
    if (!badgeCode && badges[0]?.code) setBadgeCode(String(badges[0].code));
  }, [badges, badgeCode]);

  const selectedStudent = useMemo(() => students.find((s) => String(s.id) === String(studentId)), [students, studentId]);

  async function runPlan() {
    if (!studentId) return;
    setPlanError("");
    setPlanLoading(true);
    setPlanOpen(true);
    try {
      const data = await apiFetch("/api/assistant/intervention-plan", {
        token,
        method: "POST",
        body: { studentId: Number(studentId) },
      });
      setPlanData(data);
    } catch (e) {
      setPlanError(e.message);
      setPlanData(null);
    } finally {
      setPlanLoading(false);
    }
  }

  if (!canSee) {
    return (
      <div>
        <div className="text-xl font-extrabold tracking-tight">{t("teacher_tools")}</div>
        <div className="mt-2 text-sm text-slate-300">{t("teacher_only")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xl font-extrabold tracking-tight">{t("teacher_tools")}</div>
      <div className="mt-1 text-sm text-slate-300">{t("teacher_tools_sub")}</div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="text-sm font-bold">{t("award_badge")}</div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-300">{t("student")}</div>
              <select className="mt-1 w-full rounded-xl" value={studentId} onChange={(e) => setStudentId(Number(e.target.value))}>
                <option value="">{t("select_student")}</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-300">{t("badges")}</div>
              <select className="mt-1 w-full rounded-xl" value={badgeCode} onChange={(e) => setBadgeCode(e.target.value)}>
                {badges.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn-primary"
              type="button"
              onClick={async () => {
                setStatus("");
                try {
                  await apiFetch("/api/awards/award", {
                    token,
                    method: "POST",
                    body: { userId: Number(studentId), badgeCode },
                  });
                  setStatus(t("awarded_ok"));
                } catch (e) {
                  setStatus(e.message);
                }
              }}
            >
              {t("award")}
            </button>

            {status && <div className="text-sm text-slate-200">{status}</div>}
          </div>
        </div>

        <div className="card reveal p-4">
          <div className="text-sm font-bold">{t("student_selection")}</div>
          <div className="mt-3">
            <select className="w-full rounded-xl" value={studentId} onChange={(e) => setStudentId(Number(e.target.value))}>
              <option value="">{t("select_student")}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-extrabold">{t("student")}: {selectedStudent?.full_name || "—"}</div>
            <div className="mt-1 text-xs text-slate-300">{t("tip_award_badge")}</div>
            <div className="mt-3">
              <button type="button" className="btn-ghost" onClick={runPlan}>
                {t("run_intervention")}
              </button>
            </div>
            <div className="mt-2 flex justify-end">
              <span className="badge-icon indigo"><Flame size={14} /></span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card reveal p-4">
          <div className="text-sm font-bold">{t("teacher_quick_actions")}</div>
          <div className="mt-3 space-y-2">
            <div className="reveal rounded-2xl border border-white/10 bg-white/5 p-3" style={{ animationDelay: "0ms" }}>
              <div className="text-sm font-extrabold">{t("tip_journal")}</div>
              <div className="mt-1 text-xs text-slate-300">{t("tip_journal_sub")}</div>
            </div>
            <div className="reveal rounded-2xl border border-white/10 bg-white/5 p-3" style={{ animationDelay: "50ms" }}>
              <div className="text-sm font-extrabold">{t("tip_badges")}</div>
              <div className="mt-1 text-xs text-slate-300">{t("tip_badges_sub")}</div>
            </div>
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
            {planError && <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{planError}</div>}

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
                    <button type="button" className="btn-ghost" onClick={() => navigator.clipboard?.writeText(planData.notification?.body || "")}>
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
