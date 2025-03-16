import { UserAchievements } from "~/types/user";
import styles from "~/styles/components/profile/MapItem.module.css";

interface AchievementBadgesProps {
  achievements: UserAchievements;
}

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  return (
    <div className={styles.item}>
      <img
        src="/badge.png"
        alt="Badge"
        className={styles.icon}
      />
      <div className={styles.details}>
        <div className={styles.name}>Achievements</div>
        <div className={styles.badges}>
          {achievements.grizzBadge !== "no-display" && (
            <img 
              src={`/badge/points/grizzco-${achievements.grizzBadge}.png`}
              alt={`Grizzco ${achievements.grizzBadge} badge`}
              className={styles.badgeIcon}
            />
          )}
          {achievements.eggstraWork !== "no-display" && (
            <img 
              src={`/badge/event/eggstra-work-${achievements.eggstraWork}.png`}
              alt={`Eggstra Work ${achievements.eggstraWork} badge`}
              className={styles.badgeIcon}
            />
          )}
          {achievements.bigRun !== "no-display" && (
            <img 
              src={`/badge/event/big-run-${achievements.bigRun}.png`}
              alt={`Big Run ${achievements.bigRun} badge`}
              className={styles.badgeIcon}
            />
          )}
        </div>
      </div>
    </div>
  );
}
