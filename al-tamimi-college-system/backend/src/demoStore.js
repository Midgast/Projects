export const demo = {
  users: {
    admin: { id: 1, email: "admin@altamimi.local", fullName: "Admin AL TAMIMI", role: "admin", groupId: null },
    teacher: { id: 2, email: "teacher@altamimi.local", fullName: "Aisha Al-Mutairi", role: "teacher", groupId: null },
    student: { id: 3, email: "student@altamimi.local", fullName: "Omar Al Tamimi", role: "student", groupId: 1 },
    parent: { id: 4, email: "parent@altamimi.local", fullName: "Parent Al Tamimi", role: "parent", groupId: null },
    student2: { id: 5, email: "student2@altamimi.local", fullName: "Fatima Al-Rashid", role: "student", groupId: 1 },
    student3: { id: 6, email: "student3@altamimi.local", fullName: "Khalid Al-Saud", role: "student", groupId: 1 },
  },
  groups: [{ id: 1, name: "CS-101" }],
  subjects: [
    { id: 1, name: "Mathematics" },
    { id: 2, name: "Programming" },
  ],
  schedule: [
    {
      id: 1,
      day_of_week: 1,
      start_time: "09:00",
      end_time: "10:30",
      room: "A-12",
      group_id: 1,
      group_name: "CS-101",
      subject_id: 1,
      subject_name: "Mathematics",
      teacher_id: 2,
      teacher_name: "Aisha Al-Mutairi",
    },
    {
      id: 2,
      day_of_week: 3,
      start_time: "11:00",
      end_time: "12:30",
      room: "Lab-1",
      group_id: 1,
      group_name: "CS-101",
      subject_id: 2,
      subject_name: "Programming",
      teacher_id: 2,
      teacher_name: "Aisha Al-Mutairi",
    },
  ],
  news: [
    {
      id: 1,
      title: "Welcome to AL TAMIMI College System",
      body: "Hackathon MVP: schedule, attendance journal, risk indicator and analytics.",
      audience: "all",
      published_at: new Date().toISOString(),
      author_name: "Admin AL TAMIMI",
    },
  ],
  badges: [
    { id: 1, code: "perfect_attendance", title: "Perfect Attendance", description: "No absences for 30 days", color: "emerald" },
    { id: 2, code: "top_performer", title: "Top Performer", description: "High performance index", color: "indigo" },
    { id: 3, code: "helper", title: "Helpful Teammate", description: "Supports classmates", color: "amber" },
  ],
  userBadges: {
    3: [
      {
        code: "helper",
        title: "Helpful Teammate",
        description: "Supports classmates",
        color: "amber",
        awarded_at: new Date().toISOString(),
      },
    ],
  },
  attendance: [
    {
      id: 1,
      date: new Date().toISOString().slice(0, 10),
      status: "present",
      grade: 88,
      comment: "Great work",
      student_id: 3,
      student_name: "Omar Al Tamimi",
      group_id: 1,
      subject_id: 1,
      teacher_id: 2,
    },
    {
      id: 2,
      date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      status: "late",
      grade: 92,
      comment: "Good participation",
      student_id: 3,
      student_name: "Omar Al Tamimi",
      group_id: 1,
      subject_id: 2,
      teacher_id: 2,
    },
    {
      id: 3,
      date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
      status: "absent",
      grade: 0,
      comment: "Absent",
      student_id: 3,
      student_name: "Omar Al Tamimi",
      group_id: 1,
      subject_id: 1,
      teacher_id: 2,
    },
    {
      id: 4,
      date: new Date().toISOString().slice(0, 10),
      status: "present",
      grade: 95,
      comment: "Excellent",
      student_id: 5,
      student_name: "Fatima Al-Rashid",
      group_id: 1,
      subject_id: 1,
      teacher_id: 2,
    },
    {
      id: 5,
      date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      status: "present",
      grade: 87,
      comment: "Good work",
      student_id: 5,
      student_name: "Fatima Al-Rashid",
      group_id: 1,
      subject_id: 2,
      teacher_id: 2,
    },
    {
      id: 6,
      date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
      status: "late",
      grade: 90,
      comment: "Slightly late",
      student_id: 5,
      student_name: "Fatima Al-Rashid",
      group_id: 1,
      subject_id: 1,
      teacher_id: 2,
    },
    {
      id: 7,
      date: new Date().toISOString().slice(0, 10),
      status: "present",
      grade: 78,
      comment: "Good effort",
      student_id: 6,
      student_name: "Khalid Al-Saud",
      group_id: 1,
      subject_id: 1,
      teacher_id: 2,
    },
    {
      id: 8,
      date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      status: "absent",
      grade: 0,
      comment: "Absent",
      student_id: 6,
      student_name: "Khalid Al-Saud",
      group_id: 1,
      subject_id: 2,
      teacher_id: 2,
    },
    {
      id: 9,
      date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
      status: "present",
      grade: 82,
      comment: "Improving",
      student_id: 6,
      student_name: "Khalid Al-Saud",
      group_id: 1,
      subject_id: 1,
      teacher_id: 2,
    },
  ],
};

export function demoMode() {
  return process.env.DEMO_MODE === "true";
}

export function computeStudentStats(studentId = null) {
  // Если studentId не указан, считаем для всех студентов
  const studentIds = studentId ? [studentId] : [3, 5, 6];
  const results = [];
  
  for (const id of studentIds) {
    const rows = demo.attendance.filter((a) => a.student_id === id);
    const attended = rows.filter((r) => r.status === "present" || r.status === "late").length;
    const total = rows.length;
    const avgGrade = total ? rows.reduce((s, r) => s + (r.grade ?? 0), 0) / total : 0;
    const attendanceRate = total ? attended / total : 1;
    const performanceIndex = Math.round(0.6 * avgGrade + 0.4 * attendanceRate * 100);
    const score = Math.round(0.55 * attendanceRate * 100 + 0.45 * performanceIndex);
    const level = score >= 75 ? "green" : score >= 55 ? "yellow" : "red";

    results.push({
      studentId: id,
      studentName: demo.users[`student${id === 3 ? '' : id === 5 ? '2' : '3'}`]?.fullName || `Student ${id}`,
      attended,
      total,
      attendanceRate,
      avgGrade,
      performanceIndex,
      risk: { level, score },
    });
  }
  
  return studentId ? results[0] : results;
}

export function computeGroupStats() {
  const allStats = computeStudentStats();
  const totalStudents = allStats.length;
  const avgAttendanceRate = allStats.reduce((sum, s) => sum + s.attendanceRate, 0) / totalStudents;
  const avgGrade = allStats.reduce((sum, s) => sum + s.avgGrade, 0) / totalStudents;
  const avgPerformanceIndex = allStats.reduce((sum, s) => sum + s.performanceIndex, 0) / totalStudents;
  
  return {
    groupId: 1,
    groupName: demo.groups[0].name,
    totalStudents,
    avgAttendanceRate,
    avgGrade,
    avgPerformanceIndex,
  };
}

export function getTopPerformers(limit = 5) {
  const allStats = computeStudentStats();
  return allStats
    .sort((a, b) => b.performanceIndex - a.performanceIndex)
    .slice(0, limit);
}

export function getAtRiskStudents() {
  const allStats = computeStudentStats();
  return allStats.filter(s => s.risk.level === 'red' || s.risk.level === 'yellow');
}
