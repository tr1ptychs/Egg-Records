import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  getUser,
  getUserPrivacy,
  getUserAchievements,
} from "~/models/user.server";
import { getHighScores } from "~/models/score.server";
import { getUserAuth } from "~/utils/auth.server";
import { ProfilePage } from "~/components/profile/Profile";
import { User, UserAchievements } from "~/types/user";

const ALL_MAPS = [
  "Spawning Grounds",
  "Gone Fission Hydroplant",
  "Sockeye Station",
  "Marooner's Bay",
  "Jammin' Salmon Junction",
  "Salmonid Smokeyard",
  "Bonerattle Arena",
];

export const meta: MetaFunction<typeof loader> = (args) => {
  if (!args.data) return [];
  return [
    { title: `${args.data.user.username} - Egg Records` },
    {
      name: "description",
      content: `Check out ${args.data.user.username}'s Salmon Run high scores on Egg Records`,
    },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Get the profile we're viewing based on URL
  const username = params.username;
  if (!username) {
    throw new Response("User not found", { status: 404 });
  }
  const user = (await getUser(username)) as User | null;

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const currentUser = (await getUserAuth(request)) as User | null;

  const isPrivate = await getUserPrivacy(user.id);

  // Only allow viewing if profile is public OR it's the user's own profile
  const isOwnProfile = (currentUser && currentUser.id === user.id) as boolean;
  const canViewProfile = (!isPrivate || isOwnProfile) as boolean;

  let achievements: UserAchievements | null = null;

  const mapScores = await getHighScores(user.id);

  achievements = (await getUserAchievements(user.id)) as UserAchievements;

  return json({
    user,
    mapScores,
    achievements,
    isPrivate,
    isOwnProfile,
    canViewProfile,
    currentUser,
  });
}

export default function Profile() {
  const {
    user,
    mapScores,
    achievements,
    isPrivate,
    isOwnProfile,
    canViewProfile,
  } = useLoaderData<typeof loader>();

  return (
    <ProfilePage
      user={user}
      mapScores={mapScores}
      achievements={achievements}
      isPrivate={isPrivate}
      isOwnProfile={isOwnProfile}
      canViewProfile={canViewProfile}
      maps={ALL_MAPS}
    />
  );
}
