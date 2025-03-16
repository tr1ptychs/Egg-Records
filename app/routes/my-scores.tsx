import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getUserAuth } from "~/utils/auth.server";
import { db } from "~/utils/db.server";
import { getScores } from "~/models/score.server";
import { ScoresPage } from "~/components/scores/ScoresPage";
import type { Score } from "~/types/score";

export const meta = () => {
  return [{ title: "My Scores" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserAuth(request);
  if (!user) return redirect("/");
  
  // Get all scores for the user
  const scores = await getScores(user.id);
  
  return json({ user, scores });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUserAuth(request);
  if (!user) return redirect("/auth/discord");
  
  const form = await request.formData();
  const action = form.get("action");
  
  if (action === "deleteScore") {
    const scoreId = form.get("scoreId");
    
    if (!scoreId) {
      return json({ success: false, message: "Score ID is required" }, { status: 400 });
    }
    
    // Verify the score belongs to the user before deleting
    const score = db.prepare(`
      SELECT * FROM scores WHERE id = ? AND userId = ?
    `).get(scoreId, user.id);
    
    if (!score) {
      return json({ 
        success: false, 
        message: "Score not found or you don't have permission to delete it" 
      }, { status: 404 });
    }
    
    // Delete the score
    db.prepare(`
      DELETE FROM scores WHERE id = ?
    `).run(scoreId);
    
    return json({ success: true, message: "Score deleted successfully" });
  }
  
  if (action === "updateScore") {
    const scoreId = form.get("scoreId");
    const map = form.get("map") as string;
    const score = Number(form.get("score"));
    const date = form.get("date") as string;
    const note = form.get("note") as string || "";
    // Check if the nightless checkbox was checked
    const nightless = form.has("nightless") ? 1 : 0;
    const hazard = Number(form.get("hazard"));
    const rankTitle = form.get("rankTitle") as string;
    const rankNum = Number(form.get("rankNum"));
    
    if (!scoreId || !map || !score || !date || !hazard || !rankTitle) {
      return json({ success: false, message: "Missing required fields" }, { status: 400 });
    }
    
    // Verify the score belongs to the user before updating
    const existingScore = db.prepare(`
      SELECT * FROM scores WHERE id = ? AND userId = ?
    `).get(scoreId, user.id);
    
    if (!existingScore) {
      return json({ 
        success: false, 
        message: "Score not found or you don't have permission to update it" 
      }, { status: 404 });
    }
    
    // Update the score
    db.prepare(`
      UPDATE scores
      SET map = ?, score = ?, nightless = ?, hazard = ?, rankTitle = ?, rankNum = ?, date = ?, note = ?
      WHERE id = ?
    `).run(map, score, nightless, hazard, rankTitle, rankNum, date, note, scoreId);
    
    return json({ success: true, message: "Score updated successfully" });
  }
  
  return json({ success: false, message: "Invalid action" }, { status: 400 });
}

export default function MyScores() {
  const { user, scores } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Show notification when action is completed
  useEffect(() => {
    if (actionData?.success) {
      setNotification({ type: 'success', message: actionData.message });
      // Hide notification after 3 seconds
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    } else if (actionData && !actionData.success) {
      setNotification({ type: 'error', message: actionData.message });
      // Hide notification after 3 seconds
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
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
