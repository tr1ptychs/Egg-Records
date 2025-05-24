import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { User } from "~/types/user";
import { SidebarType } from "~/types/layout";
import { Score } from "~/types/score";
import styles from "~/styles/components/layout/Sidebar.module.css";

export function UserSidebar({ user }: { user: User }) {
  return (
    <div className={styles.profileCard}>
      <Link to={`/u/${user.username}`} className={styles.profileHeader}>
        {user.avatar ? (
          <img
            src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.webp?size=240`}
            alt={user.username}
            className={styles.profileAvatar}
          />
        ) : (
          <div className={styles.profileAvatarPlaceholder}>
            {user.username[0].toUpperCase()}
          </div>
        )}
        <h2 className={styles.profileName}>{user.username}</h2>
      </Link>

      <div className={styles.profileActions}>
        <Button href="/submit" variant="primary">
          Add Score
        </Button>
        <Button href={`/u/${user.username}`} variant="secondary">
          View Profile
        </Button>
      </div>
    </div>
  );
}

export function LoginSidebar() {
  return (
    <div className={styles.loginCard}>
      <h2 className={styles.loginTitle}>Track Your Scores</h2>
      <p className={styles.loginDescription}>
        Join with Discord to track your highest scores!
      </p>
      <Button href="/auth/discord" variant="discord">
        Sign in with Discord
      </Button>
    </div>
  );
}

export function RecentScoresSidebar({
  recentScores,
}: {
  recentScores: Score[];
}) {
  return (
    <Card className={styles.recentScoresCard}>
      <Link to={"/my-scores"} className={styles.recentScoresHeader}>
        <h2>Your Recent Scores</h2>
      </Link>

      {recentScores && recentScores.length > 0 ? (
        <div className={styles.recentScoresList}>
          {recentScores.map((score) => (
            <div key={score.id} className={styles.miniScoreCard}>
              <div className={styles.miniScoreHeader}>
                <span className={styles.mapName}>{score.map}</span>
                <time className={styles.scoreDate}>{score.formattedDate}</time>
              </div>
              <div className={styles.miniScoreDetails}>
                <span className={styles.eggCount}>{score.score} eggs</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>No scores yet!</p>
      )}
    </Card>
  );
}

export interface SidebarProps {
  user: User | null;
  sidebarType: SidebarType;
  recentScores: Score[];
}

export function Sidebar({ user, sidebarType, recentScores }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {sidebarType === "profile" ? (
        user ? (
          <UserSidebar user={user} />
        ) : (
          <LoginSidebar />
        )
      ) : (
        <RecentScoresSidebar recentScores={recentScores} />
      )}
    </aside>
  );
}
