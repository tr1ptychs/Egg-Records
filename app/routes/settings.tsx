import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useOutletContext,
} from "@remix-run/react";
import { useState } from "react";
import { getUserAuth, logout } from "~/utils/auth.server";
import {
  getUserPrivacy,
  setUserPrivacy,
  getUserAchievements,
  updateUserAchievements,
  deleteUser,
} from "~/models/user.server";
import { SettingsPage } from "~/components/settings/SettingsPage";
import { User, UserAchievements } from "~/types/user";
import { ActionData } from "~/types/hook";

export const meta = () => {
  return [{ title: "Account Settings" }];
};

interface LoaderData {
  isPrivate: boolean;
  achievements: UserAchievements;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUserAuth(request)) as User | null;
  if (!user) return redirect("/");

  // Get current privacy settings
  const isPrivate = await getUserPrivacy(user.id);

  // Get user achievements (if exists and insert defaults)
  const achievements = await getUserAchievements(user.id);

  return json<LoaderData>({
    isPrivate: isPrivate,
    achievements,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = (await getUserAuth(request)) as User | null;
  if (!user) return redirect("/");

  const form = await request.formData();
  const action = form.get("action");

  if (action === "updatePrivacy") {
    const isPrivate = form.get("isPrivate") === "true";
    const currentPrivate = await getUserPrivacy(user.id);

    if (isPrivate !== currentPrivate) {
      await setUserPrivacy(user.id, isPrivate);
    }

    return Response.json({
      action: "updatePrivacy",
      success: true,
      message: "Privacy settings updated successfully",
    });
  }

  if (action === "deleteAccount") {
    const confirmation = form.get("confirmation");

    if (confirmation !== user.username) {
      return Response.json(
        {
          action: "deleteAccount",
          success: false,
          message: "Username confirmation did not match",
        },
        { status: 400 }
      );
    }

    // Delete user data in this order to respect foreign key constraints
    await deleteUser(user.id);

    // Log the user out
    return logout(request);
  }

  if (action === "updateAchievements") {
    const bigRun = form.get("bigRun") as string;
    const eggstraWork = form.get("eggstraWork") as string;
    const grizzBadge = form.get("grizzBadge") as string;

    if (!bigRun || !eggstraWork || !grizzBadge) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingAchievementsResult = await getUserAchievements(user.id);
    if (!existingAchievementsResult) {
      return Response.json({ error: "Database Error" }, { status: 500 });
    }
    const existingAchievements = existingAchievementsResult as UserAchievements;
    if (
      existingAchievements.grizzBadge == grizzBadge &&
      existingAchievements.eggstraWork == eggstraWork &&
      existingAchievements.bigRun == bigRun
    ) {
      return json<ActionData>({
        action: "updateAchievements",
        success: true,
        message: "Achievements are unchanged",
      });
    }

    try {
      await updateUserAchievements(user.id, bigRun, eggstraWork, grizzBadge);
    } catch (error) {
      return json<ActionData>({
        action: "updateAchievements",
        success: false,
        message: "failed to update achievements",
      });
    }

    return Response.json({
      action: "updateAchievements",
      success: true,
      message: "Achievements updated successfully",
    });
  }

  return Response.json(
    { success: false, message: "Invalid action" },
    { status: 400 }
  );
}

export default function Settings() {
  const { isPrivate, achievements } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const { user } = useOutletContext<{ user: User }>();
  const isSubmitting = navigation.state === "submitting";
  const [confirmation, setConfirmation] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <SettingsPage
      user={user}
      isPrivate={isPrivate}
      achievements={achievements}
      isSubmitting={isSubmitting}
      confirmation={confirmation}
      setConfirmation={setConfirmation}
      showDeleteConfirm={showDeleteConfirm}
      setShowDeleteConfirm={setShowDeleteConfirm}
    />
  );
}
