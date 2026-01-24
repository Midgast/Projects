import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./auth/AuthContext.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { Shell } from "../ui/Shell.jsx";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { SchedulePage } from "../pages/SchedulePage.jsx";
import { JournalPage } from "../pages/JournalPage.jsx";
import { NewsPage } from "../pages/NewsPage.jsx";
import { BadgesPage } from "../pages/BadgesPage.jsx";
import { AdminAnalyticsPage } from "../pages/AdminAnalyticsPage.jsx";
import { StudentGoalsPage } from "../pages/StudentGoalsPage.jsx";
import { TeacherToolsPage } from "../pages/TeacherToolsPage.jsx";
import { AdminToolsPage } from "../pages/AdminToolsPage.jsx";
import { GamificationPage } from "../pages/GamificationPage.jsx";
import { ParentPage } from "../pages/ParentPage.jsx";

function Protected({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <Protected>
            <Shell />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="badges" element={<BadgesPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="student-goals" element={<StudentGoalsPage />} />
        <Route path="teacher-tools" element={<TeacherToolsPage />} />
        <Route path="admin-tools" element={<AdminToolsPage />} />
        <Route path="gamification" element={<GamificationPage />} />
        <Route path="parent" element={<ParentPage />} />
      </Route>
    </Routes>
  );
}
