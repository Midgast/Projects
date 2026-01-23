import React, { useEffect, useState } from "react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";

export function NewsPage() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [error, setError] = useState("");

  async function reload() {
    const data = await apiFetch("/api/news", { token });
    setItems(data.items || []);
  }

  useEffect(() => {
    reload();
  }, [token]);

  const isAdmin = user?.role === "admin";

  return (
    <div>
      <div className="text-xl font-extrabold tracking-tight">Announcements</div>
      <div className="mt-1 text-sm text-slate-500">Admin can publish, everyone can read.</div>

      {isAdmin && (
        <div className="card mt-6 p-4">
          <div className="text-sm font-bold">Publish new</div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input className="rounded-xl border-slate-200 md:col-span-1" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="rounded-xl border-slate-200 md:col-span-1" value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="all">All</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
            </select>
            <button
              className="btn-primary md:col-span-1"
              onClick={async () => {
                setError("");
                try {
                  await apiFetch("/api/news", { token, method: "POST", body: { title, body, audience } });
                  setTitle("");
                  setBody("");
                  await reload();
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              Publish
            </button>
          </div>
          <textarea className="mt-3 w-full rounded-xl border-slate-200" rows={3} placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} />
          {error && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {items.map((n) => (
          <div key={n.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold">{n.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {new Date(n.published_at).toLocaleString()} · Audience: {n.audience}
                </div>
              </div>
              <span className="badge border border-slate-200 bg-slate-50 text-slate-700">{n.author_name || "System"}</span>
            </div>
            <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{n.body}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-500">No announcements.</div>}
      </div>
    </div>
  );
}
