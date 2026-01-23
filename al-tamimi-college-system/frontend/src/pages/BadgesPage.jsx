import React, { useEffect, useState } from "react";
import { Trophy, Star, Target, Flame } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

const colorMap = {
  emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  indigo: "border-indigo-400/20 bg-indigo-500/10 text-indigo-100",
  amber: "border-amber-400/20 bg-amber-500/10 text-amber-100",
};

export function BadgesPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);

  useEffect(() => {
    (async () => {
      const b = await apiFetch("/api/awards/badges", { token });
      setAllBadges(b.items || []);
      const mb = await apiFetch("/api/awards/my", { token });
      setMyBadges(mb.items || []);
    })();
  }, [token]);

  return (
    <div>
      <div className="text-xl font-extrabold tracking-tight">{t("badges_title")}</div>
      <div className="mt-1 text-sm text-slate-300">{t("badges_sub")}</div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-4 xl:sticky xl:top-6 xl:h-fit">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold">{t("my_badges")}</div>
            <span className="badge">{myBadges.length}</span>
          </div>

          <div className="mt-3 space-y-2">
            {myBadges.map((b, idx) => (
              <div
                key={b.code}
                className={`card-item reveal p-3 ${colorMap[b.color] || "text-slate-100"}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold">{b.title}</div>
                    <div className="mt-1 text-xs opacity-90">{b.description}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs opacity-70">{t("awarded")}: {new Date(b.awarded_at).toLocaleString()}</div>
              </div>
            ))}
            {myBadges.length === 0 && <div className="text-sm text-slate-300">{t("no_badges_yet")}</div>}
          </div>
        </div>

        <div className="card p-4 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold">{t("available_badges")}</div>
            <span className="badge">{allBadges.length}</span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {allBadges.map((b, idx) => (
              <div
                key={b.code}
                className={`card-item reveal p-4 ${colorMap[b.color] || "text-slate-100"}`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold">{b.title}</div>
                    <div className="mt-1 text-xs opacity-90">{b.description}</div>
                  </div>
                  <span className="badge border border-white/25 bg-white/10 text-current">{b.code}</span>
                </div>
              </div>
            ))}
            {allBadges.length === 0 && <div className="text-sm text-slate-300">{t("no_badges_defined")}</div>}
          </div>
        </div>
      </div>

      {user?.role !== "student" && (
        <div className="mt-4 text-xs text-slate-300">{t("teachers_can_award")}</div>
      )}
    </div>
  );
}
