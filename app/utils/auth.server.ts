import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { db } from "./db.server";

// Session handling
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET || "dev-secret"],
    secure: process.env.NODE_ENV === "production",
  },
});

export const auth = new Authenticator(sessionStorage);

// Discord strategy
auth.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: "https://salmon-records.fly.dev/auth/discord/callback",
      scope: ['identify', 'email']
    },
    async ({ profile }) => {
      try {
        // First try to find the user
        let user = db.prepare(`
          SELECT * FROM users WHERE discordId = ?
        `).get(profile.id);

        if (!user) {
          // If user doesn't exist, insert new user
          const result = db.prepare(`
            INSERT INTO users (discordId, username, avatar)
            VALUES (?, ?, ?);
          `).run(profile.id, profile.__json.username, profile.__json.avatar);

          user = db.prepare('SELECT * FROM users WHERE id = ?')
            .get(result.lastInsertRowid);
        } else {
          // If user exists, update their info
          db.prepare(`
            UPDATE users 
            SET username = ?, avatar = ?
            WHERE discordId = ?
          `).run(profile.__json.username, profile.__json.avatar, profile.id);
          
          user = db.prepare('SELECT * FROM users WHERE discordId = ?')
            .get(profile.id);
        }

        return user;
      } catch (error) {
        console.error("Database error:", error);
        throw error;
      }
    }
  )
);

// Logout
export async function logout(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}

// Helper to get the logged-in user
export async function getUserAuth(request: Request) {
  const user = await auth.isAuthenticated(request);
  return user;
}
