import sqlite from "better-sqlite3";
import type { Database } from "better-sqlite3";

let db: Database;

declare global {
  // eslint-disable-next-line no-var
  var __db: Database | undefined;
}

const DB_PATH =
  process.env.NODE_ENV === "production"
    ? "/data/data.sqlite"
    : "./data/data.sqlite";

// Ensure the directory exists in production
if (process.env.NODE_ENV === "production") {
  console.log(`Using database at: ${DB_PATH}`);
}

// This prevents database connection leaks in development
if (process.env.NODE_ENV === "production") {
  db = sqlite(DB_PATH);
  console.log(`Connected to database at ${DB_PATH}`);
} else {
  if (!global.__db) {
    global.__db = sqlite("data.sqlite");
  }
  db = global.__db;
}

// Set up tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discordId TEXT UNIQUE,
    username TEXT,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL REFERENCES users(id),
    private BOOLEAN NOT NULL DEFAULT 0,
    UNIQUE(userId)
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL REFERENCES users(id),
    grizzBadge TEXT NOT NULL,
    bigRun TEXT NOT NULL,
    eggstraWork TEXT NOT NULL,
    UNIQUE(userId)
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER REFERENCES users(id),
    map TEXT NOT NULL,
    score INTEGER NOT NULL,
    nightless BOOL NOT NULL,
    hazard INTEGER,
    rankTitle TEXT,
    rankNum INTEGER,
    date TEXT NOT NULL,
    note TEXT
  );
`);

export { db };
