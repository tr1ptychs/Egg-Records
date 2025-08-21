import { MapScore, User } from "~/types/user";
import styles from "~/styles/components/profile/ProfileHeader.module.css";
import { ScoreDisplay } from "./MapItem";

interface ProfileHeaderProps {
  profile: User;
  scores: Record<string, MapScore>;
  isPrivate: boolean;
  isOwnProfile: boolean;
}

export function ProfileHeader({
  profile,
  scores,
  isPrivate,
  isOwnProfile,
}: ProfileHeaderProps) {
  let regularTotal = 0;
  let nightlessTotal = 0;

  for (const score of Object.values(scores)) {
    regularTotal += score.regular ?? 0;
    nightlessTotal += score.nightless ?? 0;
  }
  return (
    <div className={styles.header}>
      <div className={styles.info}>
        <div className={styles.avatarGroup}>
          <img
            src={`https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.webp?size=240`}
            alt={profile.username}
            className={styles.avatar}
          />
          <h1 className={styles.name}>{profile.username}</h1>
          {isPrivate && isOwnProfile && (
            <div className={styles.privacyBadge}>Private</div>
          )}
        </div>
        <div className={styles.totalsGroup}>
          <ScoreDisplay
            score={isOwnProfile || !isPrivate ? String(regularTotal) : "???"}
            nightless={false}
          />
          <ScoreDisplay
            score={isOwnProfile || !isPrivate ? String(nightlessTotal) : "???"}
            nightless={true}
          />
        </div>
      </div>
    </div>
  );
}
