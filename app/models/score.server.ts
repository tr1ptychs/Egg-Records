import { MapScore } from "~/types/user";
import { db } from "~/utils/db.server";

export type Score = {
  id: number;
  userId: number;
  map: string;
  score: number;
  nightless: boolean;
  hazard: number;
  rankTitle: string;
  rankNum: number;
  date: string;
  note?: string;
};

export async function getScores(userId: number): Promise<Score[]> {
  const scores = db
    .prepare(
      `
    SELECT * FROM scores
    WHERE userId = ?
    ORDER BY date DESC
  `
    )
    .all(userId);
  return scores as Score[];
}

export async function createScore({
  userId,
  map,
  score,
  nightless,
  hazard,
  rankTitle,
  rankNum,
  date,
  note,
}: Omit<Score, "id">) {
  return db
    .prepare(
      `
    INSERT INTO scores (userId, map, score, nightless, hazard, rankTitle, rankNum, date, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
    )
    .run(
      userId,
      map,
      score,
      nightless ? 1 : 0,
      hazard,
      rankTitle,
      rankNum,
      date,
      note
    );
}

export async function deleteScore(
  userId: number,
  scoreId: number
): Promise<boolean> {
  // Verify the score belongs to the user before deleting
  const score = db
    .prepare("SELECT * FROM scores WHERE id = ? AND userId = ?")
    .get(scoreId, userId);

  if (!score) return false;

  try {
    db.prepare("DELETE FROM scores WHERE id=?").run(scoreId);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function updateScore({
  userId,
  map,
  score,
  nightless,
  hazard,
  rankTitle,
  rankNum,
  date,
  note,
  id,
}: Score): Promise<boolean> {
  try {
    const existingScore = db
      .prepare(
        `
      SELECT * FROM scores WHERE id = ? AND userId = ?
    `
      )
      .get(id, userId);

    if (!existingScore) return false;

    const result = db
      .prepare(
        `
      UPDATE scores
      SET userId=?, map=?, score=?, nightless=?, hazard=?, rankTitle=?, rankNum=?, date=?, note=?
      WHERE id=?
      `
      )
      .run(
        userId,
        map,
        score,
        nightless ? 1 : 0,
        hazard,
        rankTitle,
        rankNum,
        date,
        note,
        id
      );
    return result.changes === 1;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function getHighScores(userId: number) {
  const row = db
    .prepare(
      `
    SELECT json_group_object(
      map,
      json_object(
        'regular', regular,
        'nightless', nightless
      )
    ) AS highScores
    FROM (
      SELECT
        map,
        MAX(CASE WHEN nightless = 0 THEN score END) AS regular,
        MAX(CASE WHEN nightless = 1 THEN score END) AS nightless
      FROM scores
      WHERE userId = ?
      GROUP BY map
    )
  `
    )
    .get(userId) as { highScores: string | null };
  return row?.highScores
    ? (JSON.parse(row.highScores) as Record<string, MapScore>)
    : {};
}

export async function getRecentScores(): Promise<Score[]> {
  return db
    .prepare(
      `
    SELECT
      scores.*,
      users.username,
      users.avatar,
      users.discordId
    FROM scores
    JOIN users ON scores.userId = users.id
    WHERE scores.userId NOT IN (
      SELECT userId FROM user_settings WHERE private = 1
    )
    ORDER BY scores.date DESC
    LIMIT 20
  `
    )
    .all() as Score[];
}
