import { db } from "~/utils/db.server";

export async function getUser(userName: string) {
  return db.prepare(`
    SELECT * 
    FROM users 
    WHERE username = ?
  `).get(userName);
}

export async function getUserPrivacy(userId: number) {
  return db.prepare(`
    SELECT private
    FROM user_settings
    WHERE userId = ?
  `).get(userId);
}

export async function getUserAchievements(userId: number) {
  return db.prepare(`
    SELECT *
    FROM user_achievements
    WHERE userId = ?
  `).get(userId);
}

export async function updateUserAchievements(userId: number, bigRun: text, eggstraWork: text, grizzBadge: text) {
  return db.prepare(`
    UPDATE user_Achievements
    SET bigRun = ?
    SET eggstraWork = ?
    SET grizzBadge = ?
    WHERE userId = ?
  `).run(userId, bigRun, eggstraWork, grizzBadge);
}
