# AL TAMIMI College System - Demo Setup

## 🚀 Quick Start

### Backend Setup (PHP + Open Server)

1. **Create Database**
   ```sql
   CREATE DATABASE al_tamimi_college;
   ```

2. **Import Database**
   ```bash
   mysql -u root -p al_tamimi_college < backend/database.sql
   ```

3. **Configure Open Server**
   - Add domain: `al-tamimi.local`
   - Point to: `backend` folder
   - PHP 8.0+ required
   - MySQL/MariaDB required

4. **Update Passwords**
   ```php
   // backend/config.php
   define('DB_PASS', 'your_mysql_password');
   ```

### Frontend Setup (React)

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL**
   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🎯 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@altamimi.edu | admin123 |
| Teacher | teacher1@altamimi.edu | teacher123 |
| Student | student1@altamimi.edu | student123 |

## 🏆 Features for Hackathon

### ✅ Core Features
- [x] Multi-role authentication (Admin/Teacher/Student)
- [x] Dashboard with analytics
- [x] Performance indicators (Green/Yellow/Red)
- [x] Risk level assessment
- [x] Attendance tracking
- [x] Schedule management
- [x] Badge system for motivation

### 🎨 Visual Features
- [x] Modern UI with Tailwind CSS
- [x] Responsive design (PC/Tablet/Mobile)
- [x] Interactive charts (Recharts)
- [x] Color-coded performance indicators
- [x] Professional dashboard layouts

### 📊 Analytics
- [x] Performance distribution charts
- [x] Risk level analytics
- [x] Top performers leaderboard
- [x] Attendance statistics
- [x] Real-time data updates

## 🎪 Demo Script for Hackathon

1. **Admin Login** (admin@altamimi.edu / admin123)
   - Show overview dashboard
   - Display total users, students, teachers
   - Show performance distribution chart
   - Highlight risk level analytics
   - Show top performers

2. **Teacher View**
   - Show student list with performance indicators
   - Demonstrate color-coded risk levels
   - Show attendance tracking
   - Display class analytics

3. **Student View**
   - Show personal performance dashboard
   - Display badges and achievements
   - Show attendance history
   - Demonstrate progress tracking

4. **Key Features to Highlight**
   - Real-time analytics
   - Color-coded risk indicators
   - Motivation system with badges
   - Mobile responsive design
   - Easy-to-use interface

## 🏆 Competitive Advantages

1. **Visual Analytics** - Color-coded performance indicators
2. **Risk Management** - Proactive student risk identification
3. **Gamification** - Badge system for student motivation
4. **Mobile Ready** - Works on all devices
5. **Real-time Data** - Live updates and analytics
6. **Role-based Access** - Different views for different users

## 🎯 Hackathon Success Metrics

- ✅ **Problem Solving**: Replaces paper journals
- ✅ **Innovation**: Color-coded risk indicators
- ✅ **User Experience**: Intuitive, modern interface
- ✅ **Technical**: Full-stack with real-time analytics
- ✅ **Presentation**: Clear demo script prepared

## 📱 Mobile Testing

Open on mobile devices to test responsive design:
- http://localhost:3000 (frontend)
- All features work on mobile
- Touch-friendly interface
- Optimized charts for small screens
