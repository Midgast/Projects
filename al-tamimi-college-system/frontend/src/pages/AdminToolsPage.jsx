import React, { useEffect, useMemo, useState } from "react";
import { Megaphone, BarChart3 } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function AdminToolsPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();

  const isAdmin = user?.role === "admin";

  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [groupId, setGroupId] = useState(1);
  const [subjectId, setSubjectId] = useState(1);
  const [teacherId, setTeacherId] = useState(2);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:30");
  const [room, setRoom] = useState("A-12");
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      if (!isAdmin) return;
      const g = await apiFetch("/api/meta/groups", { token });
      setGroups(g.items || []);
      const s = await apiFetch("/api/meta/subjects", { token });
      setSubjects(s.items || []);
      const tchs = await apiFetch("/api/meta/teachers", { token });
      setTeachers(tchs.items || []);
    })();
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div>
        <div className="text-xl font-extrabold tracking-tight">{t("admin_tools")}</div>
        <div className="mt-2 text-sm text-slate-300">{t("admin_only")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xl font-extrabold tracking-tight">{t("admin_tools")}</div>
      <div className="mt-1 text-sm text-slate-300">{t("admin_tools_sub")}</div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card reveal p-4">
          <div className="text-sm font-bold">{t("add_schedule_item")}</div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-300">{t("schedule")}: {t("group")}</div>
              <select className="mt-1 w-full rounded-xl" value={groupId} onChange={(e) => setGroupId(Number(e.target.value))}>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-300">{t("subject")}</div>
              <select className="mt-1 w-full rounded-xl" value={subjectId} onChange={(e) => setSubjectId(Number(e.target.value))}>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-300">{t("teacher")}</div>
              <select className="mt-1 w-full rounded-xl" value={teacherId} onChange={(e) => setTeacherId(Number(e.target.value))}>
                {teachers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-300">{t("day")}</div>
                <select className="mt-1 w-full rounded-xl" value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}>
                  <option value={1}>{t("mon")}</option>
                  <option value={2}>{t("tue")}</option>
                  <option value={3}>{t("wed")}</option>
                  <option value={4}>{t("thu")}</option>
                  <option value={5}>{t("fri")}</option>
                  <option value={6}>{t("sat")}</option>
                  <option value={7}>{t("sun")}</option>
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-300">{t("room")}</div>
                <input className="mt-1 w-full rounded-xl" value={room} onChange={(e) => setRoom(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-300">{t("start")}</div>
                <input className="mt-1 w-full rounded-xl" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-300">{t("end")}</div>
                <input className="mt-1 w-full rounded-xl" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={async () => {
                setStatus("");
                try {
                  const res = await apiFetch("/api/schedule", {
                    token,
                    method: "POST",
                    body: {
                      groupId,
                      subjectId,
                      teacherId,
                      dayOfWeek,
                      startTime,
                      endTime,
                      room,
                    },
                  });
                  setStatus(`${t("created_ok")} #${res.id}`);
                } catch (e) {
                  setStatus(e.message);
                }
              }}
            >
              {t("create")}
            </button>

            {status && <div className="text-sm text-slate-200">{status}</div>}
          </div>
        </div>

        <div className="card reveal p-4">
          <div className="text-sm font-bold">{t("admin_quick_actions")}</div>
          <div className="mt-3 space-y-2">
            <div className="reveal rounded-2xl border border-white/10 bg-white/5 p-3" style={{ animationDelay: "0ms" }}>
              <div className="text-sm font-extrabold">{t("tip_news")}</div>
              <div className="mt-1 text-xs text-slate-300">{t("tip_news_sub")}</div>
            </div>
            <div className="reveal rounded-2xl border border-white/10 bg-white/5 p-3" style={{ animationDelay: "50ms" }}>
              <div className="text-sm font-extrabold">{t("tip_analytics")}</div>
              <div className="mt-1 text-xs text-slate-300">{t("tip_analytics_sub")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
