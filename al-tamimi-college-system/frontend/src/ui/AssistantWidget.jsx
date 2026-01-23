import React, { useEffect, useMemo, useState } from "react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";
import { RiskPill } from "./RiskPill.jsx";

function severityToPill(severity) {
  if (severity === "green" || severity === "yellow" || severity === "red") return severity;
  return "yellow";
}

export function AssistantWidget() {
  const { token } = useAuth();
  const { t } = useI18n();

  const [tab, setTab] = useState("insights");
  const [cards, setCards] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const data = await apiFetch("/api/assistant/insights", { token });
        setCards(data.cards || []);
        setSuggestions(data.suggestions || []);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [token]);

  const quick = useMemo(() => suggestions.slice(0, 5), [suggestions]);

  async function send(message) {
    const msg = (message || "").trim();
    if (!msg) return;
    setError("");
    setChat((c) => [...c, { role: "user", text: msg }]);
    setInput("");

    try {
      const res = await apiFetch("/api/assistant/chat", { token, method: "POST", body: { message: msg } });
      setChat((c) => [...c, { role: "assistant", text: res.answer }]);
      if (res.suggestions) setSuggestions(res.suggestions);
    } catch (e) {
      setChat((c) => [...c, { role: "assistant", text: `Error: ${e.message}` }]);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-extrabold">{t("ai_assistant")}</div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn-ghost px-3 py-1.5 ${tab === "insights" ? "bg-white/10" : ""}`}
            onClick={() => setTab("insights")}
          >
            {t("insights")}
          </button>
          <button
            type="button"
            className={`btn-ghost px-3 py-1.5 ${tab === "chat" ? "bg-white/10" : ""}`}
            onClick={() => setTab("chat")}
          >
            {t("chat")}
          </button>
        </div>
      </div>

      {error && <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div>}

      {tab === "insights" && (
        <div className="mt-4 space-y-3">
          {cards.map((c, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold">{c.title}</div>
                  <div className="mt-1 text-sm text-slate-200 whitespace-pre-wrap">{c.message}</div>
                </div>
                <RiskPill level={severityToPill(c.severity)} />
              </div>
              {Array.isArray(c.actions) && c.actions.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {c.actions.slice(0, 3).map((a) => (
                    <div key={a} className="text-xs text-slate-300">
                      - {a}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {cards.length === 0 && <div className="text-sm text-slate-300">No insights.</div>}
        </div>
      )}

      {tab === "chat" && (
        <div className="mt-4">
          <div className="space-y-2">
            {chat.map((m, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-3 text-sm ${
                  m.role === "user" ? "border-brand-400/20 bg-brand-500/10 text-brand-50" : "border-white/10 bg-white/5 text-slate-100"
                }`}
              >
                {m.text}
              </div>
            ))}
            {chat.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                {t("ask_placeholder")}
              </div>
            )}
          </div>

          {quick.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {quick.map((s) => (
                <button key={s} type="button" className="btn-ghost px-3 py-1.5" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <input
              className="w-full rounded-xl"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("ask_placeholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") send(input);
              }}
            />
            <button type="button" className="btn-primary" onClick={() => send(input)}>
              {t("send")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
