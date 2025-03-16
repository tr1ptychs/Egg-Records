import { Link } from "@remix-run/react";
import styles from "~/styles/components/layout/Sidebar.module.css";
import { SidebarProps } from "~/types/layout";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { ScoreList } from "~/types/score";

export function UserSidebar({ user, userStats }: SidebarProps) {
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
      {/* // TODO: display useful stats here. (best map with score?)
      {userStats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{userStats.totalGames}</span>
            <span className={styles.statLabel}>Shifts</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{userStats.highestScore}</span>
            <span className={styles.statLabel}>Best Score</span>
          </div>
        </div>
      )}
      */}

      <div className={styles.profileActions}>
        <Button href="/submit" variant="primary">Add Score</Button>
        <Button href={`/u/${user.username}`} variant="secondary">View Profile</Button>
      </div>
    </div>
  );
}

export function LoginSidebar() {
  return (
    <div className={styles.loginCard}>
      <h2 className={styles.loginTitle}>Track Your Scores</h2>
      <p className={styles.loginDescription}>Join with Discord to track your highest scores!</p>
      <Button href="/auth/discord" variant="discord">
        Sign in with Discord
      </Button>
    </div>
  );
}

export function RecentScoresSidebar({ recentScores }: ScoreList)  {
  return (
    <Card className={styles.recentScoresCard}>
      <h2>Your Recent Scores</h2>
      
      {recentScores.length > 0 ? (
        <div className={styles.recentScoresList}>
          {recentScores.map((score) => (
            <div key={score.id} className={styles.miniScoreCard}>
              <div className={styles.miniScoreHeader}>
                <span className={styles.mapName}>{score.map}</span>
                <time className={styles.scoreDate}>
                  {new Date(score.date).toLocaleDateString()}
                </time>
              </div>
              <div className={styles.miniScoreDetails}>
                <span className={styles.eggCount}>{score.score} eggs</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No scores yet!</p>
      )}
    </Card>
  )
}

export function Sidebar({ user, userStats, sidebarType, recentScores }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {sidebarType === "profile" ? (
        user ? (
          <UserSidebar user={user} userStats={userStats} />
        ) : (
          <LoginSidebar />
        )
      ) : (
        <RecentScoresSidebar recentScores={recentScores} />
      )}
    </aside>
  );
}
