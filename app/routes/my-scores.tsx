import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getUserAuth } from "~/utils/auth.server";
import { deleteScore, getScores, updateScore } from "~/models/score.server";
import { ScoresPage } from "~/components/scores/ScoresPage";
import type { Score } from "~/types/score";
import { User } from "~/types/user";

export const meta = () => {
  return [{ title: "My Scores" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUserAuth(request)) as User | null;
  if (!user) return redirect("/");

  // Get all scores for the user
  const userScores = (await getScores(user.id)) as Score[];
  // Format date for readability
  const scores = userScores.map((score) => ({
    ...score,
    formattedDate: new Date(score.date).toLocaleDateString(),
  }));

  return json({ scores });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = (await getUserAuth(request)) as User | null;
  if (!user) return redirect("/auth/discord");

  const form = await request.formData();
  const action = form.get("action");

  if (action === "deleteScore") {
    const scoreId = Number(form.get("scoreId"));

    if (!scoreId) {
      return json(
        { success: false, message: "Score ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteScore(user.id, scoreId);
    if (!result) {
      return json(
        {
          success: false,
          message: "Score not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    return json({ success: true, message: "Score deleted successfully" });
  }

  if (action === "updateScore") {
    const scoreId = Number(form.get("scoreId"));
    const map = form.get("map") as string;
    const score = Number(form.get("score"));
    const date = form.get("date") as string;
    const note = (form.get("note") as string) || "";
    // Check if the nightless checkbox was checked
    const nightless = form.has("nightless") ? true : false;
    const hazard = Number(form.get("hazard"));
    const rankTitle = form.get("rankTitle") as string;
    const rankNum = Number(form.get("rankNum"));

    if (!scoreId || !map || !score || !date || !hazard || !rankTitle) {
      return json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the score
    const result = await updateScore({
      map,
      score,
      nightless,
      hazard,
      rankTitle,
      rankNum,
      date,
      note,
      userId: user.id,
      id: scoreId,
    });

    if (result) {
      return json({ success: true, message: "Score updated successfully" });
    } else {
      return json({ success: false, message: "Score failed to update" });
    }
  }

  return json({ success: false, message: "Invalid action" }, { status: 400 });
}

export default function MyScores() {
  const { scores } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Show notification when action is completed
  useEffect(() => {
    if (!actionData) return;

    const type = actionData.success ? "success" : "error";
    setNotification({ type: type, message: actionData.message });

    // display for three seconds
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [actionData]);

  const isSubmitting = navigation.state === "submitting";

  return (
    <ScoresPage
      scores={scores as Score[]}
      isSubmitting={isSubmitting}
      notification={notification}
    />
  );
}
