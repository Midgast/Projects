import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Award,
  BarChart3,
  PieChart,
  Calendar,
  Filter
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

const Analytics = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [attendanceChart, setAttendanceChart] = useState([])
  const [groupsStats, setGroupsStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Получаем общую аналитику
      const overviewResponse = await api.get('/analytics/overview')
      setAnalytics(overviewResponse.data)
      
      // Получаем график посещаемости
      const chartResponse = await api.get('/analytics/attendance-chart')
      setAttendanceChart(chartResponse.data)
      
      // Получаем статистику по группам
      const groupsResponse = await api.get('/analytics/groups-stats')
      setGroupsStats(groupsResponse.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const getRiskColor = (percentage) => {
    if (percentage >= 85) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskBgColor = (percentage) => {
    if (percentage >= 85) return 'bg-green-100 dark:bg-green-900'
    if (percentage >= 60) return 'bg-yellow-100 dark:bg-yellow-900'
    return 'bg-red-100 dark:bg-red-900'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Аналитика</h1>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="week">Последняя неделя</option>
            <option value="month">Последний месяц</option>
            <option value="quarter">Последний квартал</option>
          </select>
        </div>
      </div>

      {analytics && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Всего студентов</p>
                  <p className="text-2xl font-bold">{analytics.overview.total_students}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Всего групп</p>
                  <p className="text-2xl font-bold">{analytics.overview.total_groups}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Посещаемость</p>
                  <p className="text-2xl font-bold">
                    {analytics.overview.attendance.total_records > 0 
                      ? Math.round((analytics.overview.attendance.present / analytics.overview.attendance.total_records) * 100)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Риск студенты</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.risk_students.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Attendance Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Динамика посещаемости
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={attendanceChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="attendance_percentage" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Groups Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Посещаемость по группам
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={groupsStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, attendance_percentage }) => `${name}: ${attendance_percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="attendance_percentage"
                  >
                    {groupsStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Students and Top Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Students */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Студенты риска (посещаемость &lt; 60%)
              </h3>
              <div className="space-y-3">
                {analytics.risk_students.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Студентов риска нет
                  </p>
                ) : (
                  analytics.risk_students.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <p className="font-medium">{student.username}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.attended_classes}/{student.total_classes} занятий
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBgColor(student.attendance_percentage)} ${getRiskColor(student.attendance_percentage)}`}>
                        {student.attendance_percentage}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Students */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-green-600">
                <Award className="w-5 h-5 mr-2" />
                Лучшие студенты (посещаемость &gt; 85%)
              </h3>
              <div className="space-y-3">
                {analytics.top_students.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Лучших студентов пока нет
                  </p>
                ) : (
                  analytics.top_students.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{student.username}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {student.attended_classes}/{student.total_classes} занятий
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300`}>
                        {student.attendance_percentage}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Analytics
