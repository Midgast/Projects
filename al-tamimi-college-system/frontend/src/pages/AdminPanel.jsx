import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { 
  Users, 
  Settings, 
  Database, 
  Shield,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  BookOpen,
  Calendar,
  Award
} from 'lucide-react'

const AdminPanel = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showBadgeForm, setShowBadgeForm] = useState(false)

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'badges') {
      fetchBadges()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBadges = async () => {
    try {
      const response = await api.get('/badges')
      setBadges(response.data)
    } catch (error) {
      console.error('Failed to fetch badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Администратор'
      case 'teacher': return 'Преподаватель'
      case 'student': return 'Студент'
      default: return role
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'teacher': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <Shield className="w-16 h-16 mx-auto text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Доступ запрещен</h1>
          <p className="text-red-600">
            У вас нет прав для доступа к админской панели
          </p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'badges', label: 'Бейджи', icon: Award },
    { id: 'system', label: 'Система', icon: Settings },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Админская панель</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Управление системой и пользователями
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Управление пользователями</h2>
              <button
                onClick={() => setShowUserForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить пользователя</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Пользователь
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Роль
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Дата регистрации
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {userItem.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{userItem.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(userItem.role)}`}>
                            {getRoleText(userItem.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {userItem.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(userItem.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Управление бейджами</h2>
              <button
                onClick={() => setShowBadgeForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Создать бейдж</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{badge.icon}</div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{badge.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {badge.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {badge.type}
                      </span>
                      <span className="text-gray-500">
                        Требуется: {badge.required_value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Системные настройки</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Database className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-semibold mb-2">База данных</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Управление резервными копиями и миграциями
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Создать резервную копию
                </button>
              </div>
              
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Settings className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="font-semibold mb-2">Конфигурация</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Настройки системы и параметры
                </p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Открыть настройки
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Системная аналитика</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-semibold mb-2">Активные пользователи</h3>
                <p className="text-3xl font-bold text-blue-600">247</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  За последние 7 дней
                </p>
              </div>
              
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Calendar className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="font-semibold mb-2">Записей в расписании</h3>
                <p className="text-3xl font-bold text-green-600">156</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  На эту неделю
                </p>
              </div>
              
              <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Award className="w-8 h-8 text-purple-600 mb-4" />
                <h3 className="font-semibold mb-2">Выдано бейджей</h3>
                <p className="text-3xl font-bold text-purple-600">89</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Всего в системе
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
