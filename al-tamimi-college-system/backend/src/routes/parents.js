import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { demo, demoMode } from "../demoStore.js";

export const parentsRouter = Router();

// Link parent to student
parentsRouter.post("/link", requireAuth, async (req, res, next) => {
  try {
    const body = z.object({
      studentEmail: z.string().email(),
      relationship: z.enum(["mother", "father", "guardian"]),
    }).parse(req.body);

    if (demoMode()) {
      demo.parentLinks = demo.parentLinks || [];
      demo.parentLinks.push({
        parentId: req.user.sub,
        studentEmail: body.studentEmail,
        relationship: body.relationship,
      });
      return res.json({ linked: true });
    }

    // Find student by email
    const student = await query("select id, full_name from users where email = $1 and role = 'student'", [body.studentEmail]);
    if (student.rows.length === 0) return res.status(404).json({ error: "Student not found" });

    await query(
      `insert into parent_student_links(parent_id, student_id, relationship)
       values ($1,$2,$3)
       on conflict do nothing`,
      [Number(req.user.sub), student.rows[0].id, body.relationship]
    );

    res.json({ linked: true, studentName: student.rows[0].full_name });
  } catch (e) {
    next(e);
  }
});

// Get linked students
parentsRouter.get("/students", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      return res.json([
        { id: 1, full_name: "Alice Student", relationship: "mother" },
        { id: 2, full_name: "Bob Student", relationship: "father" },
      ]);
    }

    const result = await query(
      `select u.id, u.full_name, psl.relationship
       from parent_student_links psl
       join users u on u.id = psl.student_id
       where psl.parent_id = $1`,
      [Number(req.user.sub)]
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

// Get student progress for parent
parentsRouter.get("/student/:id/progress", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (demoMode()) {
      return res.json({
        attendance: 92,
        performanceIndex: 78.5,
        risk: { level: "green" },
        recentGrades: [
          { subject: "Math", grade: 85, date: "2025-08-14" },
          { subject: "English", grade: 90, date: "2025-08-13" },
        ],
        announcements: [
          { title: "Parent Meeting", date: "2025-08-20" },
        ],
      });
    }

    // Verify parent is linked to student
    const link = await query(
      `select 1 from parent_student_links where parent_id = $1 and student_id = $2`,
      [Number(req.user.sub), Number(id)]
    );
    if (link.rows.length === 0) return res.status(403).json({ error: "Not authorized" });

    // Attendance
    const att = await query(
      `select count(*) as total, sum(case when status = 'present' then 1 else 0 end) as attended
       from attendance where student_id = $1`,
      [Number(id)]
    );
    const attendance = att.rows[0].total ? (att.rows[0].attended / att.rows[0].total) * 100 : 0;

    // Performance
    const perf = await.query(
      `select performance_index, risk_level from students where id = $1`,
      [Number(id)]
    );

    // Recent grades
    const grades = await query(
      `select s.name as subject, g.grade, g.date
       from grades g
       join subjects s on s.id = g.subject_id
       where g.student_id = $1
       order by g.date desc
       limit 5`,
      [Number(id)]
    );

    // Announcements for parents
    const announcements = await query(
      `select title, published_at from news where audience = 'all' or audience = 'parents' order by published_at desc limit 3`
    );

    res.json({
      attendance: Math.round(attendance),
      performanceIndex: perf.rows[0]?.performance_index || 0,
      risk: { level: perf.rows[0]?.risk_level || "green" },
      recentGrades: grades.rows,
      announcements: announcements.rows,
    });
  } catch (e) {
    next(e);
  }
});
