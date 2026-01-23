import { Router } from "express";
import { z } from "zod";

import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { demo, demoMode } from "../demoStore.js";

export const scheduleRouter = Router();

scheduleRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      let items = demo.schedule;
      if (req.user.role === "student") items = items.filter((x) => x.group_id === req.user.groupId);
      if (req.user.role === "teacher") items = items.filter((x) => x.teacher_id === Number(req.user.sub));
      return res.json({ items });
    }

    const q = z
      .object({
        groupId: z.coerce.number().int().optional(),
        teacherId: z.coerce.number().int().optional(),
      })
      .parse(req.query);

    let groupId = q.groupId;
    let teacherId = q.teacherId;

    if (req.user.role === "student") {
      groupId = req.user.groupId;
    }

    if (req.user.role === "teacher") {
      teacherId = Number(req.user.sub);
    }

    const result = await query(
      `select s.id, s.day_of_week, s.start_time, s.end_time, s.room,
              g.id as group_id, g.name as group_name,
              sub.id as subject_id, sub.name as subject_name,
              u.id as teacher_id, u.full_name as teacher_name
       from schedule s
       join groups g on g.id = s.group_id
       join subjects sub on sub.id = s.subject_id
       join users u on u.id = s.teacher_id
       where ($1::int is null or s.group_id = $1)
         and ($2::int is null or s.teacher_id = $2)
       order by s.day_of_week, s.start_time` ,
      [groupId ?? null, teacherId ?? null]
    );

    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});

scheduleRouter.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const body = z
      .object({
        groupId: z.number().int(),
        subjectId: z.number().int(),
        teacherId: z.number().int(),
        dayOfWeek: z.number().int().min(1).max(7),
        startTime: z.string(),
        endTime: z.string(),
        room: z.string().optional().nullable(),
      })
      .parse(req.body);

    const inserted = await query(
      `insert into schedule(group_id, subject_id, teacher_id, day_of_week, start_time, end_time, room)
       values ($1,$2,$3,$4,$5,$6,$7)
       returning id`,
      [
        body.groupId,
        body.subjectId,
        body.teacherId,
        body.dayOfWeek,
        body.startTime,
        body.endTime,
        body.room ?? null,
      ]
    );

    res.status(201).json({ id: inserted.rows[0].id });
  } catch (e) {
    next(e);
  }
});
