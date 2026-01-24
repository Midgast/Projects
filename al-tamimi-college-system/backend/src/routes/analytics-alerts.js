import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { computeStudentStats, getAtRiskStudents, demo, demoMode } from "../demoStore.js";

export const analyticsAlertsRouter = Router();

// Получение активных алертов и уведомлений
analyticsAlertsRouter.get("/alerts", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const atRiskStudents = getAtRiskStudents();
      const allStats = computeStudentStats();
      
      const alerts = [
        {
          id: 1,
          type: "risk",
          severity: "high",
          title: "Students at Risk",
          message: `${atRiskStudents.length} students require immediate attention`,
          affectedStudents: atRiskStudents.map(s => s.studentId),
          timestamp: new Date().toISOString(),
          acknowledged: false,
          actions: ["Review student profiles", "Schedule counseling", "Contact parents"]
        },
        {
          id: 2,
          type: "attendance",
          severity: "medium",
          title: "Low Attendance Alert",
          message: "Overall attendance dropped below 80% this week",
          affectedStudents: allStats.filter(s => s.attendanceRate < 0.8).map(s => s.studentId),
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          acknowledged: false,
          actions: ["Send attendance reminders", "Investigate causes", "Implement incentives"]
        },
        {
          id: 3,
          type: "performance",
          severity: "low",
          title: "Performance Milestone",
          message: "Class average grade improved by 5% this month",
          affectedStudents: [],
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          acknowledged: true,
          actions: ["Celebrate achievement", "Share success strategies", "Document best practices"]
        }
      ];

      return res.json({
        alerts,
        summary: {
          total: alerts.length,
          high: alerts.filter(a => a.severity === 'high').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          low: alerts.filter(a => a.severity === 'low').length,
          unacknowledged: alerts.filter(a => !a.acknowledged).length
        }
      });
    }

    res.json({ alerts: [], summary: { total: 0, high: 0, medium: 0, low: 0, unacknowledged: 0 } });
  } catch (e) {
    next(e);
  }
});

// Создание нового алерта
analyticsAlertsRouter.post("/alerts", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { type, severity, title, message, affectedStudents } = req.body;

    if (demoMode()) {
      const newAlert = {
        id: Date.now(),
        type,
        severity,
        title,
        message,
        affectedStudents: affectedStudents || [],
        timestamp: new Date().toISOString(),
        acknowledged: false,
        actions: generateDefaultActions(type, severity)
      };

      return res.json({
        success: true,
        alert: newAlert,
        message: "Alert created successfully"
      });
    }

    res.json({ success: false, message: "Alert creation failed" });
  } catch (e) {
    next(e);
  }
});

// Подтверждение алерта
analyticsAlertsRouter.put("/alerts/:alertId/acknowledge", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { alertId } = req.params;

    if (demoMode()) {
      return res.json({
        success: true,
        message: `Alert ${alertId} acknowledged successfully`,
        acknowledgedAt: new Date().toISOString()
      });
    }

    res.json({ success: false, message: "Alert acknowledgment failed" });
  } catch (e) {
    next(e);
  }
});

// Получение рекомендаций по улучшению
analyticsAlertsRouter.get("/recommendations", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const recommendations = [
        {
          id: 1,
          category: "attendance",
          priority: "high",
          title: "Implement Attendance Incentive Program",
          description: "Create a reward system for students with 95%+ attendance",
          expectedImpact: "15-20% attendance improvement",
          implementationTime: "2-3 weeks",
          resources: ["Student rewards budget", "Tracking system", "Communication materials"],
          steps: [
            "Define attendance criteria",
            "Establish reward structure",
            "Create tracking mechanism",
            "Communicate program to students",
            "Launch and monitor results"
          ]
        },
        {
          id: 2,
          category: "academic",
          priority: "medium",
          title: "Peer Tutoring Initiative",
          description: "Pair high-performing students with those needing extra help",
          expectedImpact: "10-15% grade improvement for participants",
          implementationTime: "4-6 weeks",
          resources: ["Training materials", "Schedule coordination", "Monitoring tools"],
          steps: [
            "Identify potential tutors and tutees",
            "Provide training for tutors",
            "Create matching system",
            "Establish regular sessions",
            "Track progress and effectiveness"
          ]
        },
        {
          id: 3,
          category: "engagement",
          priority: "medium",
          title: "Interactive Learning Tools",
          description: "Introduce gamification and interactive content",
          expectedImpact: "25% increase in student engagement",
          implementationTime: "6-8 weeks",
          resources: ["Educational software", "Training for teachers", "Device access"],
          steps: [
            "Research and select appropriate tools",
            "Train teaching staff",
            "Pilot with small group",
            "Gather feedback and refine",
            "Roll out to all classes"
          ]
        }
      ];

      return res.json({
        recommendations,
        summary: {
          total: recommendations.length,
          high: recommendations.filter(r => r.priority === 'high').length,
          medium: recommendations.filter(r => r.priority === 'medium').length,
          low: recommendations.filter(r => r.priority === 'low').length
        }
      });
    }

    res.json({ recommendations: [] });
  } catch (e) {
    next(e);
  }
});

// Автоматическая генерация алертов на основе пороговых значений
analyticsAlertsRouter.get("/auto-alerts", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    if (demoMode()) {
      const allStats = computeStudentStats();
      const thresholds = {
        attendanceWarning: 0.75,
        attendanceCritical: 0.60,
        gradeWarning: 65,
        gradeCritical: 50,
        riskThreshold: 40
      };

      const autoAlerts = [];

      // Проверка посещаемости
      const lowAttendance = allStats.filter(s => s.attendanceRate < thresholds.attendanceWarning);
      if (lowAttendance.length > 0) {
        autoAlerts.push({
          type: "attendance_auto",
          severity: lowAttendance.some(s => s.attendanceRate < thresholds.attendanceCritical) ? "high" : "medium",
          title: "Automatic Attendance Alert",
          message: `${lowAttendance.length} students below attendance threshold`,
          affectedStudents: lowAttendance.map(s => s.studentId),
          threshold: thresholds.attendanceWarning * 100,
          currentValue: Math.round(lowAttendance.reduce((sum, s) => sum + s.attendanceRate, 0) / lowAttendance.length * 100)
        });
      }

      // Проверка оценок
      const lowGrades = allStats.filter(s => s.avgGrade < thresholds.gradeWarning);
      if (lowGrades.length > 0) {
        autoAlerts.push({
          type: "grade_auto",
          severity: lowGrades.some(s => s.avgGrade < thresholds.gradeCritical) ? "high" : "medium",
          title: "Automatic Grade Alert",
          message: `${lowGrades.length} students below grade threshold`,
          affectedStudents: lowGrades.map(s => s.studentId),
          threshold: thresholds.gradeWarning,
          currentValue: Math.round(lowGrades.reduce((sum, s) => sum + s.avgGrade, 0) / lowGrades.length)
        });
      }

      // Проверка уровня риска
      const highRisk = allStats.filter(s => s.risk.score < thresholds.riskThreshold);
      if (highRisk.length > 0) {
        autoAlerts.push({
          type: "risk_auto",
          severity: "high",
          title: "Automatic Risk Alert",
          message: `${highRisk.length} students in critical risk zone`,
          affectedStudents: highRisk.map(s => s.studentId),
          threshold: thresholds.riskThreshold,
          avgRiskScore: Math.round(highRisk.reduce((sum, s) => sum + s.risk.score, 0) / highRisk.length)
        });
      }

      return res.json({
        alerts: autoAlerts,
        thresholds,
        generatedAt: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 3600000).toISOString() // Next check in 1 hour
      });
    }

    res.json({ alerts: [], thresholds: {} });
  } catch (e) {
    next(e);
  }
});

function generateDefaultActions(type, severity) {
  const actionMap = {
    risk: ["Review student profile", "Schedule meeting", "Create intervention plan"],
    attendance: ["Send reminder", "Contact parents", "Check for barriers"],
    performance: ["Provide additional resources", "Arrange tutoring", "Adjust learning approach"],
    academic: ["Offer extra credit", "Provide study materials", "Schedule review session"]
  };

  return actionMap[type] || ["Review situation", "Take appropriate action"];
}
