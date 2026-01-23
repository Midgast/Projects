import React, { useEffect, useState } from "react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch, apiUrl } from "../app/api.js";

export function JournalPage() {
  const { token, user } = useAuth();
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
        <div className="text-xl font-extrabold tracking-tight">Attendance Journal</div>
        <div className="mt-2 text-sm text-slate-500">This section is available for Teacher/Admin roles.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-extrabold tracking-tight">Attendance Journal</div>
          <div className="mt-1 text-sm text-slate-500">Demo view (groupId=1, subjectId=1)</div>
        </div>

        <div className="flex gap-2">
          <a
            className="btn-ghost"
            href={apiUrl(`/api/export/attendance.pdf?groupId=${groupId}&subjectId=${subjectId}`)}
            target="_blank"
            rel="noreferrer"
          >
            Export PDF
          </a>
          <a
            className="btn-primary"
            href={apiUrl(`/api/export/attendance.xlsx?groupId=${groupId}&subjectId=${subjectId}`)}
            target="_blank"
            rel="noreferrer"
          >
            Export Excel
          </a>
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Comment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-600">{r.date}</td>
                <td className="px-4 py-3 font-semibold">{r.student_name}</td>
                <td className="px-4 py-3">
                  <span className="badge border border-slate-200 bg-slate-50 text-slate-700">{r.status}</span>
                </td>
                <td className="px-4 py-3">{r.grade ?? ""}</td>
                <td className="px-4 py-3 text-slate-600">{r.comment ?? ""}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                  No records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        For hackathon: this is enough to show attendance journal + export. You can extend with filters later.
      </div>
    </div>
  );
}
