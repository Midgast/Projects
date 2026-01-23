import React, { useEffect, useMemo, useState } from "react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";

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
      <div className="text-xl font-extrabold tracking-tight">Schedule</div>
      <div className="mt-1 text-sm text-slate-500">Your weekly classes</div>

      <div className="mt-6 space-y-4">
        {grouped.map(([day, list]) => (
          <div key={day} className="card p-4">
            <div className="text-sm font-bold">{dow[day] || `Day ${day}`}</div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {list.map((it) => (
                <div key={it.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500">{it.start_time} - {it.end_time} · {it.room || "Room"}</div>
                  <div className="mt-1 text-sm font-extrabold">{it.subject_name}</div>
                  <div className="mt-1 text-xs text-slate-600">Teacher: {it.teacher_name}</div>
                  <div className="mt-1 text-xs text-slate-600">Group: {it.group_name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-500">No schedule items.</div>}
      </div>
    </div>
  );
}
