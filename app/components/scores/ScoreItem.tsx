import { useState } from "react";
import { Form, useActionData } from "@remix-run/react";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { ScoreForm } from "./ScoreForm";
import { Score } from "~/types/score";
import { ActionData } from "~/types/hook";
import styles from "~/styles/components/scores/ScoreItem.module.css";

interface CellStyles {
  map: string;
  score: string;
  date: string;
  type: string;
  hazard: string;
  rank: string;
  note: string;
  actions: string;
}

interface ScoreItemProps {
  score: Score;
  isSubmitting: boolean;
  cellStyles: CellStyles;
}

export function ScoreItem({ score, isSubmitting, cellStyles }: ScoreItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const actionData = useActionData() as ActionData;

  if (isEditing) {
    return (
      <div className={`${styles.item} ${styles.editingRow}`}>
        <div className={styles.container}>
          <ScoreForm
            mode="edit"
            score={score}
            isSubmitting={isSubmitting}
            onCancel={() => setIsEditing(false)}
            actionData={actionData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.item}>
      <div className={`${styles.cell} ${cellStyles.map}`} data-label="Map">
        {score.map}
      </div>
      <div
        className={`${styles.cell} ${cellStyles.score} ${styles.scoreValue}`}
        data-label="Score"
      >
        {score.score}
      </div>
      <div className={`${styles.cell} ${cellStyles.date}`} data-label="Date">
        {new Date(score.date).toLocaleDateString()}
      </div>
      <div className={`${styles.cell} ${cellStyles.type}`} data-label="Type">
        {score.nightless ? "☀️" : "🌙"}
      </div>
      <div
        className={`${styles.cell} ${cellStyles.hazard}`}
        data-label="Hazard"
      >
        {score.hazard}%
      </div>
      <div className={`${styles.cell} ${cellStyles.rank}`} data-label="Rank">
        {score.rankTitle.replace("Profressional", "Prof")} {score.rankNum}
      </div>
      <div
        className={`${styles.cell} ${cellStyles.note} ${styles.noteCell}`}
        data-label="Note"
      >
        {score.note || <span className={styles.noNote}>No notes</span>}
      </div>
      <div
        className={`${styles.cell} ${cellStyles.actions} ${styles.actionsCell}`}
      >
        {showDeleteConfirm ? (
          <>
            <Form method="post" className={styles.deleteForm}>
              <input type="hidden" name="action" value="deleteScore" />
              <input type="hidden" name="scoreId" value={score.id} />
              <button
                type="submit"
                className={`${styles.actionBtn} ${styles.confirmBtn}`}
                disabled={isSubmitting}
              >
                <Check size={16} />
              </button>
            </Form>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className={`${styles.actionBtn} ${styles.cancelBtn}`}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className={`${styles.actionBtn} ${styles.editBtn}`}
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
