import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { getUserAuth } from "~/utils/auth.server";
import { createScore, getScores } from "~/models/score.server";
import { MainLayout } from "~/components/layout/MainLayout";
import { ScoreForm } from "~/components/scores/ScoreForm";
import { User } from "~/types/user";
import { Score } from "~/types/score";

export const meta = () => {
  return [{ title: "Submit New Score" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUserAuth(request)) as User | null;
  if (!user) return redirect("/");

  // Get a few recent scores for the sidebar
  const scores = (await getScores(user.id)) as Score[];
  const recentScores = scores.map((score) => ({
    ...score,
    formattedDate: new Date(score.date).toLocaleDateString(),
  }));
  return json({ recentScores: recentScores.slice(0, 5) });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = (await getUserAuth(request)) as User | null;
  if (!user) return redirect("/");

  const form = await request.formData();
  const map = form.get("map") as string;
  const score = Number(form.get("score"));
  const date = form.get("date") as string;
  const note = form.get("note") as string;
  const nightless = form.has("nightless");
  const hazard = Number(form.get("hazard"));
  const rankTitle = form.get("rankTitle") as string;
  const rankNum = Number(form.get("rankNum"));

  if (!map || !score || !date || !hazard || !rankTitle || !rankNum) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  await createScore({
    userId: user.id,
    map,
    score,
    date,
    note,
    nightless,
    hazard,
    rankTitle,
    rankNum,
  });

  return redirect("/my-scores");
}

export default function AddScore() {
  const { recentScores } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<{ user: User }>();

  return (
    <MainLayout
      user={user}
      sidebarType="recentScores"
      recentScores={recentScores}
    >
      <h1 className="page-title">Add New Score</h1>

      <ScoreForm mode="create" />
    </MainLayout>
  );
}
