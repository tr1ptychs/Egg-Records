import { ScoreItem } from "./ScoreItem";
import { Button } from "~/components/ui/Button";
import { Score } from "~/types/score";
import styles from "~/styles/components/scores/ScoreList.module.css";

interface ScoreListProps {
  scores: Score[];
  isSubmitting: boolean;
}

export function ScoreList({ scores, isSubmitting }: ScoreListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={`${styles.headerCell} ${styles.cellMap}`}>Map</div>
        <div className={`${styles.headerCell} ${styles.cellScore}`}>Score</div>
        <div className={`${styles.headerCell} ${styles.cellDate}`}>Date</div>
        <div className={`${styles.headerCell} ${styles.cellType}`}>Type</div>
        <div className={`${styles.headerCell} ${styles.cellHazard}`}>
          Hazard
        </div>
        <div className={`${styles.headerCell} ${styles.cellRank}`}>Rank</div>
        <div className={`${styles.headerCell} ${styles.cellNote}`}>Note</div>
        <div className={`${styles.headerCell} ${styles.cellActions}`}>
          Actions
        </div>
      </div>

      {scores.length > 0 ? (
        <div className={styles.list}>
          {scores.map((score) => (
            <ScoreItem 
              key={score.id} 
              score={score} 
              isSubmitting={isSubmitting} 
              cellStyles={{
                map: styles.cellMap,
                score: styles.cellScore,
                date: styles.cellDate,
                type: styles.cellType,
                hazard: styles.cellHazard,
                rank: styles.cellRank,
                note: styles.cellNote,
                actions: styles.cellActions,
              }}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyScores}>
          <p>You haven&apos;t added any scores yet!</p>
          <Button href="/submit" variant="primary">
            Add Your First Score
          </Button>
        </div>
      )}
    </div>
  );
}
