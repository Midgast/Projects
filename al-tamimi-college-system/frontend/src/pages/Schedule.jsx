import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2 } from 'lucide-react'

const Schedule = () => {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState('monday')
  const [showAddForm, setShowAddForm] = useState(false)

  const days = [
    { value: 'monday', label: 'Понедельник' },
    { value: 'tuesday', label: 'Вторник' },
    { value: 'wednesday', label: 'Среда' },
    { value: 'thursday', label: 'Четверг' },
    { value: 'friday', label: 'Пятница' },
    { value: 'saturday', label: 'Суббота' },
    { value: 'sunday', label: 'Воскресенье' }
  ]

  useEffect(() => {
    fetchSchedule()
  }, [selectedDay])

  const fetchSchedule = async () => {
    try {
      const response = await api.get(`/schedule?day_of_week=${selectedDay}`)
      setSchedule(response.data)
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSubjectColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }
    return colors[color] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Расписание</h1>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Добавить занятие</span>
          </button>
        )}
      </div>

      {/* Day selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {days.map(day => (
            <button
              key={day.value}
              onClick={() => setSelectedDay(day.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedDay === day.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule list */}
      <div className="space-y-4">
        {schedule.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              На этот день занятий нет
            </p>
          </div>
        ) : (
          schedule.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(item.subject_color)}`}>
                      {item.subject_name}
                    </span>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {item.start_time} - {item.end_time}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4 mr-2" />
                      <span>{item.teacher_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Аудитория {item.room}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{item.group_name}</span>
                    </div>
                  </div>
                </div>
                
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                  <div className="flex space-x-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add form modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Добавить занятие</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Предмет</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  <option>Выберите предмет</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Группа</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  <option>Выберите группу</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Время начала</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Время окончания</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Аудитория</label>
                <input type="text" placeholder="Например: 101" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule
