import { z } from "zod";

// Gamification tables
export async function ensureGamificationTables() {
  // Skip in demo mode
  if (process.env.DEMO_MODE === "true") return;
  // Implementation would go here if DB available
}

// XP system
export async function addXP(userId, action, xp = 1, metadata = {}) {
  // Demo mode: no-op
  if (process.env.DEMO_MODE === "true") return { level: 1, xp };
  // Implementation would go here if DB available
}

export async function grantAchievement(userId, achievementCode) {
  // Demo mode: no-op
  if (process.env.DEMO_MODE === "true") return null;
  // Implementation would go here if DB available
}

export async function getUserGamification(userId) {
  // Demo mode: return mock data
  if (process.env.DEMO_MODE === "true") {
    return {
      level: { level: 3, xp: 250 },
      achievements: [
        { code: "first_login", title: "First Login", description: "Logged in for the first time", icon: "🎉", points: 10, earned_at: new Date().toISOString() },
      ],
      leaderboard: [
        { level: 5, xp: 520, full_name: "Alice" },
        { level: 4, xp: 410, full_name: "Bob" },
        { level: 3, xp: 250, full_name: "You" },
      ],
    };
  }
  // Implementation would go here if DB available
}
