import { Router } from "express";
import { z } from "zod";

import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { httpError } from "../lib/errors.js";
import { computeStudentStats, demo, demoMode } from "../demoStore.js";

export const attendanceRouter = Router();

function computeRisk(attendanceRate, perfIndex) {
  const score = 0.55 * (attendanceRate * 100) + 0.45 * perfIndex;
  if (score >= 75) return { level: "green", score: Math.round(score) };
  if (score >= 55) return { level: "yellow", score: Math.round(score) };
  return { level: "red", score: Math.round(score) };
}

attendanceRouter.get("/my", requireAuth, requireRole("student"), async (req, res, next) => {
  try {
    if (demoMode()) {
      return res.json({ stats: computeStudentStats() });
    }

    const result = await query(
      `select
         count(*) filter (where status in ('present','late'))::int as attended,
         count(*)::int as total,
         coalesce(avg(grade), 0)::float as avg_grade
       from attendance
       where student_id = $1`,
      [Number(req.user.sub)]
    );

    const row = result.rows[0] || { attended: 0, total: 0, avg_grade: 0 };
    const attendanceRate = row.total > 0 ? row.attended / row.total : 1;
    const perfIndex = Math.round(0.6 * row.avg_grade + 0.4 * attendanceRate * 100);
    const risk = computeRisk(attendanceRate, perfIndex);

    res.json({
      stats: {
        attended: row.attended,
        total: row.total,
        attendanceRate,
        avgGrade: row.avg_grade,
        performanceIndex: perfIndex,
        risk,
      },
    });
  } catch (e) {
    next(e);
  }
});

attendanceRouter.get("/journal", requireAuth, requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      return res.json({ items: demo.attendance.map((a) => ({
        id: a.id,
        date: a.date,
        status: a.status,
        grade: a.grade,
        comment: a.comment,
        student_id: a.student_id,
        student_name: a.student_name,
      })) });
    }

    const q = z
      .object({
        groupId: z.coerce.number().int(),
        subjectId: z.coerce.number().int(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .parse(req.query);

    const teacherConstraint = req.user.role === "teacher" ? Number(req.user.sub) : null;

    const rows = await query(
      `select a.id, a.date, a.status, a.grade, a.comment,
              u.id as student_id, u.full_name as student_name
       from attendance a
       join users u on u.id = a.student_id
       where a.group_id = $1 and a.subject_id = $2
         and ($3::int is null or a.teacher_id = $3)
         and ($4::date is null or a.date >= $4)
         and ($5::date is null or a.date <= $5)
       order by a.date desc, u.full_name asc`,
      [q.groupId, q.subjectId, teacherConstraint, q.from ?? null, q.to ?? null]
    );

    res.json({ items: rows.rows });
  } catch (e) {
    next(e);
  }
});

attendanceRouter.post("/mark", requireAuth, requireRole("teacher", "admin"), async (req, res, next) => {
  try {
    const body = z
      .object({
        studentId: z.number().int(),
        groupId: z.number().int(),
        subjectId: z.number().int(),
        date: z.string(),
        status: z.enum(["present", "late", "absent", "excused"]),
        grade: z.number().int().min(0).max(100).optional().nullable(),
        comment: z.string().optional().nullable(),
        teacherId: z.number().int().optional(),
      })
      .parse(req.body);

    const usedTeacherId = req.user.role === "teacher" ? Number(req.user.sub) : body.teacherId;
    if (req.user.role === "admin" && !usedTeacherId) {
      throw httpError(400, "teacherId is required for admin");
    }

    const existing = await query(
      `select id, teacher_id from attendance where student_id=$1 and subject_id=$2 and date=$3`,
      [body.studentId, body.subjectId, body.date]
    );

    if (existing.rows[0] && req.user.role === "teacher" && existing.rows[0].teacher_id !== usedTeacherId) {
      throw httpError(403, "You cannot edit attendance marked by another teacher");
    }

    await query(
      `insert into attendance(student_id, group_id, subject_id, teacher_id, date, status, grade, comment)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (student_id, subject_id, date)
       do update set status=excluded.status, grade=excluded.grade, comment=excluded.comment
      `,
      [
        body.studentId,
        body.groupId,
        body.subjectId,
        usedTeacherId,
        body.date,
        body.status,
        body.grade ?? null,
        body.comment ?? null,
      ]
    );

    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});
