import { Router } from "express";
import { z } from "zod";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { demo, demoMode } from "../demoStore.js";

export const exportRouter = Router();

async function fetchJournal({ groupId, subjectId }) {
  if (demoMode()) {
    return demo.attendance.map((a) => ({
      date: a.date,
      status: a.status,
      grade: a.grade,
      comment: a.comment,
      student_name: a.student_name,
    }));
  }

  const result = await query(
    `select a.date, a.status, a.grade, a.comment,
            u.full_name as student_name
     from attendance a
     join users u on u.id = a.student_id
     where a.group_id = $1 and a.subject_id = $2
     order by a.date desc, u.full_name asc`,
    [groupId, subjectId]
  );
  return result.rows;
}

exportRouter.get(
  "/attendance.xlsx",
  requireAuth,
  requireRole("teacher", "admin"),
  async (req, res, next) => {
    try {
      const q = z
        .object({
          groupId: z.coerce.number().int(),
          subjectId: z.coerce.number().int(),
        })
        .parse(req.query);

      const rows = await fetchJournal(q);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Attendance");
      ws.columns = [
        { header: "Date", key: "date", width: 14 },
        { header: "Student", key: "student", width: 28 },
        { header: "Status", key: "status", width: 12 },
        { header: "Grade", key: "grade", width: 10 },
        { header: "Comment", key: "comment", width: 32 },
      ];

      rows.forEach((r) =>
        ws.addRow({
          date: r.date,
          student: r.student_name,
          status: r.status,
          grade: r.grade ?? "",
          comment: r.comment ?? "",
        })
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=attendance.xlsx"
      );

      await wb.xlsx.write(res);
      res.end();
    } catch (e) {
      next(e);
    }
  }
);

exportRouter.get(
  "/weekly-report.pdf",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      let leaders = [];
      let absentees = [];
      let groups = [];

      if (demoMode()) {
        const total = demo.attendance.length || 1;
        const absent = demo.attendance.filter((a) => a.status === "absent").length;
        const attendanceRate = (total - absent) / total;
        const pi = Math.round(0.6 * 88 + 0.4 * attendanceRate * 100);

        leaders = [
          {
            student_name: demo.users.student.fullName,
            group_name: demo.groups[0]?.name,
            performance_index: pi,
            attendance_rate: attendanceRate,
          },
        ];
        absentees = [
          {
            student_name: demo.users.student.fullName,
            group_name: demo.groups[0]?.name,
            absences: absent,
            total,
          },
        ];
        groups = [
          {
            group_name: demo.groups[0]?.name,
            performance_index: pi,
            attendance_rate: attendanceRate,
          },
        ];
      } else {
        const leadersRes = await query(
          `select
             u.full_name as student_name,
             g.name as group_name,
             coalesce(avg(a.grade), 0)::float as avg_grade,
             (count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0)) as attendance_rate
           from users u
           join groups g on g.id = u.group_id
           left join attendance a on a.student_id = u.id
           where u.role = 'student'
           group by u.full_name, g.name
           order by (0.6*coalesce(avg(a.grade),0) + 0.4*coalesce((count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0))*100, 100)) desc
           limit 5`
        );
        leaders = leadersRes.rows.map((r) => {
          const ar = r.attendance_rate ?? 1;
          const perfIndex = Math.round(0.6 * r.avg_grade + 0.4 * ar * 100);
          return { student_name: r.student_name, group_name: r.group_name, performance_index: perfIndex, attendance_rate: ar };
        });

        const absRes = await query(
          `select
             u.full_name as student_name,
             g.name as group_name,
             count(*) filter (where a.status='absent')::int as absences,
             count(*)::int as total
           from users u
           join groups g on g.id = u.group_id
           left join attendance a on a.student_id = u.id
           where u.role='student'
           group by u.full_name, g.name
           order by (count(*) filter (where a.status='absent')::float / nullif(count(*),0)) desc
           limit 5`
        );
        absentees = absRes.rows;

        const grpRes = await query(
          `select
             g.name as group_name,
             coalesce(avg(a.grade), 0)::float as avg_grade,
             (count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0)) as attendance_rate
           from groups g
           left join users u on u.group_id = g.id and u.role = 'student'
           left join attendance a on a.student_id = u.id
           group by g.name
           order by (0.6*coalesce(avg(a.grade),0) + 0.4*coalesce((count(*) filter (where a.status in ('present','late'))::float / nullif(count(*),0))*100, 100)) desc
           limit 5`
        );
        groups = grpRes.rows.map((r) => {
          const ar = r.attendance_rate ?? 1;
          const perfIndex = Math.round(0.6 * r.avg_grade + 0.4 * ar * 100);
          return { group_name: r.group_name, performance_index: perfIndex, attendance_rate: ar };
        });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=weekly-college-report.pdf");

      const doc = new PDFDocument({ margin: 40 });
      doc.pipe(res);

      doc.fontSize(18).text("AL TAMIMI College System", { align: "left" });
      doc.moveDown(0.4);
      doc.fontSize(12).text(`Weekly College Report · ${new Date().toLocaleString()}`);
      doc.moveDown();

      doc.fontSize(11).text(
        "Hackathon goal: Move documentation, management and accounting into one internal digital system with full process automation.",
        { width: 520 }
      );
      doc.moveDown();

      doc.fontSize(13).text("Top students (Leaders)");
      doc.moveDown(0.4);
      leaders.forEach((x, i) => {
        doc
          .fontSize(10)
          .text(`${i + 1}. ${x.student_name} · ${x.group_name} · PI ${x.performance_index} · Attendance ${Math.round((x.attendance_rate ?? 0) * 100)}%`);
      });
      doc.moveDown();

      doc.fontSize(13).text("Top absentees");
      doc.moveDown(0.4);
      absentees.forEach((x, i) => {
        const total = x.total || 0;
        const abs = x.absences || 0;
        const rate = total ? Math.round((abs / total) * 100) : 0;
        doc.fontSize(10).text(`${i + 1}. ${x.student_name} · ${x.group_name} · Absences ${abs}/${total} (${rate}%)`);
      });
      doc.moveDown();

      doc.fontSize(13).text("Top groups");
      doc.moveDown(0.4);
      groups.forEach((x, i) => {
        doc
          .fontSize(10)
          .text(`${i + 1}. ${x.group_name} · PI ${x.performance_index} · Attendance ${Math.round((x.attendance_rate ?? 0) * 100)}%`);
      });

      doc.end();
    } catch (e) {
      next(e);
    }
  }
);

exportRouter.get(
  "/attendance.pdf",
  requireAuth,
  requireRole("teacher", "admin"),
  async (req, res, next) => {
    try {
      const q = z
        .object({
          groupId: z.coerce.number().int(),
          subjectId: z.coerce.number().int(),
        })
        .parse(req.query);

      const rows = await fetchJournal(q);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=attendance.pdf");

      const doc = new PDFDocument({ margin: 40 });
      doc.pipe(res);
      doc.fontSize(18).text("AL TAMIMI College System", { align: "left" });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Attendance report (group ${q.groupId}, subject ${q.subjectId})`);
      doc.moveDown();

      rows.slice(0, 60).forEach((r) => {
        doc
          .fontSize(10)
          .text(
            `${r.date} | ${r.student_name} | ${r.status}${r.grade != null ? ` | grade ${r.grade}` : ""}`
          );
      });

      doc.end();
    } catch (e) {
      next(e);
    }
  }
);
