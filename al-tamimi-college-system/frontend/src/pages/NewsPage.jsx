import React, { useEffect, useState } from "react";
import { Megaphone, BarChart3, Trash2 } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function NewsPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [error, setError] = useState("");

  // Poll form
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollAnonymous, setPollAnonymous] = useState(true);
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollEndsAt, setPollEndsAt] = useState("");

  // Analytics modal
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");

  async function reload() {
    const data = await apiFetch("/api/news", { token });
    setItems(data.items || []);
  }

  useEffect(() => {
    reload();
  }, [token]);

  const isAdmin = user?.role === "admin";

  // Add poll option
  function addPollOption() {
    setPollOptions([...pollOptions, ""]);
  }
  function updatePollOption(i, v) {
    const upd = [...pollOptions];
    upd[i] = v;
    setPollOptions(upd);
  }
  function removePollOption(i) {
    setPollOptions(pollOptions.filter((_, idx) => idx !== i));
  }

  // Publish with optional poll
  async function handlePublish() {
    setError("");
    try {
      const res = await apiFetch("/api/news", { token, method: "POST", body: { title, body, audience } });
      const newsId = res.id;
      if (pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
        await apiFetch("/api/polls", {
          token,
          method: "POST",
          body: {
            news_id: newsId,
            question: pollQuestion,
            options: pollOptions.filter(o => o.trim()),
            anonymous: pollAnonymous,
            multiple: pollMultiple,
            ends_at: pollEndsAt || null,
          },
        });
      }
      setTitle("");
      setBody("");
      setPollQuestion("");
      setPollOptions(["", ""]);
      setPollAnonymous(true);
      setPollMultiple(false);
      setPollEndsAt("");
      await reload();
    } catch (e) {
      setError(e.message);
    }
  }

  // Vote
  async function handleVote(pollId, selected) {
    try {
      await apiFetch(`/api/polls/${pollId}/vote`, {
        token,
        method: "POST",
        body: { selected_options: selected },
      });
      await reload();
    } catch (e) {
      setError(e.message);
    }
  }

  // Load analytics
  async function openAnalytics(pollId) {
    setAnalyticsError("");
    try {
      const data = await apiFetch(`/api/polls/${pollId}/analytics`, { token });
      setAnalyticsData(data);
      setAnalyticsOpen(true);
    } catch (e) {
      setAnalyticsError(e.message);
    }
  }

  return (
    <div>
      <div className="text-xl font-extrabold tracking-tight">{t("news_title")}</div>
      <div className="mt-1 text-sm text-slate-300">{t("news_sub")}</div>

      {isAdmin && (
        <div className="card mt-6 p-4">
          <div className="text-sm font-bold">{t("publish_new")}</div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input className="rounded-xl md:col-span-1" placeholder={t("title_placeholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="rounded-xl md:col-span-1" value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="all">{t("audience_all")}</option>
              <option value="students">{t("audience_students")}</option>
              <option value="teachers">{t("audience_teachers")}</option>
            </select>
            <button className="btn-primary md:col-span-1" onClick={handlePublish}>
              {t("publish")}
            </button>
          </div>
          <textarea className="mt-3 w-full rounded-xl" rows={3} placeholder={t("body_placeholder")} value={body} onChange={(e) => setBody(e.target.value)} />

          {/* Poll form */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="text-sm font-bold">{t("add_poll")}</div>
            <input className="mt-2 w-full rounded-xl" placeholder={t("poll_question")} value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} />
            <div className="mt-2 space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input className="flex-1 rounded-xl" placeholder={`${t("option")} ${i + 1}`} value={opt} onChange={(e) => updatePollOption(i, e.target.value)} />
                  {pollOptions.length > 2 && (
                    <button type="button" className="btn-ghost" onClick={() => removePollOption(i)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-ghost text-sm" onClick={addPollOption}>
                + {t("add_option")}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={pollAnonymous} onChange={(e) => setPollAnonymous(e.target.checked)} />
                {t("anonymous")}
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={pollMultiple} onChange={(e) => setPollMultiple(e.target.checked)} />
                {t("multiple_choice")}
              </label>
              <input type="datetime-local" className="rounded-xl text-xs" value={pollEndsAt} onChange={(e) => setPollEndsAt(e.target.value)} />
            </div>
          </div>

          {error && <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div>}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item, idx) => (
          <NewsItem key={item.id} item={item} idx={idx} isAdmin={isAdmin} token={token} onReload={reload} onError={setError} onVote={handleVote} onOpenAnalytics={openAnalytics} />
        ))}
        {items.length === 0 && <div className="text-sm text-slate-300">{t("no_news")}</div>}
      </div>

      {/* Analytics Modal */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="card w-full max-w-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold">{t("poll_analytics")}</div>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setAnalyticsOpen(false)}>
                {t("close")}
              </button>
            </div>
            {analyticsError && (
              <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                {analyticsError}
              </div>
            )}
            {analyticsData && (
              <div className="mt-4 space-y-3">
                <div className="text-sm">
                  {t("total_votes")}: <strong>{analyticsData.totalVotes}</strong> · {analyticsData.anonymous ? t("anonymous") : t("public")}
                </div>
                {analyticsData.options.map((opt, i) => (
                  <div key={i} className="relative rounded-xl border border-white/10 bg-white/5 p-2">
                    <div className="absolute inset-0 rounded-xl bg-blue-500/20" style={{ width: `${opt.percentage}%` }} />
                    <div className="relative flex justify-between text-xs">
                      <span>{opt.option}</span>
                      <span>{opt.percentage}% ({opt.votes})</span>
                    </div>
                  </div>
                ))}
                {!analyticsData.anonymous && analyticsData.votes.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-bold">{t("votes_breakdown")}</div>
                    <div className="mt-2 space-y-1 text-xs">
                      {analyticsData.votes.map((v, i) => (
                        <div key={i}>
                          <strong>{v.userName}</strong>: {v.selectedOptions.map(idx => analyticsData.options[idx]?.option).join(", ")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component for each news item with poll
function NewsItem({ item, idx, isAdmin, token, onReload, onError, onVote, onOpenAnalytics }) {
  const { t } = useI18n();
  const [pollData, setPollData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/api/polls/news/${item.id}`, { token });
        setPollData(data);
      } catch {}
    })();
  }, [item.id, token]);

  return (
    <div className="reveal rounded-2xl border border-white/10 bg-white/5 p-4" style={{ animationDelay: `${idx * 50}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">{item.title}</div>
          <div className="mt-1 text-xs text-slate-300">{new Date(item.published_at).toLocaleString()}</div>
          <div className="mt-2 text-xs text-slate-200 line-clamp-4">{item.body}</div>
          <div className="mt-2 text-xs text-slate-400">{t("audience")}: {item.audience}</div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              className="btn-ghost text-rose-400"
              onClick={async () => {
                try {
                  await apiFetch(`/api/news/${item.id}`, { token, method: "DELETE" });
                  await onReload();
                } catch (e) {
                  onError(e.message);
                }
              }}
            >
              {t("delete")}
            </button>
          )}
          {isAdmin && pollData?.poll && (
            <button className="btn-ghost text-blue-400" onClick={() => onOpenAnalytics(pollData.poll.id)}>
              <BarChart3 size={16} />
            </button>
          )}
        </div>
      </div>
      {pollData?.poll && <PollCard newsId={item.id} poll={pollData.poll} userVote={pollData.userVote} onVote={onVote} />}
    </div>
  );
}

// Poll component for each news item
function PollCard({ newsId, poll, userVote, onVote }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(userVote?.selected_options || []);
  const hasVoted = !!userVote;

  const handleVote = () => {
    if (!hasVoted && selected.length > 0) onVote(poll.id, selected);
  };

  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-sm font-bold">{poll.question}</div>
      {poll.options?.map((opt, idx) => {
        const votes = opt.votes || 0;
        const percent = totalVotes ? ((votes / totalVotes) * 100).toFixed(1) : 0;
        const isSelected = selected.includes(idx);
        return (
          <div key={idx} className="mt-2">
            {hasVoted ? (
              <div className="relative rounded-xl border border-white/10 bg-white/5 p-2">
                <div className="absolute inset-0 rounded-xl bg-blue-500/20" style={{ width: `${percent}%` }} />
                <div className="relative flex justify-between text-xs">
                  <span>{opt.option}</span>
                  <span>{percent}% ({votes})</span>
                </div>
              </div>
            ) : (
              <label className="flex items-center gap-2 text-xs">
                <input
                  type={poll.multiple ? "checkbox" : "radio"}
                  name={`poll-${poll.id}`}
                  checked={isSelected}
                  onChange={() => {
                    if (poll.multiple) {
                      setSelected(isSelected ? selected.filter(i => i !== idx) : [...selected, idx]);
                    } else {
                      setSelected([idx]);
                    }
                  }}
                />
                {opt.option}
              </label>
            )}
          </div>
        );
      })}
      {!hasVoted && (
        <button className="btn-primary mt-2 text-xs" onClick={handleVote} disabled={selected.length === 0}>
          {t("vote")}
        </button>
      )}
      <div className="mt-2 text-xs text-slate-400">
        {t("total_votes")}: {totalVotes} · {poll.anonymous ? t("anonymous") : t("public")}
        {poll.ends_at && ` · ${t("ends_at")}: ${new Date(poll.ends_at).toLocaleString()}`}
      </div>
    </div>
  );
}
