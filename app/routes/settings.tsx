import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { getUserAuth, logout } from "~/utils/auth.server";
import { getUserAchievements } from "~/models/user.server";
import { SettingsPage } from "~/components/settings/SettingsPage";
import { db } from "~/utils/db.server";
import { User, UserAchievements, UserSettings } from "~/types/user";
import { ActionData } from "~/types/hook";

export const meta = () => {
  return [{ title: "Account Settings" }];
};

interface LoaderData {
  user: User;
  isPrivate: boolean;
  achievements: UserAchievements;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUserAuth(request)) as User | null;
  if (!user) return redirect("/");

  // Get current privacy settings
  const userSettings = (db
    .prepare(
      `
    SELECT private FROM user_settings WHERE userId = ?
  `
    )
    .get(user.id) || { private: 0 }) as UserSettings;

  // Get user achievements (if exists and insert defaults)
  const achievements = (db
    .prepare(
      `
    SELECT grizzBadge, bigRun, eggstraWork FROM user_achievements WHERE userId = ?
  `
    )
    .get(user.id) || {
    grizzBadge: "no-display",
    bigRun: "no-display",
    eggstraWork: "no-display",
  }) as UserAchievements;

  return json<LoaderData>({
    user,
    isPrivate: Boolean(userSettings.private),
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
    const privateValue = isPrivate ? 1 : 0;

    // Default is public
    if (isPrivate) {
      // Only create/update if user wants privacy (non-default)
      const existingSettings = db
        .prepare(
          `
          SELECT * FROM user_settings WHERE userId = ?
        `
        )
        .get(user.id);

      if (existingSettings) {
        db.prepare(`UPDATE user_settings SET private = ? WHERE userId = ?`).run(
          privateValue,
          user.id
        );
      } else {
        db.prepare(
          `INSERT INTO user_settings (userId, private) VALUES (?, ?)`
        ).run(user.id, privateValue);
      }
    } else {
      // If returning to default (public), remove the entry if it exists
      db.prepare(`DELETE FROM user_settings WHERE userId = ?`).run(user.id);
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
    db.prepare(`DELETE FROM scores WHERE userId = ?`).run(user.id);
    db.prepare(`DELETE FROM user_settings WHERE userId = ?`).run(user.id);
    db.prepare(`DELETE FROM users WHERE id = ?`).run(user.id);
    db.prepare(`DELETE FROM user_achievements WHERE userId = ?`).run(user.id);

    // Log the user out
    return logout(request);
  }

  if (action === "updateAchievements") {
    const bigRun = form.get("bigRun") || "no-display";
    const eggstraWork = form.get("eggstraWork") || "no-display";
    const grizzBadge = form.get("grizzBadge") || "no-display";

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
    if (existingAchievements) {
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
      } else if (
        grizzBadge == "no-display" &&
        eggstraWork == "no-display" &&
        bigRun == "no-display"
      ) {
        db.prepare(`DELETE FROM user_achievements WHERE userId = ?`).run(
          user.id
        );
      } else {
        db.prepare(
          `
          UPDATE user_achievements SET
          grizzBadge = ?, bigRun = ?, eggstraWork = ?
          WHERE userId = ?
        `
        ).run(grizzBadge, bigRun, eggstraWork, user.id);
      }
    } else {
      db.prepare(
        `
        INSERT INTO user_achievements
        (userId, grizzBadge, bigRun, eggstraWork) VALUES (?, ?, ?, ?)
      `
      ).run(user.id, grizzBadge, bigRun, eggstraWork);
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
  const { user, isPrivate, achievements } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
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
