import { ProfileHeader } from "./ProfileHeader";
import { MapGrid } from "./MapGrid";
import { PrivateProfile } from "./PrivateProfile";
import { User, UserAchievements, MapScore } from "~/types/user";
import styles from "~/styles/components/profile/Profile.module.css";

interface ProfilePageProps {
  user: User;
  mapScores: Record<string, MapScore>;
  achievements: UserAchievements;
  isPrivate: boolean;
  isOwnProfile: boolean;
  canViewProfile: boolean;
  maps: string[];
}

export function ProfilePage({
  user,
  mapScores,
  achievements,
  isPrivate,
  isOwnProfile,
  canViewProfile,
  maps,
}: ProfilePageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <ProfileHeader
          profile={user}
          isPrivate={isPrivate}
          isOwnProfile={isOwnProfile}
        />

        {!canViewProfile ? (
          <PrivateProfile />
        ) : (
          <MapGrid
            mapScores={mapScores}
            achievements={achievements}
            maps={maps}
          />
        )}
      </div>
    </div>
  );
}
