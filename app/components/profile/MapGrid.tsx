import { MapItem } from "./MapItem";
import { AchievementBadges } from "./AchievementBadges";
import { MapScore, UserAchievements } from "~/types/user";
import styles from "~/styles/components/profile/MapGrid.module.css";

interface MapGridProps {
  mapScores: Record<string, MapScore>;
  achievements: UserAchievements;
  maps: string[];
}

export function MapGrid({ mapScores, achievements, maps }: MapGridProps) {
  return (
    <div className={styles.mapScores}>
      <div className={styles.grid}>
        {maps.map((map) => (
          <MapItem key={map} map={map} mapScore={mapScores[map]} />
        ))}

        <AchievementBadges scores={mapScores} achievements={achievements} />
      </div>
    </div>
  );
}
