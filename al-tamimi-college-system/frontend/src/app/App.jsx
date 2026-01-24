import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./auth/AuthContext.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { Shell } from "../ui/Shell.jsx";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { SchedulePage } from "../pages/SchedulePage.jsx";
import { NewsPage } from "../pages/NewsPage.jsx";
import { BadgesPage } from "../pages/BadgesPage.jsx";
import { AdminAnalyticsPage } from "../pages/AdminAnalyticsPage.jsx";
import { AdminToolsPage } from "../pages/AdminToolsPage.jsx";
import { TeacherToolsPage } from "../pages/TeacherToolsPage.jsx";
import { JournalPage } from "../pages/JournalPage.jsx";
import { GamificationPage } from "../pages/GamificationPage.jsx";
import { ParentPage } from "../pages/ParentPage.jsx";
import { GoalsPage } from "../pages/GoalsPage.jsx";
import { SocialPage } from "../pages/SocialPage.jsx";

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
        <Route path="goals" element={<GoalsPage />} />
        <Route path="tools" element={<TeacherToolsPage />} />
        <Route path="admin-tools" element={<AdminToolsPage />} />
        <Route path="gamification" element={<GamificationPage />} />
        <Route path="parent" element={<ParentPage />} />
        <Route path="social" element={<SocialPage />} />
      </Route>
    </Routes>
  );
}
