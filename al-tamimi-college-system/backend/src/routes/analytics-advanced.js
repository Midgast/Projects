import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { computeStudentStats, computeGroupStats, getTopPerformers, getAtRiskStudents, demo, demoMode } from "../demoStore.js";

export const analyticsAdvancedRouter = Router();

// Продвинутая аналитика с предиктивными моделями
analyticsAdvancedRouter.get("/predictions", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const allStats = computeStudentStats();
      const predictions = allStats.map(student => {
        // Простая предиктивная модель на основе текущих трендов
        const trend = student.attendanceRate > 0.8 ? 'improving' : 'declining';
        const predictedGrade = student.avgGrade + (trend === 'improving' ? 5 : -3);
        const riskPrediction = student.risk.score > 60 ? 'stable' : 'high_risk';
        
        return {
          studentId: student.studentId,
          studentName: student.studentName,
          currentPerformance: student.performanceIndex,
          predictedGrade: Math.max(0, Math.min(100, predictedGrade)),
          riskPrediction,
          confidence: Math.random() * 20 + 70, // 70-90% confidence
          recommendations: generateRecommendations(student, trend)
        };
      });

      return res.json({
        predictions,
        modelAccuracy: 87.5,
        lastUpdated: new Date().toISOString()
      });
    }

    res.json({ predictions: [], modelAccuracy: 0 });
  } catch (e) {
    next(e);
  }
});

// Сравнительный анализ групп
analyticsAdvancedRouter.get("/group-comparison", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      // Создаем фиктивные данные для нескольких групп
      const groups = [
        {
          groupId: 1,
          groupName: "CS-101",
          ...computeGroupStats(),
          strengths: ["High attendance", "Good grades"],
          weaknesses: ["Late submissions"],
          improvement: "Focus on time management"
        },
        {
          groupId: 2,
          groupName: "CS-102",
          totalStudents: 4,
          avgAttendanceRate: 0.75,
          avgGrade: 72,
          avgPerformanceIndex: 68,
          strengths: ["Creative solutions"],
          weaknesses: ["Low attendance", "Poor test scores"],
          improvement: "Increase engagement activities"
        }
      ];

      const comparison = {
        groups,
        bestPerforming: groups[0],
        needsAttention: groups[1],
        overallTrend: 'improving',
        recommendations: [
          "Implement peer tutoring programs",
          "Schedule regular progress meetings",
          "Create engaging learning materials"
        ]
      };

      return res.json(comparison);
    }

    res.json({ groups: [] });
  } catch (e) {
    next(e);
  }
});

// Анализ эффективности преподавателей
analyticsAdvancedRouter.get("/teacher-performance", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const teacherPerformance = [
        {
          teacherId: 2,
          teacherName: "Aisha Al-Mutairi",
          subjects: ["Mathematics", "Programming"],
          avgStudentGrade: 85.5,
          studentSatisfaction: 4.2,
          attendanceRate: 0.92,
          engagementScore: 88,
          strengths: ["Clear explanations", "Patient with students"],
          areasForImprovement: ["More practical examples"],
          performanceRating: "Excellent"
        }
      ];

      return res.json({
        teachers: teacherPerformance,
        overallAvgRating: 4.2,
        topPerformer: teacherPerformance[0],
        recommendations: [
          "Provide additional training materials",
          "Encourage peer observation",
          "Implement student feedback systems"
        ]
      });
    }

    res.json({ teachers: [] });
  } catch (e) {
    next(e);
  }
});

// Детальный анализ посещаемости с паттернами
analyticsAdvancedRouter.get("/attendance-patterns", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const attendance = demo.attendance;
      const patterns = {
        dailyPatterns: {
          monday: { present: 85, late: 10, absent: 5 },
          tuesday: { present: 90, late: 5, absent: 5 },
          wednesday: { present: 80, late: 15, absent: 5 },
          thursday: { present: 88, late: 7, absent: 5 },
          friday: { present: 75, late: 20, absent: 5 }
        },
        weeklyTrends: [
          { week: 1, attendance: 85 },
          { week: 2, attendance: 87 },
          { week: 3, attendance: 82 },
          { week: 4, attendance: 89 }
        ],
        subjectPatterns: {
          "Mathematics": { attendance: 88, punctuality: 92 },
          "Programming": { attendance: 85, punctuality: 78 }
        },
        insights: [
          "Highest attendance on Tuesdays",
          "Most tardiness on Fridays",
          "Mathematics classes have better punctuality",
          "Overall attendance improving over time"
        ],
        recommendations: [
          "Schedule important topics on high-attendance days",
          "Implement engagement strategies for Fridays",
          "Address punctuality issues in Programming classes"
        ]
      };

      return res.json(patterns);
    }

    res.json({ dailyPatterns: {}, weeklyTrends: [] });
  } catch (e) {
    next(e);
  }
});

// Анализ успеваемости по временным периодам
analyticsAdvancedRouter.get("/performance-timeline", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const timeline = [
        {
          period: "September 2024",
          avgGrade: 78,
          attendanceRate: 0.85,
          totalAssessments: 15,
          passRate: 0.92,
          keyEvents: ["Start of academic year", "Initial assessments"]
        },
        {
          period: "October 2024",
          avgGrade: 82,
          attendanceRate: 0.88,
          totalAssessments: 20,
          passRate: 0.95,
          keyEvents: ["Mid-term exams", "Parent meetings"]
        },
        {
          period: "November 2024",
          avgGrade: 80,
          attendanceRate: 0.82,
          totalAssessments: 18,
          passRate: 0.90,
          keyEvents: ["Project submissions", "Practical exams"]
        },
        {
          period: "December 2024",
          avgGrade: 85,
          attendanceRate: 0.90,
          totalAssessments: 25,
          passRate: 0.96,
          keyEvents: ["Final exams", "Grade submissions"]
        }
      ];

      return res.json({
        timeline,
        overallImprovement: 9.0, // percentage improvement
        bestMonth: "December 2024",
        worstMonth: "September 2024",
        trends: {
          grades: 'improving',
          attendance: 'improving',
          passRate: 'stable'
        }
      });
    }

    res.json({ timeline: [] });
  } catch (e) {
    next(e);
  }
});

// Генерация рекомендаций на основе анализа
function generateRecommendations(student, trend) {
  const recommendations = [];

  if (student.attendanceRate < 0.8) {
    recommendations.push("Improve attendance through regular class participation");
  }

  if (student.avgGrade < 70) {
    recommendations.push("Focus on foundational concepts and seek additional help");
  }

  if (trend === 'declining') {
    recommendations.push("Meet with academic advisor to discuss performance concerns");
  }

  if (student.risk.level === 'red') {
    recommendations.push("Immediate intervention required - consider tutoring support");
  }

  if (student.performanceIndex > 85) {
    recommendations.push("Consider advanced coursework or leadership opportunities");
  }

  return recommendations.length > 0 ? recommendations : ["Continue current performance trajectory"];
}
