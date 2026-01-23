import React, { useEffect, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch, downloadFile } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function JournalPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // Minimal demo assumptions:
  // - groupId=1 and subjectId=1 exist from seed.
  const groupId = 1;
  const subjectId = 1;

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const data = await apiFetch(`/api/attendance/journal?groupId=${groupId}&subjectId=${subjectId}`, { token });
        setRows(data.items || []);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [token]);

  const canSee = user?.role === "teacher" || user?.role === "admin";

  if (!canSee) {
    return (
      <div>
        <div className="text-xl font-extrabold tracking-tight">{t("journal_title")}</div>
        <div className="mt-2 text-sm text-slate-300">{t("journal_only")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-extrabold tracking-tight">{t("journal_title")}</div>
          <div className="mt-1 text-sm text-slate-300">{t("demo_view")}</div>
        </div>

        <div className="card reveal p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold">{t("attendance_journal")}</div>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={async () => { await downloadFile(`/api/export/attendance.pdf?groupId=${groupId}&subjectId=${subjectId}`, { token, filename: "attendance.pdf", }); }}>
                <Download size={16} />
              </button>
              <button type="button" className="btn-ghost" onClick={async () => { await downloadFile(`/api/export/attendance.xlsx?groupId=${groupId}&subjectId=${subjectId}`, { token, filename: "attendance.xlsx", }); }}>
                <FileSpreadsheet size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs font-bold text-slate-200">
            <tr>
              <th className="px-4 py-3">{t("date")}</th>
              <th className="px-4 py-3">{t("student_name")}</th>
              <th className="px-4 py-3">{t("status")}</th>
              <th className="px-4 py-3">{t("grade")}</th>
              <th className="px-4 py-3">{t("comment")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-200">{r.date}</td>
                <td className="px-4 py-3 font-semibold">{r.student_name}</td>
                <td className="px-4 py-3">
                  <span className="badge border border-white/10 bg-white/5 text-slate-100">{r.status}</span>
                </td>
                <td className="px-4 py-3">{r.grade ?? ""}</td>
                <td className="px-4 py-3 text-slate-200">{r.comment ?? ""}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-300" colSpan={5}>
                  {t("no_records")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-300">{t("journal_note")}</div>
    </div>
  );
}
