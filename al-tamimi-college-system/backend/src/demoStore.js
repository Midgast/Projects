export const demo = {
  users: {
    admin: { id: 1, email: "admin@altamimi.local", fullName: "Admin AL TAMIMI", role: "admin", groupId: null },
    teacher: { id: 2, email: "teacher@altamimi.local", fullName: "Aisha Al-Mutairi", role: "teacher", groupId: null },
    student: { id: 3, email: "student@altamimi.local", fullName: "Omar Al Tamimi", role: "student", groupId: 1 },
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
  ],
};

export function demoMode() {
  return process.env.DEMO_MODE === "true";
}

export function computeStudentStats() {
  const rows = demo.attendance.filter((a) => a.student_id === 3);
  const attended = rows.filter((r) => r.status === "present" || r.status === "late").length;
  const total = rows.length;
  const avgGrade = total ? rows.reduce((s, r) => s + (r.grade ?? 0), 0) / total : 0;
  const attendanceRate = total ? attended / total : 1;
  const performanceIndex = Math.round(0.6 * avgGrade + 0.4 * attendanceRate * 100);
  const score = Math.round(0.55 * attendanceRate * 100 + 0.45 * performanceIndex);
  const level = score >= 75 ? "green" : score >= 55 ? "yellow" : "red";

  return {
    attended,
    total,
    attendanceRate,
    avgGrade,
    performanceIndex,
    risk: { level, score },
  };
}
