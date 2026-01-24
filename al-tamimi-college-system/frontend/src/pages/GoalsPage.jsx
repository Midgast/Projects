import React, { useEffect, useState } from "react";
import { Plus, Target, TrendingUp, Calendar } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function GoalsPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();
  
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "student") return;
    
    // Mock goals for demo
    setGoals([
      {
        id: 1,
        title: "Посещать все занятия",
        description: "Цель: 100% посещаемость",
        progress: 85,
        deadline: "2025-08-31",
        status: "active"
      },
      {
        id: 2,
        title: "Повысить средний балл",
        description: "Цель: 85+ средний балл",
        progress: 78,
        deadline: "2025-09-15",
        status: "active"
      }
    ]);
  }, [user?.role]);

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    
    setLoading(true);
    // Mock add
    setTimeout(() => {
      setGoals([...goals, {
        id: Date.now(),
        title: newGoal,
        description: "Новая цель",
        progress: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "active"
      }]);
      setNewGoal("");
      setLoading(false);
    }, 500);
  };

  if (user?.role !== "student") {
    return (
      <div className="card p-6">
        <div className="text-center text-slate-400">
          {t("student_only")}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("student_goals")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("student_goals_sub")}</p>
      </div>

      {/* Add Goal */}
      <div className="card p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder={t("add_goal_placeholder")}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-slate-500 focus:border-brand-400/30 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            onKeyPress={(e) => e.key === "Enter" && addGoal()}
          />
          <button
            onClick={addGoal}
            disabled={loading || !newGoal.trim()}
            className="btn-primary"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="mt-6 space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-brand-400" />
                  <h3 className="font-semibold">{goal.title}</h3>
                </div>
                <p className="mt-1 text-sm text-slate-400">{goal.description}</p>
                
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {goal.deadline}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    {goal.progress}%
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <div className="card p-6 text-center">
            <div className="text-slate-400">{t("no_goals")}</div>
          </div>
        )}
      </div>
    </div>
  );
}
