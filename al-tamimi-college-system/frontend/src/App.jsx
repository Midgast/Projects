import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Attendance from './pages/Attendance'
import Analytics from './pages/Analytics'
import News from './pages/News'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="news" element={<News />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<AdminPanel />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
