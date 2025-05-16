import { User } from "~/types/user";
import styles from "~/styles/components/profile/ProfileHeader.module.css";

interface ProfileHeaderProps {
  profile: User;
  isPrivate: boolean;
  isOwnProfile: boolean;
}

export function ProfileHeader({
  profile,
  isPrivate,
  isOwnProfile,
}: ProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.info}>
        {/* TODO: normal total */}
        <div className={styles.avatarGroup}>
          <img
            src={`https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.webp?size=240`}
            alt={profile.username}
            className={styles.avatar}
          />
          <h1 className={styles.name}>
            {profile.username}
            {isPrivate && isOwnProfile && (
              <span className={styles.privacyBadge}>Private</span>
            )}
          </h1>
          {/* TODO: nightless total */}
        </div>
      </div>
    </div>
  );
}
