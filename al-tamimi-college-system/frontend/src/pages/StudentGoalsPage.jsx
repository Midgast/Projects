import React, { useEffect, useState } from "react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";
import { RiskPill } from "../ui/RiskPill.jsx";

function loadGoals() {
  try {
    const raw = localStorage.getItem("altamimi_student_goals");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function StudentGoalsPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();

  const [cards, setCards] = useState([]);
  const [goals, setGoals] = useState(() => loadGoals());
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    localStorage.setItem("altamimi_student_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    (async () => {
      if (user?.role !== "student") return;
      const data = await apiFetch("/api/assistant/insights", { token });
      setCards(data.cards || []);
    })();
  }, [token, user?.role]);

  if (user?.role !== "student") {
    return (
      <div>
        <div className="text-xl font-extrabold tracking-tight">{t("student_goals")}</div>
        <div className="mt-2 text-sm text-slate-300">{t("student_only")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-extrabold tracking-tight">{t("student_goals")}</div>
          <div className="mt-1 text-sm text-slate-300">{t("student_goals_sub")}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="text-sm font-bold">{t("ai_recommendations")}</div>
          <div className="mt-3 space-y-3">
            {cards.map((c, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold">{c.title}</div>
                    <div className="mt-1 text-sm text-slate-200">{c.message}</div>
                  </div>
                  <RiskPill level={c.severity} />
                </div>
              </div>
            ))}
            {cards.length === 0 && <div className="text-sm text-slate-300">{t("no_data")}</div>}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-bold">{t("my_goals")}</div>
          <div className="mt-3 flex gap-2">
            <input
              className="w-full rounded-xl"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder={t("add_goal_placeholder")}
            />
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                const g = newGoal.trim();
                if (!g) return;
                setGoals((prev) => [{ id: crypto.randomUUID?.() || String(Date.now()), text: g, done: false }, ...prev]);
                setNewGoal("");
              }}
            >
              +
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {goals.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={!!g.done}
                    onChange={() =>
                      setGoals((prev) => prev.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)))
                    }
                  />
                  <span className={g.done ? "line-through text-slate-400" : "text-slate-100"}>{g.text}</span>
                </label>
                <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => setGoals((p) => p.filter((x) => x.id !== g.id))}>
                  {t("delete")}
                </button>
              </div>
            ))}
            {goals.length === 0 && <div className="text-sm text-slate-300">{t("no_goals")}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
