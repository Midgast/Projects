import React, { useEffect, useState } from "react";
import { Wrench, Award, Users, Calendar, BookOpen, Target, TrendingUp, Clock, X, Search, Filter, Download, Plus, Edit, Trash2, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";

import { useAuth } from "../app/auth/AuthContext.jsx";
import { apiFetch } from "../app/api.js";
import { useI18n } from "../app/i18n/I18nContext.jsx";

export function TeacherToolsModal({ isOpen, onClose }) {
  const { token, user } = useAuth();
  const { t } = useI18n();
  
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [badges, setBadges] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [newGrade, setNewGrade] = useState({ studentId: "", subject: "", value: "", comment: "" });

  useEffect(() => {
    if (isOpen) {
      loadTeacherData();
    }
  }, [isOpen]);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const [studentsData, badgesData, scheduleData, gradesData] = await Promise.all([
        apiFetch("/api/teacher/students", { token }),
        apiFetch("/api/badges", { token }),
        apiFetch("/api/teacher/schedule", { token }),
        apiFetch("/api/teacher/grades", { token })
      ]);
      
      setStudents(studentsData || []);
      setBadges(badgesData || []);
      setSchedule(scheduleData || []);
      setGrades(gradesData || []);
    } catch (error) {
      console.error("Failed to load teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  const awardBadge = async () => {
    if (!selectedStudent || !selectedBadge) return;
    
    try {
      await apiFetch(`/api/badges/award`, {
        token,
        method: "POST",
        body: {
          studentId: selectedStudent.id,
          badgeId: selectedBadge.id,
          reason: "Отличная работа"
        }
      });
      
      setShowAwardModal(false);
      setSelectedStudent(null);
      setSelectedBadge(null);
      loadTeacherData(); // Reload data
    } catch (error) {
      console.error("Failed to award badge:", error);
    }
  };

  const addGrade = async () => {
    try {
      await apiFetch(`/api/teacher/grades`, {
        token,
        method: "POST",
        body: newGrade
      });
      
      setShowGradeModal(false);
      setNewGrade({ studentId: "", subject: "", value: "", comment: "" });
      loadTeacherData(); // Reload data
    } catch (error) {
      console.error("Failed to add grade:", error);
    }
  };

  const exportData = async (type) => {
    try {
      const data = await apiFetch(`/api/teacher/export/${type}`, { 
        token,
        headers: { 'Content-Type': 'application/csv' }
      });
      
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Wrench className="text-brand-400" size={24} />
            <h2 className="text-xl font-bold text-white">{t("teacher_tools")}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportData('students')}
              className="btn-ghost p-2 hover:bg-green-500/20 hover:text-green-400"
              title={t("export")}
            >
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className="btn-ghost p-2 hover:bg-red-500/20 hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex p-1">
            {[
              { id: "students", icon: Users, label: t("students") },
              { id: "badges", icon: Award, label: t("badges") },
              { id: "schedule", icon: Calendar, label: t("schedule") },
              { id: "grades", icon: BookOpen, label: t("grades") },
              { id: "analytics", icon: BarChart3, label: t("analytics") }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id 
                    ? "bg-brand-500 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-160px)] overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center w-full h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Students Tab */}
              {activeTab === "students" && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t("search_students")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-slate-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                      />
                    </div>
                    <button
                      onClick={() => setShowAwardModal(true)}
                      className="btn-primary"
                    >
                      <Award size={16} className="mr-2" />
                      {t("award_badge")}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredStudents.map(student => (
                      <div key={student.id} className="card p-4 hover:border-brand-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-white">{student.name}</div>
                              <div className="text-xs text-slate-400">{student.email}</div>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.attendance > 90 ? 'bg-green-500/20 text-green-300' :
                            student.attendance > 70 ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {student.attendance}% {t("attendance")}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">{t("performance")}</span>
                            <span className="font-medium text-white">{student.performance}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">{t("badges")}</span>
                            <span className="font-medium text-white">{student.badgesCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">{t("risk_level")}</span>
                            <span className={`font-medium ${
                              student.risk === 'low' ? 'text-green-400' :
                              student.risk === 'medium' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {t(student.risk)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowAwardModal(true);
                            }}
                            className="flex-1 btn-ghost text-xs py-1"
                          >
                            <Award size={12} className="mr-1" />
                            {t("award")}
                          </button>
                          <button
                            onClick={() => {
                              setNewGrade({ ...newGrade, studentId: student.id });
                              setShowGradeModal(true);
                            }}
                            className="flex-1 btn-ghost text-xs py-1"
                          >
                            <BookOpen size={12} className="mr-1" />
                            {t("add_grade")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges Tab */}
              {activeTab === "badges" && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{t("available_badges")}</h3>
                    <button className="btn-primary">
                      <Plus size={16} className="mr-2" />
                      {t("create_badge")}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {badges.map(badge => (
                      <div key={badge.id} className="card p-4 hover:border-brand-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-3xl">{badge.icon}</div>
                          <div>
                            <div className="font-medium text-white">{badge.name}</div>
                            <div className="text-xs text-slate-400">{badge.category}</div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{badge.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{t("awarded")}: {badge.awardedCount}</span>
                          <button
                            onClick={() => {
                              setSelectedBadge(badge);
                              setShowAwardModal(true);
                            }}
                            className="btn-ghost text-xs py-1"
                          >
                            {t("award")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === "schedule" && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{t("my_schedule")}</h3>
                    <button className="btn-primary">
                      <Plus size={16} className="mr-2" />
                      {t("add_lesson")}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {schedule.map((lesson, index) => (
                      <div key={index} className="card p-4 hover:border-brand-500/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-xs text-slate-400">{t(lesson.day)}</div>
                              <div className="text-lg font-bold text-white">{lesson.time}</div>
                            </div>
                            <div>
                              <div className="font-medium text-white">{lesson.subject}</div>
                              <div className="text-sm text-slate-400">{lesson.group}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">{lesson.room}</span>
                            <button className="btn-ghost p-2 hover:bg-white/10">
                              <Edit size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grades Tab */}
              {activeTab === "grades" && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{t("recent_grades_teacher")}</h3>
                    <button
                      onClick={() => setShowGradeModal(true)}
                      className="btn-primary"
                    >
                      <Plus size={16} className="mr-2" />
                      {t("add_grade")}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left p-2 font-medium text-slate-300">{t("student")}</th>
                          <th className="text-left p-2 font-medium text-slate-300">{t("subject_teacher")}</th>
                          <th className="text-left p-2 font-medium text-slate-300">{t("grade_teacher")}</th>
                          <th className="text-left p-2 font-medium text-slate-300">{t("date")}</th>
                          <th className="text-left p-2 font-medium text-slate-300">{t("comment_teacher")}</th>
                          <th className="text-left p-2 font-medium text-slate-300">{t("actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((grade, index) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-2 text-slate-200">{grade.studentName}</td>
                            <td className="p-2 text-slate-200">{grade.subject}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                grade.value >= 90 ? 'bg-green-500/20 text-green-300' :
                                grade.value >= 70 ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {grade.value}
                              </span>
                            </td>
                            <td className="p-2 text-slate-200">{new Date(grade.date).toLocaleDateString()}</td>
                            <td className="p-2 text-slate-200">{grade.comment}</td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <button className="btn-ghost p-1 hover:bg-white/10">
                                  <Edit size={14} />
                                </button>
                                <button className="btn-ghost p-1 hover:bg-red-500/20 hover:text-red-400">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div className="w-full space-y-6">
                  <h3 className="text-lg font-semibold text-white">{t("class_analytics")}</h3>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="card border-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-blue-300">{t("total_students")}</div>
                          <div className="mt-1 text-2xl font-bold text-white">{students.length}</div>
                        </div>
                        <Users className="text-blue-400" size={24} />
                      </div>
                    </div>

                    <div className="card border-gradient-to-r from-green-500/20 to-emerald-500/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-green-300">{t("avg_attendance")}</div>
                          <div className="mt-1 text-2xl font-bold text-white">
                            {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length) : 0}%
                          </div>
                        </div>
                        <Target className="text-green-400" size={24} />
                      </div>
                    </div>

                    <div className="card border-gradient-to-r from-purple-500/20 to-pink-500/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-purple-300">{t("avg_performance")}</div>
                          <div className="mt-1 text-2xl font-bold text-white">
                            {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.performance, 0) / students.length) : 0}%
                          </div>
                        </div>
                        <TrendingUp className="text-purple-400" size={24} />
                      </div>
                    </div>

                    <div className="card border-gradient-to-r from-orange-500/20 to-red-500/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-orange-300">{t("risk_students")}</div>
                          <div className="mt-1 text-2xl font-bold text-white">
                            {students.filter(s => s.risk === 'high').length}
                          </div>
                        </div>
                        <AlertCircle className="text-orange-400" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h4 className="mb-4 font-medium text-white">{t("performance_distribution")}</h4>
                    <div className="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-lg">
                      <div className="text-center">
                        <BarChart3 size={48} className="mx-auto text-slate-400 mb-2" />
                        <div className="text-slate-400">{t("chart_placeholder")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Award Badge Modal */}
        {showAwardModal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
            <div className="card w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t("award_badge")}</h3>
              
              {!selectedStudent && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t("select_student")}</label>
                  <select
                    value={selectedStudent?.id || ""}
                    onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  >
                    <option value="">{t("choose_student")}</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {!selectedBadge && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t("select_badge")}</label>
                  <select
                    value={selectedBadge?.id || ""}
                    onChange={(e) => setSelectedBadge(badges.find(b => b.id === e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  >
                    <option value="">{t("choose_badge")}</option>
                    {badges.map(badge => (
                      <option key={badge.id} value={badge.id}>{badge.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAwardModal(false);
                    setSelectedStudent(null);
                    setSelectedBadge(null);
                  }}
                  className="flex-1 btn-ghost"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={awardBadge}
                  disabled={!selectedStudent || !selectedBadge}
                  className="flex-1 btn-primary"
                >
                  {t("award")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Grade Modal */}
        {showGradeModal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
            <div className="card w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t("add_grade")}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t("student")}</label>
                  <select
                    value={newGrade.studentId}
                    onChange={(e) => setNewGrade({ ...newGrade, studentId: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  >
                    <option value="">{t("choose_student")}</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t("subject_teacher")}</label>
                  <input
                    type="text"
                    value={newGrade.subject}
                    onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t("grade_teacher")}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newGrade.value}
                    onChange={(e) => setNewGrade({ ...newGrade, value: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t("comment_teacher")}</label>
                  <textarea
                    value={newGrade.comment}
                    onChange={(e) => setNewGrade({ ...newGrade, comment: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowGradeModal(false);
                    setNewGrade({ studentId: "", subject: "", value: "", comment: "" });
                  }}
                  className="flex-1 btn-ghost"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={addGrade}
                  disabled={!newGrade.studentId || !newGrade.subject || !newGrade.value}
                  className="flex-1 btn-primary"
                >
                  {t("add")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
