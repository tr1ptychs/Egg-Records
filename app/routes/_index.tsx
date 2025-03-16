import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { getUserAuth } from "~/utils/auth.server";
import { db } from "~/utils/db.server";
import { MainLayout } from "~/components/layout/MainLayout"
import { ScoreCard } from "~/components/scores/ScoreCard";
import { User } from "~/types/user";
import "~/styles/home.css"

export const meta = () => {
  return [{ title: "Egg Records" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserAuth(request);
  
  // Get recent global scores with user info
  const recentScores = db.prepare(`
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
  `).all() || [];

  // Get user stats if logged in
  let userStats = null;
  if (user) {
    const stats = {
      totalGames: db.prepare('SELECT COUNT(*) as count FROM scores WHERE userId = ?')
        .get(user.id),
      averageScore: db.prepare('SELECT AVG(score) as avg FROM scores WHERE userId = ?')
        .get(user.id),
      highestScore: db.prepare('SELECT MAX(score) as max FROM scores WHERE userId = ?')
        .get(user.id)
    };

    userStats = {
      totalGames: stats.totalGames?.count || 0,
      averageScore: Math.round(stats.averageScore?.avg || 0),
      highestScore: stats.highestScore?.max || 0
    };
  }

  return json({ recentScores, userStats });
}

export default function Index() {
  const { recentScores, userStats } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<{ user: User }>();

  return (
    <div>
    <MainLayout user={user} userStats={userStats}>
      <h1 className="page-title">Recent Scores</h1>
      {recentScores.length > 0 ? (
        recentScores.map((score) => (
          <ScoreCard key={score.id} score={score} />
        ))
      ) : (
        <div className="empty-state">
          <p>No scores yet! Be the first to add one 🦈</p>
        </div>
      )}
    </MainLayout>
    </div>
  );
}
