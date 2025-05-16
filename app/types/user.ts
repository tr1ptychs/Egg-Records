export interface User {
  id: number;
  discordId: string;
  username: string;
  avatar: string | null;
}

export interface UserSettings {
  id?: number;
  userId?: number;
  private?: boolean;
}

export interface UserAchievements {
  id?: number;
  userId?: number;
  grizzBadge: "no-display" | "bronze" | "silver" | "gold";
  bigRun: "no-display" | "normal" | "silver" | "gold";
  eggstraWork: "no-display" | "bronze" | "silver" | "gold";
}

export interface UserStats {
  totalGames: number;
  highestScore: number;
}

export interface ScoreRecord {
  score: number | null;
}

export interface MapScore {
  regular: ScoreRecord;
  nightless: ScoreRecord;
  bestOverall: ScoreRecord & {
    isNightless: boolean;
  };
}
