import { Router } from "express";
import { z } from "zod";

import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { demo, demoMode } from "../demoStore.js";

export const awardsRouter = Router();

awardsRouter.get("/badges", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      return res.json({ items: demo.badges });
    }

    const result = await query(
      `select id, code, title, description, color from badges order by id asc`
    );
    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});

awardsRouter.get("/my", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      return res.json({ items: demo.userBadges[Number(req.user.sub)] || [] });
    }

    const result = await query(
      `select b.code, b.title, b.description, b.color, ub.awarded_at
       from user_badges ub
       join badges b on b.id = ub.badge_id
       where ub.user_id = $1
       order by ub.awarded_at desc`,
      [Number(req.user.sub)]
    );
    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});

awardsRouter.post("/award", requireAuth, requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    const body = z
      .object({
        userId: z.number().int(),
        badgeCode: z.string().min(2),
      })
      .parse(req.body);

    const badge = await query(`select id from badges where code=$1`, [body.badgeCode]);
    const badgeId = badge.rows[0]?.id;
    if (!badgeId) return res.status(400).json({ error: { message: "Unknown badge" } });

    await query(
      `insert into user_badges(user_id, badge_id, awarded_by)
       values ($1,$2,$3)
       on conflict (user_id, badge_id) do nothing`,
      [body.userId, badgeId, Number(req.user.sub)]
    );

    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});
