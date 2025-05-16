import { Form, useSubmit } from "@remix-run/react";
import { Score } from "~/types/score";
import styles from "~/styles/components/scores/ScoreForm.module.css";
import { ActionData } from "~/types/hook";
import { useEffect, useRef } from "react";

const MAPS = [
  "Spawning Grounds",
  "Sockeye Station",
  "Gone Fission Hydroplant",
  "Marooner's Bay",
  "Jammin' Salmon Junction",
  "Salmonid Smokeyard",
  "Bonerattle Arena",
];

const RANKS = [
  "Eggsecutive VP",
  "Profressional3",
  "Profressional2",
  "Profressional1",
  "Profressional",
  "Overachiever",
  "Go-Getter",
  "Part-Timer",
];

interface ScoreFormProps {
  mode: "create" | "edit";
  score?: Partial<Score>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  actionData?: ActionData;
}

export function ScoreForm({
  mode = "create",
  score = {},
  isSubmitting = false,
  onCancel,
  actionData,
}: ScoreFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  // Helper to format date for the date input (YYYY-MM-DD)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Close the form if action was successful and we're in edit mode
  useEffect(() => {
    if (mode === "edit" && actionData?.success && onCancel) {
      onCancel();
    }
  }, [actionData, onCancel, mode]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (mode === "edit") {
      event.preventDefault();
      submit(event.currentTarget);
    }
  };

  const idPrefix = mode === "edit" && score.id ? `${score.id}-` : "";

  return (
    <Form
      method="post"
      className={styles.form}
      ref={formRef}
      onSubmit={mode === "edit" ? handleSubmit : undefined}
    >
      {mode === "edit" && (
        <>
          <input type="hidden" name="action" value="updateScore" />
          <input type="hidden" name="scoreId" value={score.id} />
        </>
      )}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor={`map-${idPrefix}`} className={styles.label}>
            Map
          </label>
          <select
            id={`map-${idPrefix}`}
            name="map"
            defaultValue={score.map}
            className={`${styles.input} ${styles.select}`}
            required
          >
            {MAPS.map((map) => (
              <option key={map} value={map}>
                {map}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor={`score-${idPrefix}`} className={styles.label}>
            Egg Count
          </label>
          <input
            id={`score-${idPrefix}`}
            type="number"
            name="score"
            defaultValue={score.score}
            className={styles.input}
            required
          />
        </div>

        <div className={`${styles.field} ${styles.checkboxGroup}`}>
          <input
            id={`nightless-${idPrefix}`}
            type="checkbox"
            name="nightless"
            defaultChecked={Boolean(score.nightless)}
            className={styles.checkbox}
          />
          <label htmlFor={`nightless-${idPrefix}`} className={styles.label}>
            Day only
          </label>
        </div>

        <div className={styles.field}>
          <label htmlFor={`rank-title-${idPrefix}`} className={styles.label}>
            Rank
          </label>
          <div className={styles.rankInputs}>
            <select
              id={`rank-title-${idPrefix}`}
              name="rankTitle"
              defaultValue={score.rankTitle}
              className={`${styles.input} ${styles.select}`}
              required
            >
              {RANKS.map((rank) => (
                <option key={rank} value={rank}>
                  {rank.replace("Profressional", "Professional ")}
                </option>
              ))}
            </select>
            <input
              id={`rank-num-${idPrefix}`}
              type="number"
              name="rankNum"
              defaultValue={score.rankNum}
              className={styles.input}
              min="0"
              max="999"
              placeholder="0-999"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor={`hazard-${idPrefix}`} className={styles.label}>
            Hazard Level %
          </label>
          <input
            id={`hazard-${idPrefix}`}
            type="number"
            name="hazard"
            defaultValue={score.hazard}
            className={styles.input}
            min="0"
            max="333"
            placeholder="333"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`date-${idPrefix}`} className={styles.label}>
            Date
          </label>
          <input
            id={`date-${idPrefix}`}
            type="date"
            name="date"
            defaultValue={formatDateForInput(score.date)}
            className={styles.input}
            required
          />
        </div>

        <div className={`${styles.field} ${styles.noteField}`}>
          <label htmlFor={`note-${idPrefix}`} className={styles.label}>
            Extra Details
          </label>
          <input
            id={`note-${idPrefix}`}
            type="text"
            name="note"
            maxLength={140}
            defaultValue={score.note || ""}
            className={styles.input}
            placeholder="Share details about the shift!"
          />
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={`${styles.btn} ${styles.saveBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? mode === "edit"
                ? "Saving..."
                : "Submitting..."
              : mode === "edit"
              ? "Save Changes"
              : "Submit Score"}
          </button>

          {mode === "edit" && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`${styles.btn} ${styles.cancelBtn}`}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </Form>
  );
}
