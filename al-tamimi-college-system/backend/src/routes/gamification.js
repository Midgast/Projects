import { Router } from "express";
import { ensureGamificationTables, addXP, grantAchievement, getUserGamification } from "../services/gamification.js";
import { requireAuth } from "../middleware/auth.js";
import { demo, demoMode } from "../demoStore.js";
import { query } from "../db.js";

export const gamificationRouter = Router();

ensureGamificationTables();

// Get user gamification data
gamificationRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      return res.json({
        level: { level: 3, xp: 250 },
        achievements: [
          { code: "first_login", title: "First Login", description: "Logged in for the first time", icon: "🎉", points: 10, earned_at: new Date().toISOString() },
        ],
        leaderboard: [
          { level: 5, xp: 520, full_name: "Alice" },
          { level: 4, xp: 410, full_name: "Bob" },
          { level: 3, xp: 250, full_name: "You" },
        ],
      });
    }
    const data = await getUserGamification(Number(req.user.sub));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// Leaderboard
gamificationRouter.get("/leaderboard", requireAuth, async (req, res, next) => {
  try {
    if (demoMode()) {
      return res.json([
        { level: 5, xp: 520, full_name: "Alice" },
        { level: 4, xp: 410, full_name: "Bob" },
        { level: 3, xp: 250, full_name: "You" },
      ]);
    }
    const lb = await query(
      `select ul.level, ul.xp, u.full_name
       from user_levels ul
       join users u on u.id = ul.user_id
       order by ul.xp desc
       limit 20`
    );
    res.json(lb.rows);
  } catch (e) {
    next(e);
  }
});

// Manual XP grant (admin)
gamificationRouter.post("/grant-xp", requireAuth, async (req, res, next) => {
  try {
    const { userId, action, xp } = req.body;
    const result = await addXP(userId, action, xp);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Manual achievement grant (admin)
gamificationRouter.post("/grant-achievement", requireAuth, async (req, res, next) => {
  try {
    const { userId, achievementCode } = req.body;
    const result = await grantAchievement(userId, achievementCode);
    res.json({ granted: !!result });
  } catch (e) {
    next(e);
  }
});
