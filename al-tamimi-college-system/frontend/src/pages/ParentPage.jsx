import React, { useEffect, useState } from "react";
import { Users, Link2, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function ParentPage() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [relationship, setRelationship] = useState("mother");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const s = await apiFetch("/api/parents/students", { token });
      setStudents(s);
    })();
  }, [token]);

  async function handleLink() {
    setError("");
    try {
      await apiFetch("/api/parents/link", {
        token,
        method: "POST",
        body: { studentEmail: linkEmail, relationship },
      });
      setLinkEmail("");
      const s = await apiFetch("/api/parents/students", { token });
      setStudents(s);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadProgress(studentId) {
    setSelected(studentId);
    const p = await apiFetch(`/api/parents/student/${studentId}/progress`, { token });
    setProgress(p);
  }

  return (
    <div>
      <div className="text-xl font-extrabold tracking-tight">{t("parent_portal")}</div>
      <div className="mt-1 text-sm text-slate-300">{t("parent_sub")}</div>

      <div className="mt-6 card p-4">
        <div className="text-sm font-bold">{t("link_student")}</div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input className="rounded-xl" placeholder={t("student_email")} value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} />
          <select className="rounded-xl" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
            <option value="mother">{t("mother")}</option>
            <option value="father">{t("father")}</option>
            <option value="guardian">{t("guardian")}</option>
          </select>
          <button className="btn-primary" onClick={handleLink}>
            <Link2 size={16} className="inline mr-1" />
            {t("link")}
          </button>
        </div>
        {error && <div className="mt-2 text-xs text-rose-400">{error}</div>}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {students.map((s) => (
          <button
            key={s.id}
            className="card p-4 text-left"
            onClick={() => loadProgress(s.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">{s.full_name}</div>
                <div className="text-xs text-slate-400">{t("relationship")}: {t(s.relationship)}</div>
              </div>
              <TrendingUp size={16} />
            </div>
          </button>
        ))}
      </div>

      {selected && progress && (
        <div className="mt-6 card p-4">
          <div className="text-sm font-bold">{t("student_progress")}</div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className="text-xs text-slate-400">{t("attendance")}</div>
              <div className="mt-1 text-2xl font-extrabold">{progress.attendance}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">{t("performance_index")}</div>
              <div className="mt-1 text-2xl font-extrabold">{progress.performanceIndex.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">{t("risk")}</div>
              <div className="mt-1 text-2xl font-extrabold">{progress.risk.level.toUpperCase()}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-bold">{t("recent_grades")}</div>
            <div className="mt-2 space-y-2">
              {progress.recentGrades.map((g, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{g.subject}</span>
                  <span>{g.grade}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-bold">{t("announcements")}</div>
            <div className="mt-2 space-y-2">
              {progress.announcements.map((a, i) => (
                <div key={i} className="text-xs">
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-slate-400">{new Date(a.date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
