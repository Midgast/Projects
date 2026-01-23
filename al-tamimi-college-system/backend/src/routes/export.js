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
