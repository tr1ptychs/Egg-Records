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

export async function getScores(userId: number) {
  return db.prepare(`
    SELECT * FROM scores 
    WHERE userId = ? 
    ORDER BY date DESC
  `).all(userId);
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
  note 
}: Omit<Score, "id">) {
  return db.prepare(`
    INSERT INTO scores (userId, map, score, nightless, hazard, rankTitle, rankNum, date, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, map, score, nightless ? 1 : 0, hazard, rankTitle, rankNum, date, note);
}

export async function getHighScores(userId: number) {
  return db.prepare(`
    SELECT map, MAX(score) as highScore
    FROM scores
    WHERE userId = ?
    GROUP BY map
  `).all(userId);
}
