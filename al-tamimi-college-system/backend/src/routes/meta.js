import { Router } from "express";

import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const metaRouter = Router();

metaRouter.get("/groups", requireAuth, async (req, res, next) => {
  try {
    const result = await query(`select id, name from groups order by name asc`);
    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});

metaRouter.get("/subjects", requireAuth, async (req, res, next) => {
  try {
    const result = await query(`select id, name from subjects order by name asc`);
    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});

metaRouter.get("/teachers", requireAuth, requireRole("admin", "teacher"), async (req, res, next) => {
  try {
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
    const result = await query(
      `select id, full_name, group_id from users where role='student' order by full_name asc`
    );
    res.json({ items: result.rows });
  } catch (e) {
    next(e);
  }
});
