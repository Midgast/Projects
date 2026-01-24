import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { computeStudentStats, computeGroupStats, getTopPerformers, getAtRiskStudents, demo, demoMode } from "../demoStore.js";

export const analyticsReportsRouter = Router();

// Генерация комплексного отчета
analyticsReportsRouter.get("/comprehensive", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { startDate, endDate, includeCharts, format } = req.query;

    if (demoMode()) {
      const allStats = computeStudentStats();
      const groupStats = computeGroupStats();
      const topPerformers = getTopPerformers(10);
      const atRiskStudents = getAtRiskStudents();

      const report = {
        metadata: {
          generatedAt: new Date().toISOString(),
          period: {
            start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: endDate || new Date().toISOString()
          },
          format: format || 'json',
          includeCharts: includeCharts === 'true'
        },
        executiveSummary: {
          totalStudents: allStats.length,
          overallPerformance: Math.round(allStats.reduce((sum, s) => sum + s.performanceIndex, 0) / allStats.length),
          averageAttendance: Math.round(groupStats.avgAttendanceRate * 100),
          averageGrade: Math.round(groupStats.avgGrade),
          riskDistribution: {
            low: allStats.filter(s => s.risk.level === 'green').length,
            medium: allStats.filter(s => s.risk.level === 'yellow').length,
            high: allStats.filter(s => s.risk.level === 'red').length
          }
        },
        detailedAnalysis: {
          topPerformers: topPerformers.map(p => ({
            name: p.studentName,
            performance: p.performanceIndex,
            attendance: Math.round(p.attendanceRate * 100),
            grade: Math.round(p.avgGrade),
            riskLevel: p.risk.level
          })),
          atRiskStudents: atRiskStudents.map(s => ({
            name: s.studentName,
            riskScore: s.risk.score,
            attendance: Math.round(s.attendanceRate * 100),
            grade: Math.round(s.avgGrade),
            recommendations: generateStudentRecommendations(s)
          })),
          subjectPerformance: generateSubjectAnalysis(),
          attendancePatterns: generateAttendancePatterns()
        },
        insights: [
          "Overall performance is improving with 8% increase in average grades",
          "Attendance rates remain stable at 85% average",
          "Mathematics shows higher engagement than Programming",
          "Early intervention needed for 2 students showing declining trends"
        ],
        recommendations: [
          "Implement peer tutoring program for struggling students",
          "Enhance engagement in Programming classes",
          "Recognize and reward top performers",
          "Schedule regular progress reviews"
        ]
      };

      return res.json({
        success: true,
        report,
        downloadUrl: `/api/analytics-reports/download/${Date.now()}`
      });
    }

    res.json({ success: false, message: "Report generation failed" });
  } catch (e) {
    next(e);
  }
});

// Отчет по конкретному студенту
analyticsReportsRouter.get("/student/:studentId", requireAuth, async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { detailed } = req.query;

    if (demoMode()) {
      const studentStats = computeStudentStats(parseInt(studentId));
      
      if (!studentStats) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }

      const report = {
        student: {
          id: studentStats.studentId,
          name: studentStats.studentName,
          currentPerformance: studentStats.performanceIndex,
          riskLevel: studentStats.risk.level,
          riskScore: studentStats.risk.score
        },
        academics: {
          averageGrade: Math.round(studentStats.avgGrade),
          attendanceRate: Math.round(studentStats.attendanceRate * 100),
          totalSessions: studentStats.total,
          attendedSessions: studentStats.attended
        },
        trends: {
          performanceTrend: 'improving',
          attendanceTrend: 'stable',
          gradeProgression: [75, 78, 82, 85, 88],
          attendanceProgression: [85, 87, 83, 90, 88]
        },
        strengths: [
          "Consistent attendance",
          "Strong performance in Mathematics",
          "Active participation in class"
        ],
        areasForImprovement: [
          "Time management skills",
          "Programming concepts",
          "Test anxiety management"
        ],
        recommendations: [
          "Continue current study habits",
          "Seek additional help in Programming",
          "Practice time management techniques"
        ]
      };

      if (detailed === 'true') {
        report.detailedMetrics = {
          subjectBreakdown: {
            "Mathematics": { grade: 92, attendance: 95, engagement: 88 },
            "Programming": { grade: 78, attendance: 82, engagement: 75 }
          },
          monthlyProgress: generateMonthlyProgress(studentStats),
          peerComparison: generatePeerComparison(studentStats, computeStudentStats())
        };
      }

      return res.json({
        success: true,
        report
      });
    }

    res.json({ success: false, message: "Student report generation failed" });
  } catch (e) {
    next(e);
  }
});

// Сравнительный отчет групп
analyticsReportsRouter.get("/group-comparison", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { groupIds } = req.query;

    if (demoMode()) {
      const groups = [
        {
          groupId: 1,
          groupName: "CS-101",
          ...computeGroupStats(),
          demographics: {
            totalStudents: 3,
            averageAge: 19,
            genderDistribution: { male: 2, female: 1 }
          },
          performanceMetrics: {
            topQuartileAverage: 92,
            bottomQuartileAverage: 68,
            standardDeviation: 12.5
          },
          engagementMetrics: {
            classParticipation: 85,
            assignmentCompletion: 92,
            extracurricularInvolvement: 45
          }
        },
        {
          groupId: 2,
          groupName: "CS-102",
          totalStudents: 4,
          avgAttendanceRate: 0.75,
          avgGrade: 72,
          avgPerformanceIndex: 68,
          demographics: {
            totalStudents: 4,
            averageAge: 20,
            genderDistribution: { male: 3, female: 1 }
          },
          performanceMetrics: {
            topQuartileAverage: 88,
            bottomQuartileAverage: 58,
            standardDeviation: 15.2
          },
          engagementMetrics: {
            classParticipation: 72,
            assignmentCompletion: 78,
            extracurricularInvolvement: 38
          }
        }
      ];

      const comparison = {
        groups,
        analysis: {
          bestPerformingGroup: groups[0],
          mostImprovedGroup: groups[1],
          overallTrend: 'positive',
          keyDifferences: [
            "CS-101 shows 10% higher attendance rate",
            "CS-101 has better engagement metrics",
            "CS-102 needs focus on participation"
          ]
        },
        recommendations: [
          "Share best practices from CS-101 with CS-102",
          "Implement peer learning between groups",
          "Address engagement issues in CS-102"
        ]
      };

      return res.json({
        success: true,
        comparison
      });
    }

    res.json({ success: false, message: "Group comparison failed" });
  } catch (e) {
    next(e);
  }
});

// Экспорт данных в различных форматах
analyticsReportsRouter.get("/export/:format", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { format } = req.params;
    const { type, dateRange } = req.query;

    if (demoMode()) {
      const data = generateExportData(type, dateRange);
      
      switch (format.toLowerCase()) {
        case 'csv':
          const csvData = convertToCSV(data);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.csv`);
          return res.send(csvData);
        
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.json`);
          return res.json(data);
        
        case 'pdf':
          // В реальном приложении здесь была бы генерация PDF
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.pdf`);
          return res.send('PDF generation would be implemented here');
        
        default:
          return res.status(400).json({ success: false, message: "Unsupported format" });
      }
    }

    res.json({ success: false, message: "Export failed" });
  } catch (e) {
    next(e);
  }
});

// Вспомогательные функции
function generateStudentRecommendations(student) {
  const recommendations = [];
  
  if (student.attendanceRate < 0.8) {
    recommendations.push("Improve attendance through better time management");
  }
  
  if (student.avgGrade < 70) {
    recommendations.push("Focus on understanding core concepts");
  }
  
  if (student.risk.level === 'red') {
    recommendations.push("Immediate academic intervention required");
  }
  
  if (student.performanceIndex > 85) {
    recommendations.push("Consider advanced coursework opportunities");
  }
  
  return recommendations.length > 0 ? recommendations : ["Continue current performance"];
}

function generateSubjectAnalysis() {
  return {
    "Mathematics": {
      averageGrade: 87,
      attendanceRate: 92,
      engagementScore: 88,
      difficulty: "Medium",
      improvementSuggestions: ["Add practical examples", "Increase problem-solving practice"]
    },
    "Programming": {
      averageGrade: 79,
      attendanceRate: 85,
      engagementScore: 75,
      difficulty: "High",
      improvementSuggestions: ["Provide more hands-on exercises", "Offer additional tutoring"]
    }
  };
}

function generateAttendancePatterns() {
  return {
    dailyPatterns: {
      monday: 85,
      tuesday: 90,
      wednesday: 82,
      thursday: 88,
      friday: 78
    },
    weeklyTrends: [82, 85, 83, 87, 89],
    factors: ["Weather", "Exam schedules", "Holidays"],
    correlations: {
      "attendance vs grades": 0.75,
      "attendance vs engagement": 0.82
    }
  };
}

function generateMonthlyProgress(studentStats) {
  return [
    { month: "Sep", grade: 75, attendance: 85 },
    { month: "Oct", grade: 78, attendance: 87 },
    { month: "Nov", grade: 82, attendance: 83 },
    { month: "Dec", grade: 85, attendance: 90 }
  ];
}

function generatePeerComparison(studentStats, allStats) {
  const percentile = (allStats.filter(s => s.performanceIndex < studentStats.performanceIndex).length / allStats.length) * 100;
  
  return {
    performancePercentile: Math.round(percentile),
    rank: allStats.sort((a, b) => b.performanceIndex - a.performanceIndex).findIndex(s => s.studentId === studentStats.studentId) + 1,
    totalStudents: allStats.length,
    aboveAverage: studentStats.performanceIndex > (allStats.reduce((sum, s) => sum + s.performanceIndex, 0) / allStats.length)
  };
}

function generateExportData(type, dateRange) {
  const allStats = computeStudentStats();
  
  switch (type) {
    case 'students':
      return allStats.map(s => ({
        studentId: s.studentId,
        name: s.studentName,
        performance: s.performanceIndex,
        attendance: Math.round(s.attendanceRate * 100),
        grade: Math.round(s.avgGrade),
        riskLevel: s.risk.level
      }));
    
    case 'summary':
      return {
        totalStudents: allStats.length,
        averagePerformance: Math.round(allStats.reduce((sum, s) => sum + s.performanceIndex, 0) / allStats.length),
        averageAttendance: Math.round(allStats.reduce((sum, s) => sum + s.attendanceRate, 0) / allStats.length * 100),
        riskDistribution: {
          green: allStats.filter(s => s.risk.level === 'green').length,
          yellow: allStats.filter(s => s.risk.level === 'yellow').length,
          red: allStats.filter(s => s.risk.level === 'red').length
        },
        exportDate: new Date().toISOString()
      };
    
    default:
      return allStats;
  }
}

function convertToCSV(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => `"${row[header] || ''}"`).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}
