import { Router } from "express";

import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { demo, demoMode } from "../demoStore.js";

export const metaRouter = Router();

metaRouter.get("/groups", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) return res.json({ items: demo.groups });
    const result = await query(`select id, name from groups order by name asc`);
    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});

metaRouter.get("/subjects", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) return res.json({ items: demo.subjects });
    const result = await query(`select id, name from subjects order by name asc`);
    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});

metaRouter.get("/teachers", requireAuth, requireRole("admin", "teacher"), async (req, res, next) => {
  try {
    if (demoMode()) {
      return res.json({
        items: [{ id: demo.users.teacher.id, full_name: demo.users.teacher.fullName }],
      });
    }
    const result = await query(
      `select id, full_name from users where role='teacher' order by full_name asc`
    );
    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});

metaRouter.get("/students", requireAuth, requireRole("admin", "teacher"), async (req, res, next) => {
  try {
    if (demoMode()) {
      return res.json({
        items: [{ id: demo.users.student.id, full_name: demo.users.student.fullName, group_id: demo.users.student.groupId }],
      });
    }
    const result = await query(
      `select id, full_name, group_id from users where role='student' order by full_name asc`
    );
    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});
