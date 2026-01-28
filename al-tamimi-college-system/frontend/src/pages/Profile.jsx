import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { User, Mail, Calendar, Award, BookOpen, Target } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [userBadges, setUserBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  })

  useEffect(() => {
    fetchProfileData()
    fetchUserBadges()
  }, [])

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/users/profile')
      setProfileData(response.data)
      setFormData({
        username: response.data.username,
        email: response.data.email
      })
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBadges = async () => {
    try {
      const response = await api.get(`/badges/user/${user?.id}`)
      setUserBadges(response.data)
    } catch (error) {
      console.error('Failed to fetch user badges:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put('/users/profile', formData)
      setEditMode(false)
      fetchProfileData()
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Администратор'
      case 'teacher': return 'Преподаватель'
      case 'student': return 'Студент'
      default: return role
    }
  }

  const getBadgeColor = (color) => {
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-t-lg">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
              {profileData?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">{profileData?.username}</h1>
              <p className="text-blue-100 capitalize">{getRoleText(profileData?.role)}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Основная информация</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Редактировать
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Имя пользователя</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false)
                        setFormData({
                          username: profileData?.username,
                          email: profileData?.email
                        })
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Имя пользователя</p>
                      <p className="font-medium">{profileData?.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium">{profileData?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Дата регистрации</p>
                      <p className="font-medium">{formatDate(profileData?.created_at)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats & Badges */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Достижения</h2>
              
              {/* Quick Stats */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Бейджи</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{userBadges.length}</span>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Роль</span>
                    </div>
                    <span className="text-lg font-bold text-green-600 capitalize">
                      {getRoleText(profileData?.role)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 className="text-lg font-medium mb-4">Мои бейджи</h3>
                {userBadges.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Award className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      У вас пока нет бейджей
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userBadges.map((badge, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getBadgeColor(badge.color)}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{badge.icon}</div>
                          <div className="flex-1">
                            <p className="font-medium">{badge.name}</p>
                            <p className="text-sm opacity-75">{badge.description}</p>
                            {badge.reason && (
                              <p className="text-xs opacity-60 mt-1">{badge.reason}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
