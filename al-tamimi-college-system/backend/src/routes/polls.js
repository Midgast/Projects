import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { demo, demoMode } from "../demoStore.js";

export const pollsRouter = Router();

// Получить опрос по news_id
pollsRouter.get("/news/:newsId", requireAuth, async (req, res, next) => {
  try {
    const { newsId } = req.params;
    if (demoMode()) {
      const poll = demo.polls?.find(p => p.news_id === Number(newsId));
      if (!poll) return res.json({ poll: null, votes: [], userVote: null });
      const votes = demo.pollVotes?.filter(v => v.poll_id === poll.id) || [];
      const userVote = votes.find(v => v.user_id === req.user.sub) || null;
      return res.json({ poll, votes, userVote });
    }

    const pollResult = await query("select * from polls where news_id = $1", [Number(newsId)]);
    if (pollResult.rows.length === 0) return res.json({ poll: null, votes: [], userVote: null });

    const poll = pollResult.rows[0];
    const votesResult = await query(
      `select pv.selected_options, u.full_name
       from poll_votes pv
       join users u on u.id = pv.user_id
       where pv.poll_id = $1`,
      [poll.id]
    );
    const userVoteResult = await query(
      "select * from poll_votes where poll_id = $1 and user_id = $2",
      [poll.id, Number(req.user.sub)]
    );

    res.json({
      poll,
      votes: votesResult.rows,
      userVote: userVoteResult.rows[0] || null,
    });
  } catch (e) {
    next(e);
  }
});

// Создать опрос (при создании новости)
pollsRouter.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const body = z
      .object({
        news_id: z.number(),
        question: z.string().min(3),
        options: z.array(z.string().min(1)).min(2),
        anonymous: z.boolean().default(true),
        multiple: z.boolean().default(false),
        ends_at: z.string().datetime().optional(),
      })
      .parse(req.body);

    if (demoMode()) {
      const poll = {
        id: demo.polls?.length + 1 || 1,
        ...body,
        created_at: new Date().toISOString(),
      };
      if (!demo.polls) demo.polls = [];
      demo.polls.push(poll);
      return res.status(201).json(poll);
    }

    const result = await query(
      `insert into polls(news_id, question, options, anonymous, multiple, ends_at)
       values ($1,$2,$3,$4,$5,$6)
       returning *`,
      [body.news_id, body.question, body.options, body.anonymous, body.multiple, body.ends_at ? new Date(body.ends_at) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    next(e);
  }
});

// Голосовать
pollsRouter.post("/:id/vote", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = z
      .object({
        selected_options: z.array(z.number()).min(1),
      })
      .parse(req.body);

    if (demoMode()) {
      const existing = demo.pollVotes?.find(v => v.poll_id === Number(id) && v.user_id === req.user.sub);
      if (existing) {
        existing.selected_options = body.selected_options;
      } else {
        demo.pollVotes?.push({
          id: demo.pollVotes?.length + 1 || 1,
          poll_id: Number(id),
          user_id: req.user.sub,
          selected_options: body.selected_options,
          created_at: new Date().toISOString(),
        });
      }
      return res.json({ voted: true });
    }

    await query(
      `insert into poll_votes(poll_id, user_id, selected_options)
       values ($1,$2,$3)
       on conflict (poll_id, user_id)
       do update set selected_options = excluded.selected_options`,
      [Number(id), Number(req.user.sub), body.selected_options]
    );
    res.json({ voted: true });
  } catch (e) {
    next(e);
  }
});

// Аналитика по опросу (админ)
pollsRouter.get("/:id/analytics", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (demoMode()) {
      const poll = demo.polls?.find(p => p.id === Number(id));
      const votes = demo.pollVotes?.filter(v => v.poll_id === Number(id)) || [];
      const analytics = {
        totalVotes: votes.length,
        options: poll.options.map((opt, idx) => ({
          option: opt,
          votes: votes.filter(v => v.selected_options.includes(idx)).length,
          percentage: votes.length ? (votes.filter(v => v.selected_options.includes(idx)).length / votes.length * 100).toFixed(1) : 0,
        })),
        anonymous: poll.anonymous,
        multiple: poll.multiple,
        votes: poll.anonymous ? [] : votes.map(v => ({
          userName: v.user_id,
          selectedOptions: v.selected_options,
        })),
      };
      return res.json(analytics);
    }

    const pollResult = await query("select * from polls where id = $1", [Number(id)]);
    const poll = pollResult.rows[0];
    const votesResult = await query(
      `select pv.selected_options, u.full_name
       from poll_votes pv
       join users u on u.id = pv.user_id
       where pv.poll_id = $1`,
      [Number(id)]
    );

    const votes = votesResult.rows;
    const analytics = {
      totalVotes: votes.length,
      options: poll.options.map((opt, idx) => ({
        option: opt,
        votes: votes.filter(v => v.selected_options.includes(idx)).length,
        percentage: votes.length ? (votes.filter(v => v.selected_options.includes(idx)).length / votes.length * 100).toFixed(1) : 0,
      })),
      anonymous: poll.anonymous,
      multiple: poll.multiple,
      votes: poll.anonymous ? [] : votes.map(v => ({
        userName: v.full_name,
        selectedOptions: v.selected_options,
      })),
    };

    res.json(analytics);
  } catch (e) {
    next(e);
  }
});
