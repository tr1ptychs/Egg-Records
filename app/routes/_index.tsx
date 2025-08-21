import { useLoaderData, useOutletContext } from "@remix-run/react";
import { json } from "@remix-run/node";
import { MainLayout } from "~/components/layout/MainLayout";
import { ScoreCard } from "~/components/scores/ScoreCard";
import { User } from "~/types/user";
import { Score } from "~/types/score";
import { getRecentScores } from "~/models/score.server";

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
  recentScores: Score[];
}

export async function loader() {
  // Get recent global scores with user info
  const recentScoresResults = (await getRecentScores()) as Score[];

  const recentScores = recentScoresResults.map((score) => ({
    ...score,
    formattedDate: new Date(score.date).toLocaleDateString(),
  }));

  return json<LoaderData>({ recentScores });
}

export default function Index() {
  const { recentScores } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<{ user: User | null }>();

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
