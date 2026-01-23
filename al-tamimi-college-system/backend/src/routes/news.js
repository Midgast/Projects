import { Router } from "express";
import { z } from "zod";

import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { demo, demoMode } from "../demoStore.js";

export const newsRouter = Router();

newsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      return res.json({ items: demo.news });
    }

    const roleAudience = req.user.role === "student" ? "students" : req.user.role === "teacher" ? "teachers" : null;

    const result = await query(
      `select n.id, n.title, n.body, n.audience, n.published_at,
              u.full_name as author_name
       from news n
       left join users u on u.id = n.author_id
       where ($1::text is null) or n.audience = 'all' or n.audience = $1
       order by n.published_at desc
       limit 50`,
      [roleAudience]
    );

    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});

newsRouter.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const body = z
      .object({
        title: z.string().min(3),
        body: z.string().min(3),
        audience: z.enum(["all", "students", "teachers"]).default("all"),
      })
      .parse(req.body);

    if (demoMode()) {
      const id = demo.news.length + 1;
      demo.news.unshift({
        id,
        title: body.title,
        body: body.body,
        audience: body.audience,
        published_at: new Date().toISOString(),
        author_name: req.user.fullName,
      });
      return res.status(201).json({ id });
    }

    const ins = await query(
      `insert into news(title, body, audience, author_id)
       values ($1,$2,$3,$4)
       returning id`,
      [body.title, body.body, body.audience, Number(req.user.sub)]
    );

    res.status(201).json({ id: ins.rows[0].id });
  } catch (e) {
    next(e);
  }
});

newsRouter.delete("/:id", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (demoMode()) {
      demo.news = demo.news.filter(n => n.id !== Number(id));
      return res.json({ deleted: true });
    }
    await query("delete from news where id = $1", [Number(id)]);
    res.json({ deleted: true });
  } catch (e) {
    next(e);
  }
});
