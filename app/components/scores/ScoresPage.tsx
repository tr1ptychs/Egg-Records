import { ScoreList } from "./ScoreList";
import { Notification } from "~/components/ui/Notification";
import { Button } from "~/components/ui/Button";
import { Score } from "~/types/score";
import styles from "~/styles/components/scores/ScoresPage.module.css";

interface ScoresPageProps {
  scores: Score[];
  isSubmitting: boolean;
  notification: { type: "success" | "error"; message: string } | null;
}

export function ScoresPage({ scores, isSubmitting, notification }: ScoresPageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Scores</h1>
          <Button href="/submit" variant="primary">Add a New Score</Button>
        </div>
        
        {notification && (
          <Notification type={notification.type} message={notification.message} />
        )}
        
        {scores.length > 0 ? (
          <ScoreList scores={scores} isSubmitting={isSubmitting} />
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>You haven&apos;t added any scores yet!</p>
            <Button href="/submit" variant="primary">Add Your First Score</Button>
          </div>
        )}
      </div>
    </div>
  );
}
