import React, { useEffect, useMemo, useState } from "react";

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
              <select className="mt-1 w-full rounded-xl" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
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

        <div className="card p-4">
          <div className="text-sm font-bold">{t("teacher_quick_actions")}</div>
          <div className="mt-3 space-y-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-extrabold">{t("student")}: {selectedStudent?.full_name || "—"}</div>
              <div className="mt-1 text-xs text-slate-300">{t("tip_award_badge")}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-extrabold">{t("tip_journal")}</div>
              <div className="mt-1 text-xs text-slate-300">{t("tip_journal_sub")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
