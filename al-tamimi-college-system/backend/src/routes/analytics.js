import { Router } from "express";

import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { computeStudentStats, demo, demoMode } from "../demoStore.js";

export const analyticsRouter = Router();

function riskLevel(score) {
  if (score >= 75) return "green";
  if (score >= 55) return "yellow";
  return "red";
}

analyticsRouter.get("/leaders", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const stats = computeStudentStats();
      return res.json({
        items: [
          {
            studentId: demo.users.student.id,
            studentName: demo.users.student.fullName,
            groupName: demo.groups[0].name,
            avgGrade: stats.avgGrade,
            attendanceRate: stats.attendanceRate,
            performanceIndex: stats.performanceIndex,
            risk: stats.risk,
          },
        ],
      });
    }

    const result = await query(
      `select
         u.id as student_id,
         u.full_name as student_name,
         g.name as group_name,
         coalesce(avg(a.grade), 0)::float as avg_grade,
         (count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0)) as attendance_rate
       from users u
       join groups g on g.id = u.group_id
       left join attendance a on a.student_id = u.id
       where u.role = 'student'
       group by u.id, u.full_name, g.name
       order by (0.6*coalesce(avg(a.grade),0) + 0.4*coalesce((count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0))*100, 100)) desc
       limit 10`
    );

    const items = result.rows.map((r) => {
      const attendanceRate = r.attendance_rate ?? 1;
      const perfIndex = Math.round(0.6 * r.avg_grade + 0.4 * attendanceRate * 100);
      const score = Math.round(0.55 * attendanceRate * 100 + 0.45 * perfIndex);
      return {
        studentId: r.student_id,
        studentName: r.student_name,
        groupName: r.group_name,
        avgGrade: r.avg_grade,
        attendanceRate,
        performanceIndex: perfIndex,
        risk: { level: riskLevel(score), score },
      };
    });

    res.json({ items });
  } catch (e) {
    next(e);
  }
});

analyticsRouter.get("/absentees", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const rows = demo.attendance;
      const total = rows.length || 1;
      const absentCount = rows.filter((r) => r.status === "absent").length;
      const rate = absentCount / total;

      return res.json({
        items: [
          {
            studentId: demo.users.student.id,
            studentName: demo.users.student.fullName,
            groupName: demo.groups[0].name,
            absences: absentCount,
            total,
            absenceRate: rate,
          },
        ],
      });
    }

    const result = await query(
      `select
         u.id as student_id,
         u.full_name as student_name,
         g.name as group_name,
         count(*) filter (where a.status = 'absent')::int as absences,
         count(*)::int as total
       from users u
       join groups g on g.id = u.group_id
       left join attendance a on a.student_id = u.id
       where u.role = 'student'
       group by u.id, u.full_name, g.name
       order by (count(*) filter (where a.status = 'absent')::float / nullif(count(*),0)) desc,
                (count(*) filter (where a.status = 'absent')) desc
       limit 10`
    );

    const items = result.rows.map((r) => {
      const total = r.total ?? 0;
      const absences = r.absences ?? 0;
      const absenceRate = total > 0 ? absences / total : 0;
      return {
        studentId: r.student_id,
        studentName: r.student_name,
        groupName: r.group_name,
        absences,
        total,
        absenceRate,
      };
    });

    res.json({ items });
  } catch (e) {
    next(e);
  }
});

analyticsRouter.get("/groups", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const stats = computeStudentStats();
      return res.json({
        items: [
          {
            groupId: demo.groups[0].id,
            groupName: demo.groups[0].name,
            avgGrade: stats.avgGrade,
            attendanceRate: stats.attendanceRate,
            performanceIndex: stats.performanceIndex,
          },
        ],
      });
    }

    const result = await query(
      `select
         g.id as group_id,
         g.name as group_name,
         coalesce(avg(a.grade), 0)::float as avg_grade,
         (count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0)) as attendance_rate
       from groups g
       left join users u on u.group_id = g.id and u.role = 'student'
       left join attendance a on a.student_id = u.id
       group by g.id, g.name
       order by (0.6*coalesce(avg(a.grade),0) + 0.4*coalesce((count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0))*100, 100)) desc
       limit 10`
    );

    const items = result.rows.map((r) => {
      const attendanceRate = r.attendance_rate ?? 1;
      const perfIndex = Math.round(0.6 * r.avg_grade + 0.4 * attendanceRate * 100);
      return {
        groupId: r.group_id,
        groupName: r.group_name,
        avgGrade: r.avg_grade,
        attendanceRate,
        performanceIndex: perfIndex,
      };
    });

    res.json({ items });
  } catch (e) {
    next(e);
  }
});

analyticsRouter.get("/risk", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const stats = computeStudentStats();
      return res.json({
        items: [
          {
            studentId: demo.users.student.id,
            studentName: demo.users.student.fullName,
            groupName: demo.groups[0].name,
            avgGrade: stats.avgGrade,
            attendanceRate: stats.attendanceRate,
            performanceIndex: stats.performanceIndex,
            risk: stats.risk,
          },
        ],
      });
    }

    const result = await query(
      `select
         u.id as student_id,
         u.full_name as student_name,
         g.name as group_name,
         coalesce(avg(a.grade), 0)::float as avg_grade,
         (count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0)) as attendance_rate
       from users u
       join groups g on g.id = u.group_id
       left join attendance a on a.student_id = u.id
       where u.role = 'student'
       group by u.id, u.full_name, g.name
       order by u.full_name asc`
    );

    const items = result.rows.map((r) => {
      const attendanceRate = r.attendance_rate ?? 1;
      const perfIndex = Math.round(0.6 * r.avg_grade + 0.4 * attendanceRate * 100);
      const score = Math.round(0.55 * attendanceRate * 100 + 0.45 * perfIndex);
      return {
        studentId: r.student_id,
        studentName: r.student_name,
        groupName: r.group_name,
        avgGrade: r.avg_grade,
        attendanceRate,
        performanceIndex: perfIndex,
        risk: { level: riskLevel(score), score },
      };
    });

    res.json({ items });
  } catch (e) {
    next(e);
  }
});
