import React, { useEffect, useState } from "react";
import { Trophy, Star, Target, Flame } from "lucide-react";
import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function GamificationPage() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const d = await apiFetch("/api/gamification/me", { token });
      setData(d);
      setLoading(false);
    })();
  }, [token]);

  if (loading) return <div className="text-sm text-slate-300">{t("loading")}</div>;

  return (
    <div>
      <div className="text-xl font-extrabold tracking-tight">{t("gamification")}</div>
      <div className="mt-1 text-sm text-slate-300">{t("gamification_sub")}</div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card p-4">
          <div className="text-sm font-bold">{t("level")}</div>
          <div className="mt-2 text-3xl font-extrabold">{data.level.level}</div>
          <div className="mt-2 text-xs text-slate-400">{t("xp")}: {data.level.xp}</div>
        </div>
        <div className="card p-4 md:col-span-2">
          <div className="text-sm font-bold">{t("achievements")}</div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {data.achievements.map((a) => (
              <div key={a.code} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="text-sm font-bold">{a.title}</div>
                  <div className="text-xs text-slate-400">{a.description}</div>
                </div>
                <span className="ml-auto text-xs text-slate-400">+{a.points} {t("xp")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 card p-4">
        <div className="text-sm font-bold">{t("leaderboard")}</div>
        <div className="mt-3 space-y-2">
          {data.leaderboard.map((u, i) => (
            <div key={u.full_name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-slate-400">#{i + 1}</span>
                <span>{u.full_name}</span>
              </div>
              <div className="text-sm">
                <span className="font-bold">{u.level}</span> · {u.xp} {t("xp")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
