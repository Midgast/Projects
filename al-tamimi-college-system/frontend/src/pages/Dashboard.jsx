import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Award,
  BookOpen,
  Clock,
  Target
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard')
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPerformanceColor = (index) => {
    if (index >= 85) return 'text-green-600'
    if (index >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.full_name}! Here's your overview.
        </p>
      </div>

      {user?.role === 'admin' && dashboardData?.total_stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardData.total_stats.total_users}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardData.total_stats.total_students}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardData.total_stats.total_teachers}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">78%</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.performance_distribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(dashboardData.performance_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.risk_distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="risk_level" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Performance</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Attendance</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.top_performers?.map((student, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student.full_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${getPerformanceColor(student.performance_index)}`}>
                          {student.performance_index}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{student.attendance_rate}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(student.risk_level)}`}>
                          {student.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {user?.role === 'teacher' && dashboardData?.students && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Students</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.students?.map((student, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{student.full_name}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(student.risk_level)}`}>
                    {student.risk_level}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Performance:</span>
                    <span className={`font-medium ${getPerformanceColor(student.performance_index)}`}>
                      {student.performance_index}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-medium text-gray-900">{student.attendance_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Group:</span>
                    <span className="font-medium text-gray-900">{student.group_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {user?.role === 'student' && dashboardData?.student_stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">
                    {dashboardData.student_stats.performance_index}%
                  </p>
                  <p className="text-sm text-blue-700">Performance Index</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">
                    {dashboardData.student_stats.attendance_rate}%
                  </p>
                  <p className="text-sm text-green-700">Attendance Rate</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-yellow-900 capitalize">
                    {dashboardData.student_stats.risk_level}
                  </p>
                  <p className="text-sm text-yellow-700">Risk Level</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
              <div className="space-y-2">
                {dashboardData.attendance_history?.slice(0, 5).map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        record.status === 'present' ? 'bg-green-500' :
                        record.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{record.subject_name}</p>
                        <p className="text-sm text-gray-600">{record.teacher_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 capitalize">{record.status}</p>
                      <p className="text-xs text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Badges</h3>
            <div className="space-y-3">
              {dashboardData.badges?.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{badge.icon}</div>
                  <div>
                    <p className="font-medium text-gray-900">{badge.name}</p>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Earned: {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
