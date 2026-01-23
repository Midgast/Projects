import React, { useEffect, useState } from "react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";

const colorMap = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
};

export function BadgesPage() {
  const { token, user } = useAuth();
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
      <div className="text-xl font-extrabold tracking-tight">Badges</div>
      <div className="mt-1 text-sm text-slate-500">Motivation system: badges for attendance & performance.</div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="text-sm font-bold">My badges</div>
          <div className="mt-3 space-y-2">
            {myBadges.map((b) => (
              <div key={b.code} className={`rounded-2xl border p-3 ${colorMap[b.color] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
                <div className="text-sm font-extrabold">{b.title}</div>
                <div className="mt-1 text-xs opacity-90">{b.description}</div>
                <div className="mt-1 text-xs opacity-70">Awarded: {new Date(b.awarded_at).toLocaleString()}</div>
              </div>
            ))}
            {myBadges.length === 0 && <div className="text-sm text-slate-500">No badges yet.</div>}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-bold">Available badges</div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {allBadges.map((b) => (
              <div key={b.code} className={`rounded-2xl border p-3 ${colorMap[b.color] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold">{b.title}</div>
                  <span className="badge border border-white/40 bg-white/20 text-current">{b.code}</span>
                </div>
                <div className="mt-1 text-xs opacity-90">{b.description}</div>
              </div>
            ))}
            {allBadges.length === 0 && <div className="text-sm text-slate-500">No badges defined.</div>}
          </div>
        </div>
      </div>

      {user?.role !== "student" && (
        <div className="mt-4 text-xs text-slate-500">
          Teachers/Admin can award badges via API `POST /api/awards/award`.
        </div>
      )}
    </div>
  );
}
