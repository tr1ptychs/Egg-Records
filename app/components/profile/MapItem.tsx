import { MapScore } from "~/types/user";
import styles from "~/styles/components/profile/MapItem.module.css";

interface MapItemProps {
  map: string;
  mapScore: MapScore;
}

interface ScoreDisplayProps {
  score: string;
  nightless: boolean;
}

export function ScoreDisplay({ score, nightless }: ScoreDisplayProps) {
  return (
    <div className={styles.scoreDisplay}>
      <span className={styles.scoreEmoji}>{nightless ? "☀️" : "🌙"}</span>
      <span className={styles.scoreValue}>
        {typeof score === "object" ? JSON.stringify(score) : score}
      </span>
    </div>
  );
}

export function MapItem({ map, mapScore }: MapItemProps) {
  const formatScore = (score: number | null) => {
    return score ? score.toLocaleString() : "---";
  };

  return (
    <div className={styles.item}>
      <img
        src={`/map/${map
          .toLowerCase()
          .replace(/'/g, "")
          .replace(/\s/g, "-")}.png`}
        alt={map}
        className={styles.icon}
      />

      <div className={styles.details}>
        <div className={styles.name}>{map}</div>
        <div className={styles.scores}>
          <ScoreDisplay
            score={formatScore(mapScore.regular.score)}
            nightless={false}
          />
          <ScoreDisplay
            score={formatScore(mapScore.nightless.score)}
            nightless={true}
          />
        </div>
      </div>
    </div>
  );
}
