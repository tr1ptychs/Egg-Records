import { useState } from "react";
import { Link } from "@remix-run/react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Score } from "~/types/score";
import styles from "~/styles/components/scores/ScoreCard.module.css";

export function ScoreCard({ score }: { score: Score }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <Link to={`/u/${score.username}`} className={styles.userLink}>
          <div className={styles.userInfo}>
            {score.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${score.discordId}/${score.avatar}.webp?size=240`}
                alt={score.username}
                className={styles.avatar}
              />
            ) : (
              <div className="avatar-placeholder">
                {score.username[0].toUpperCase()}
              </div>
            )}
            <span className={styles.username}>{score.username}</span>
          </div>
        </Link>
        <time className={styles.date} dateTime={score.date}>
          {new Date(score.date).toLocaleDateString()}
        </time>
      </div>

      <div className={styles.details}>
        <div className={styles.stat}>
          <div className={styles.statValue}>
            <img
              src={`/map/${score.map
                .toLowerCase()
                .replace(/[']/g, "")
                .replace(/\s/g, "-")}.png`}
              alt={score.map}
              className={styles.mapIcon}
            />
          </div>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            <img src="/egg.svg" alt="eggs" className={styles.eggIcon} />
            {score.score.toLocaleString()}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.nightIndicator}`}>
            {score.nightless ? "☀️" : "🌙"}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        {score.note ? <p className={styles.note}>{score.note}</p> : <span />}

        <button
          className={styles.showMoreButton}
          onClick={() => setOpenModal(!openModal)}
        >
          {openModal ? (
            <>
              Hide details <ChevronUp size={16} />
            </>
          ) : (
            <>
              Show details <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {openModal && (
        <div className={styles.statsModal}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>Map</span>
              <span className={styles.statItemValue}>{score.map}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>Eggs</span>
              <span className={styles.statItemValue}>{score.score}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>Waves</span>
              <span className={styles.statItemValue}>
                {score.nightless ? "Day Only" : "Regular"}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>Hazard Level</span>
              <span className={styles.statItemValue}>
                {score.hazard ?? "Unknown"}%
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>Rank</span>
              <span className={styles.statItemValue}>
                {score.rankTitle} {score.rankNum}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>Date</span>
              <span className={styles.statItemValue}>
                {new Date(score.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
