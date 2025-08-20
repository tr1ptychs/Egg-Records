import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import type { User } from "~/types/user.ts";
import { db } from "./db.server";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set in .env.`);
  }
  return value;
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [
      process.env.NODE_ENV === "production"
        ? getEnvVar("SESSION_SECRET")
        : "dev-secret",
    ],
    secure: process.env.NODE_ENV === "production",
  },
});

export const auth = new Authenticator(sessionStorage);

const callbackURL =
  process.env.NODE_ENV === "production"
    ? "https://eggrecords.ink/auth/discord/callback"
    : "http://localhost:5173/auth/discord/callback";

auth.use(
  new DiscordStrategy(
    {
      clientID: getEnvVar("DISCORD_CLIENT_ID"),
      clientSecret: getEnvVar("DISCORD_CLIENT_SECRET"),
      callbackURL: callbackURL,
      scope: ["identify"],
    },
    async ({ profile }) => {
      try {
        // try to find the user
        const findUser = db
          .prepare(
            `
          SELECT * FROM users WHERE discordId = ?
        `
          )
          .get(profile.id);

        // If user doesn't exist, set up new user
        if (!findUser) {
          const result = db
            .prepare(
              `
            INSERT INTO users (discordId, username, avatar)
            VALUES (?, ?, ?);
          `
            )
            .run(profile.id, profile.__json.username, profile.__json.avatar);

          const newUser = (await db
            .prepare("SELECT * FROM users WHERE id = ?")
            .get(result.lastInsertRowid)) as User;

          db.prepare(
            "INSERT INTO user_settings (userId, private) VALUES (?, ?)"
          ).run(newUser.id, false);

          db.prepare(
            "INSERT INTO user_achievements (userId, grizzBadge, bigRun, eggstraWork) VALUES (?, ?, ?, ?)"
          ).run(newUser.id, "no-display", "no-display", "no-display");
          return newUser;
        }

        // otherwise, update their info
        db.prepare(
          `
            UPDATE users
            SET username = ?, avatar = ?
            WHERE discordId = ?
          `
        ).run(profile.__json.username, profile.__json.avatar, profile.id);

        const existingUser = db
          .prepare("SELECT * FROM users WHERE discordId = ?")
          .get(profile.id);
        return existingUser;
      } catch (error) {
        console.error("Database error:", error);
        throw error;
      }
    }
  )
);

export async function logout(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function getUserAuth(request: Request) {
  const user = await auth.isAuthenticated(request);
  return user;
}
