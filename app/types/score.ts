export interface Score {
  id: number;
  userId: number;
  map: string;
  score: number;
  nightless: boolean;
  hazard: number;
  rankTitle: string;
  rankNum: number;
  date: string;
  formattedDate?: string;
  note: string | null;

  // joined from users table
  username: string;
  avatar: string;
  discordId: string;
}
