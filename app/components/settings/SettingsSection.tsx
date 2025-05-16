import { User, UserAchievements } from "~/types/user";
import { useActionData, Form } from "@remix-run/react";
import { Dispatch, SetStateAction } from "react";
import { ActionData } from "~/types/hook";
import styles from "~/styles/components/settings/SettingsSection.module.css";

interface AchievementsProps {
  achievements: UserAchievements;
  isSubmitting: boolean;
}

export function Achievements({
  achievements,
  isSubmitting,
}: AchievementsProps) {
  const actionData = useActionData<ActionData>();

  return (
    <div className={styles.settingsSection}>
      <h2 className={styles.sectionTitle}>Achievements</h2>
      <p className={styles.sectionDescription}>
        Set your achievements here to display on your profile card.
      </p>

      <Form method="post" className={styles.achievementsForm}>
        <input type="hidden" name="action" value="updateAchievements" />
        <div className={styles.formGroup}>
          <label htmlFor="bigRun" className={styles.selectLabel}>
            <select
              name="bigRun"
              className={styles.selectInput}
              defaultValue={achievements.bigRun}
              required
            >
              <option value="no-display">Do not display</option>
              <option value="normal">Normal</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
            <span className={styles.selectText}>Big Run</span>
          </label>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="eggstraWork" className={styles.selectLabel}>
            <select
              name="eggstraWork"
              className={styles.selectInput}
              defaultValue={achievements.eggstraWork}
              required
            >
              <option value="no-display">Do not display</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
            <span className={styles.selectText}>Eggstra Work</span>
          </label>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="grizzBadge" className={styles.selectLabel}>
            <select
              name="grizzBadge"
              className={styles.selectInput}
              defaultValue={achievements.grizzBadge}
              required
            >
              <option value="no-display">Do not display</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
            <span className={styles.selectText}>Grizzco Badge</span>
          </label>
        </div>

        <button
          type="submit"
          className={styles.saveButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Achievements"}
        </button>
        {actionData?.action === "updateAchievements" && actionData?.success && (
          <div className={styles.successMessage}>{actionData.message}</div>
        )}
        {actionData?.action === "updateAchievements" &&
          !actionData?.success && (
            <div className={styles.errorMessage}>{actionData.message}</div>
          )}
      </Form>
    </div>
  );
}

interface PrivacyProps {
  isPrivate: boolean;
  isSubmitting: boolean;
}

export function Privacy({ isPrivate, isSubmitting }: PrivacyProps) {
  const actionData = useActionData<ActionData>();

  return (
    <div className={styles.settingsSection}>
      <h2 className={styles.sectionTitle}>Privacy</h2>
      <p className={styles.sectionDescription}>
        Setting your profile to private means your scores won&apos;t appear in
        the homepage feed, and your scores will only be visible to you. Other
        users will still be able to view your discord profile picture and
        username on your user page.
      </p>

      <Form method="post" className={styles.privacyForm}>
        <input type="hidden" name="action" value="updatePrivacy" />
        <div className={styles.formGroup}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              name="isPrivate"
              defaultChecked={isPrivate}
              value="true"
              className={styles.toggleInput}
            />
            <span className={styles.toggleText}>Make my profile private</span>
          </label>
        </div>

        <button
          type="submit"
          className={styles.saveButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Privacy Settings"}
        </button>
      </Form>

      {actionData?.action === "updatePrivacy" && actionData?.success && (
        <div className={styles.successMessage}>{actionData.message}</div>
      )}
    </div>
  );
}

interface DangerProps {
  user: User;
  isSubmitting: boolean;
  confirmation: string;
  setConfirmation: Dispatch<SetStateAction<string>>;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: Dispatch<SetStateAction<boolean>>;
}

export function Danger({
  user,
  isSubmitting,
  confirmation,
  setConfirmation,
  showDeleteConfirm,
  setShowDeleteConfirm,
}: DangerProps) {
  const actionData = useActionData<ActionData>();
  return (
    <div className={`${styles.settingsSection} ${styles.dangerZone}`}>
      <h2 className={styles.sectionTitle}>Danger Zone</h2>

      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className={styles.deleteButton}
        >
          Delete Account
        </button>
      ) : (
        <div className={styles.deleteConfirm}>
          <p className={styles.warningText}>
            This action is permanent. All your scores and profile data will be
            deleted. To confirm, please type your username{" "}
            <strong>{user.username}</strong> below.
          </p>

          <Form method="post" className={styles.deleteForm}>
            <input type="hidden" name="action" value="deleteAccount" />

            <div className={styles.formGroup}>
              <label htmlFor="confirmation">Username Confirmation:</label>
              <input
                id="confirmation"
                name="confirmation"
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Type your username to confirm"
                className={styles.confirmInput}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmation("");
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={confirmation !== user.username || isSubmitting}
                className={styles.confirmDeleteButton}
              >
                {isSubmitting ? "Deleting..." : "Permanently Delete Account"}
              </button>
            </div>
          </Form>

          {actionData?.action === "deleteAccount" && !actionData?.success && (
            <div className={styles.errorMessage}>{actionData.message}</div>
          )}
        </div>
      )}
    </div>
  );
}
