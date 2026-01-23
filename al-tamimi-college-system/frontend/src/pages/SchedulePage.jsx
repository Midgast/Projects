import React, { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

const dow = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

export function SchedulePage() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await apiFetch("/api/schedule", { token });
      setItems(data.items || []);
    })();
  }, [token]);

  const grouped = useMemo(() => {
    const m = new Map();
    items.forEach((it) => {
      const key = it.day_of_week;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(it);
    });
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [items]);

  return (
    <div>
      <div className="text-xl font-extrabold tracking-tight">{t("schedule_title")}</div>
      <div className="mt-1 text-sm text-slate-300">{t("schedule_sub")}</div>

      <div className="mt-6 space-y-4">
        {grouped.map(([day, list]) => (
          <div key={day} className="card p-4">
            <div className="text-sm font-bold">
              {day === 1
                ? t("mon")
                : day === 2
                  ? t("tue")
                  : day === 3
                    ? t("wed")
                    : day === 4
                      ? t("thu")
                      : day === 5
                        ? t("fri")
                        : day === 6
                          ? t("sat")
                          : day === 7
                            ? t("sun")
                            : dow[day] || `${t("day")} ${day}`}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {list.map((it, idx) => (
                <div key={it.id} className="reveal rounded-2xl border border-white/10 bg-white/5 p-4" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold">{it.subject_name}</div>
                      <div className="mt-1 text-xs text-slate-300">
                        {t("teacher_label")}: {it.teacher_name}
                      </div>
                      <div className="mt-1 text-xs text-slate-300">
                        {t("room_label")}: {it.room}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    {it.start_time} – {it.end_time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-300">{t("no_schedule")}</div>}
      </div>
    </div>
  );
}
