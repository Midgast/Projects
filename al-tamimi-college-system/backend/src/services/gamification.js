import { z } from "zod";
import { query } from "../db.js";

// Gamification tables
export async function ensureGamificationTables() {
  await query(`
    create table if not exists achievements (
      id serial primary key,
      code text unique not null,
      title text not null,
      description text,
      icon text,
      points integer not null default 0,
      created_at timestamp default now()
    );
  `);

  await query(`
    create table if not exists user_achievements (
      id serial primary key,
      user_id integer not null references users(id) on delete cascade,
      achievement_id integer not null references achievements(id) on delete cascade,
      earned_at timestamp default now(),
      unique(user_id, achievement_id)
    );
  `);

  await query(`
    create table if not exists user_levels (
      user_id integer primary key references users(id) on delete cascade,
      level integer not null default 1,
      xp integer not null default 0,
      updated_at timestamp default now()
    );
  `);

  await query(`
    create table if not exists activity_log (
      id serial primary key,
      user_id integer not null references users(id) on delete cascade,
      action text not null,
      xp integer not null default 0,
      metadata jsonb,
      created_at timestamp default now()
    );
  `);
}

// XP system
export async function addXP(userId, action, xp = 1, metadata = {}) {
  await query(
    `insert into activity_log(user_id, action, xp, metadata)
     values ($1,$2,$3,$4)`,
    [userId, action, xp, metadata]
  );

  const levelRes = await query(
    `update user_levels set xp = xp + $1, updated_at = now()
     where user_id = $2
     returning xp, level`,
    [xp, userId]
  );

  if (levelRes.rows.length === 0) {
    await query(
      `insert into user_levels(user_id, xp, level) values ($1,$2,1)`,
      [userId, xp]
    );
    return { level: 1, xp };
  }

  const { xp: totalXp, level } = levelRes.rows[0];
  const newLevel = Math.floor(totalXp / 100) + 1;
  if (newLevel > level) {
    await query(
      `update user_levels set level = $1, updated_at = now() where user_id = $2`,
      [newLevel, userId]
    );
    return { level: newLevel, xp: totalXp, levelUp: true };
  }
  return { level, xp: totalXp };
}

export async function grantAchievement(userId, achievementCode) {
  const ach = await query(`select id from achievements where code = $1`, [achievementCode]);
  if (ach.rows.length === 0) return null;
  const achId = ach.rows[0].id;

  await query(
    `insert into user_achievements(user_id, achievement_id)
     values ($1,$2)
     on conflict do nothing`,
    [userId, achId]
  );
  return achId;
}

export async function getUserGamification(userId) {
  const level = await query(`select level, xp from user_levels where user_id = $1`, [userId]);
  const achievements = await query(
    `select a.code, a.title, a.description, a.icon, a.points, ua.earned_at
     from user_achievements ua
     join achievements a on a.id = ua.achievement_id
     where ua.user_id = $1
     order by ua.earned_at desc`,
    [userId]
  );
  const leaderboard = await query(
    `select ul.level, ul.xp, u.full_name
     from user_levels ul
     join users u on u.id = ul.user_id
     order by ul.xp desc
     limit 10`
  );

  return {
    level: level.rows[0] || { level: 1, xp: 0 },
    achievements: achievements.rows,
    leaderboard: leaderboard.rows,
  };
}
