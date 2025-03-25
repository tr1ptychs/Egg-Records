import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser, getUserPrivacy, getUserAchievements } from "~/models/user.server";
import { getScores } from "~/models/score.server";
import { getUserAuth } from "~/utils/auth.server";
import { ProfilePage } from "~/components/profile/Profile";
import { ScoreRecord, MapScore, UserAchievements } from "~/types/user";

const ALL_MAPS = [
  "Spawning Grounds",
  "Gone Fission Hydroplant",
  "Sockeye Station",
  "Marooner's Bay",
  "Jammin' Salmon Junction",
  "Salmonid Smokeyard",
  "Bonerattle Arena"
];

export const meta: MetaFunction<typeof loader> = (args) => {
  if (!args.data) return [];
  return [
    { title: `${args.data.profile.username} - Egg Records` },
    { 
      name: "description",
      content: `Check out ${args.data.profile.username}'s Salmon Run high scores on Egg Records` 
    }
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Get the profile we're viewing based on URL
  const username = params.username;
  const profile = await getUser(username);
  
  if (!profile) {
    throw new Response("User not found", { status: 404 });
  }
  
  // Get the current logged-in user
  const currentUser = await getUserAuth(request);
  
  // Check privacy settings
  const userSettings = await getUserPrivacy(profile.id);
  
  const isPrivate = userSettings && userSettings.private ? true : false;
  
  // Only allow viewing if profile is public OR it's the user's own profile
  const isOwnProfile = currentUser && currentUser.id === profile.id;
  const canViewProfile = !isPrivate || isOwnProfile;

  let mapScores: Record<string, MapScore> = {};
  let achievements: UserAchievements | null = null;
  
  if (canViewProfile) {
    const scores = await getScores(profile.id);
    
    // Initialize maps with empty scores for both types
    mapScores = ALL_MAPS.reduce((acc, map) => {
      acc[map] = {
        regular: { score: null },
        nightless: { score: null },
        bestOverall: {
          score: null,
          isNightless: false
        }
      };
      return acc;
    }, {} as Record<string, MapScore>);

    achievements = await getUserAchievements(profile.id);

    if (!achievements) {
      achievements = {
        id: 0,
        userId: profile.id,
        bigRun: "no-display",
        eggstraWork: "no-display",
        grizzBadge: "no-display"
      };
    }

    // Find best scores for each category
    scores.forEach(score => {
      const mapScore = mapScores[score.map];
      
      // Update nightless or regular best
      if (score.nightless) {
        if (!mapScore.nightless.score || score.score > mapScore.nightless.score) {
          mapScore.nightless.score = score.score;
        }
      } else {
        if (!mapScore.regular.score || score.score > mapScore.regular.score) {
          mapScore.regular.score = score.score;
        }
      }
      
      // Update overall best if this is higher
      if (!mapScore.bestOverall.score || score.score > mapScore.bestOverall.score) {
        mapScore.bestOverall.score = score.score;
        mapScore.bestOverall.isNightless = score.nightless;
      }
    });
  }
  
  return json({ 
    profile, 
    mapScores, 
    achievements,
    isPrivate,
    isOwnProfile,
    canViewProfile,
    currentUser
  });
}

export default function Profile() {
  const { 
    profile, 
    mapScores, 
    achievements, 
    isPrivate, 
    isOwnProfile, 
    canViewProfile
  } = useLoaderData<typeof loader>();
  
  return (
    <ProfilePage
      profile={profile}
      mapScores={mapScores}
      achievements={achievements}
      isPrivate={isPrivate}
      isOwnProfile={isOwnProfile}
      canViewProfile={canViewProfile}
      maps={ALL_MAPS}
    />
  );
}
