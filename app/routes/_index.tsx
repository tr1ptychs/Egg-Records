import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getUserAuth } from "~/utils/auth.server";
import { db } from "~/utils/db.server";
import { MainLayout } from "~/components/layout/MainLayout";
import { ScoreCard } from "~/components/scores/ScoreCard";
import { User } from "~/types/user";
import "~/styles/home.css";
import { Score } from "~/types/score";

export const meta = () => {
  return [
    { title: "Egg Records - Track Your Salmon Run High Scores" },
    {
      name: "description",
      content:
        "Track and share your Splatoon 3 Salmon Run: Next Wave scores on a per-map basis. Join with Discord to start tracking your scores today!",
    },
  ];
};

interface LoaderData {
  user: User | null;
  recentScores: Score[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userAuth = await getUserAuth(request);
  const user = userAuth ? (userAuth as User) : null;

  // Get recent global scores with user info
  const recentScores =
    (db
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
      .all() as Score[]) || ([] as Score[]);

  return json<LoaderData>({ user, recentScores });
}

export default function Index() {
  const { user, recentScores } = useLoaderData<typeof loader>();

  return (
    <div>
      <MainLayout user={user} recentScores={recentScores}>
        <h1 className="page-title">Recent Scores</h1>
        {recentScores.length > 0 ? (
          recentScores.map((score: Score) => (
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
