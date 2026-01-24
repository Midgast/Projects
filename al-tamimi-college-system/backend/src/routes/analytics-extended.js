import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { computeStudentStats, computeGroupStats, getTopPerformers, getAtRiskStudents, demo, demoMode } from "../demoStore.js";
// import { cacheMiddleware } from "../lib/analyticsCache.js";
import { measurePerformance } from "../lib/analyticsMetrics.js";

export const analyticsExtendedRouter = Router();

// Общая статистика
analyticsExtendedRouter.get("/overview", 
  requireAuth, 
  requireRole("admin"), 
  // cacheMiddleware(5 * 60 * 1000), // 5 минут кэш
  async (req, res, next) => {
    try {
      const data = await measurePerformance("analytics_overview", async () => {
        if (demoMode()) {
          const allStats = computeStudentStats();
          const groupStats = computeGroupStats();
          const topPerformers = getTopPerformers(3);
          const atRiskStudents = getAtRiskStudents();
          
          return {
            overview: {
              totalStudents: allStats.length,
              avgAttendanceRate: groupStats.avgAttendanceRate,
              avgGrade: groupStats.avgGrade,
              avgPerformanceIndex: groupStats.avgPerformanceIndex,
              riskDistribution: {
                green: allStats.filter(s => s.risk.level === 'green').length,
                yellow: allStats.filter(s => s.risk.level === 'yellow').length,
                red: allStats.filter(s => s.risk.level === 'red').length,
              },
            },
            topPerformers: topPerformers.map(p => ({
              studentId: p.studentId,
              studentName: p.studentName,
              performanceIndex: p.performanceIndex,
              risk: p.risk,
            })),
            atRiskStudents: atRiskStudents.map(s => ({
              studentId: s.studentId,
              studentName: s.studentName,
              risk: s.risk,
              attendanceRate: s.attendanceRate,
            })),
          };
        }

        return {
          overview: {
            totalStudents: 0,
            avgAttendanceRate: 0,
            avgGrade: 0,
            avgPerformanceIndex: 0,
            riskDistribution: { green: 0, yellow: 0, red: 0 },
          },
          topPerformers: [],
          atRiskStudents: [],
        };
      });

      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

// Тренды посещаемости
analyticsExtendedRouter.get("/attendance-trends", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const attendance = demo.attendance;
      const trends = attendance.reduce((acc, record) => {
        const date = record.date;
        if (!acc[date]) {
          acc[date] = { present: 0, late: 0, absent: 0, total: 0 };
        }
        acc[date][record.status]++;
        acc[date].total++;
        return acc;
      }, {});

      const formattedTrends = Object.entries(trends).map(([date, stats]) => ({
        date,
        presentRate: stats.total > 0 ? (stats.present + stats.late) / stats.total : 0,
        absentRate: stats.total > 0 ? stats.absent / stats.total : 0,
        totalStudents: stats.total,
      }));

      return res.json({
        trends: formattedTrends.sort((a, b) => new Date(a.date) - new Date(b.date)),
      });
    }

    res.json({ trends: [] });
  } catch (e) {
    next(e);
  }
});

// Производительность по предметам
analyticsExtendedRouter.get("/subject-performance", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const attendance = demo.attendance;
      const subjectStats = attendance.reduce((acc, record) => {
        const subjectId = record.subject_id;
        const subject = demo.subjects.find(s => s.id === subjectId);
        if (!acc[subjectId]) {
          acc[subjectId] = {
            subjectId,
            subjectName: subject?.name || `Subject ${subjectId}`,
            grades: [],
            attendance: [],
          };
        }
        if (record.grade > 0) {
          acc[subjectId].grades.push(record.grade);
        }
        acc[subjectId].attendance.push(record.status);
        return acc;
      }, {});

      const performance = Object.values(subjectStats).map(stat => ({
        subjectId: stat.subjectId,
        subjectName: stat.subjectName,
        avgGrade: stat.grades.length > 0 
          ? stat.grades.reduce((sum, grade) => sum + grade, 0) / stat.grades.length 
          : 0,
        attendanceRate: stat.attendance.length > 0
          ? stat.attendance.filter(s => s === 'present' || s === 'late').length / stat.attendance.length
          : 0,
        totalRecords: stat.attendance.length,
      }));

      return res.json({ performance });
    }

    res.json({ performance: [] });
  } catch (e) {
    next(e);
  }
});
