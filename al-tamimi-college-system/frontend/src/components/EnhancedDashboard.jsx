import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Edit, Trash2, Eye, Calendar, Users, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../app/auth/AuthContext.jsx';
import { useToast } from './ui/Toast.jsx';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';
import { Input } from './ui/Input.jsx';
import { Badge } from './ui/Badge.jsx';
import { DataTable } from './ui/DataTable.jsx';
import { formatDate, calculateGradeColor, exportToCSV } from '../lib/utils.js';

export function EnhancedDashboard() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    avgAttendance: 0,
    avgPerformance: 0,
    recentActivity: [],
    upcomingEvents: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalStudents: 156,
        totalTeachers: 24,
        avgAttendance: 87.5,
        avgPerformance: 78.3,
        recentActivity: [
          { id: 1, type: 'grade', message: 'Новая оценка добавлена', time: '5 мин назад' },
          { id: 2, type: 'attendance', message: 'Посещаемость обновлена', time: '1 час назад' },
          { id: 3, type: 'badge', message: 'Студент награжден бейджем', time: '2 часа назад' },
        ],
        upcomingEvents: [
          { id: 1, title: 'Родительское собрание', date: '2024-01-25', time: '18:00' },
          { id: 2, title: 'Контрольная работа', date: '2024-01-26', time: '10:00' },
        ]
      });
    } catch (err) {
      error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {change && (
              <p className={`text-sm mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change > 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-500/20`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Всего студентов"
          value={stats.totalStudents}
          change={5.2}
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Всего учителей"
          value={stats.totalTeachers}
          change={2.1}
          color="green"
        />
        <StatCard
          icon={Calendar}
          title="Посещаемость"
          value={`${stats.avgAttendance}%`}
          change={1.8}
          color="yellow"
        />
        <StatCard
          icon={TrendingUp}
          title="Успеваемость"
          value={`${stats.avgPerformance}%`}
          change={3.4}
          color="purple"
        />
      </div>

      {/* Recent Activity and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                >
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{activity.message}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Предстоящие события</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                >
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{event.title}</p>
                    <p className="text-xs text-slate-400">{formatDate(event.date)} в {event.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-auto p-4 flex-col gap-2">
              <Plus className="w-6 h-6" />
              <span>Добавить студента</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Edit className="w-6 h-6" />
              <span>Редактировать расписание</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Award className="w-6 h-6" />
              <span>Наградить бейджем</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>Просмотреть аналитику</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
