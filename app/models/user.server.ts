import { db } from "~/utils/db.server";
import type { User, UserSettings, UserAchievements } from "~/types/user";

export async function getUser(userName: string): Promise<User | null> {
  const row = db
    .prepare<unknown[], User>(
      `
    SELECT *
    FROM users
    WHERE username = ?
  `
    )
    .get(userName);
  return row ?? null;
}

export async function getUserPrivacy(userId: number): Promise<boolean> {
  const row = db
    .prepare<unknown[], UserSettings>(
      `
    SELECT private
    FROM user_settings
    WHERE userId = ?
  `
    )
    .get(userId);

  if (!row) return false;
  const isPrivate = !!row.private;
  return isPrivate;
}

export async function setUserPrivacy(userId: number, isPrivate: boolean) {
  const newPrivacy = isPrivate ? 1 : 0;

  db.prepare(
    `
    UPDATE user_settings
    SET private = ?
    WHERE userId = ?
  `
  ).run(newPrivacy, userId);
}

export async function getUserAchievements(
  userId: number
): Promise<UserAchievements> {
  const row = db
    .prepare(
      `
    SELECT *
    FROM user_achievements
    WHERE userId = ?
  `
    )
    .get(userId);
  return row as UserAchievements;
}

export async function updateUserAchievements(
  userId: number,
  bigRun: string,
  eggstraWork: string,
  grizzBadge: string
) {
  return db
    .prepare(
      `
    UPDATE user_achievements
    SET bigRun = ?, eggstraWork = ?,grizzBadge = ?
    WHERE userId = ?
  `
    )
    .run(bigRun, eggstraWork, grizzBadge, userId);
}

export async function deleteUser(userId: number) {
  db.prepare(`DELETE FROM scores WHERE userId = ?`).run(userId);
  db.prepare(`DELETE FROM user_settings WHERE userId = ?`).run(userId);
  db.prepare(`DELETE FROM user_achievements WHERE userId = ?`).run(userId);
  db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
}
