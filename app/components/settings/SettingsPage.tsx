import { User, UserAchievements } from "~/types/user";
import {
  Achievements,
  Privacy,
  Danger,
} from "~/components/settings/SettingsSection";
import { Dispatch, SetStateAction } from "react";
import styles from "~/styles/components/settings/Settings.module.css";

interface SettingsPageProps {
  user: User;
  isPrivate: boolean;
  achievements: UserAchievements;
  isSubmitting: boolean;
  confirmation: string;
  setConfirmation: Dispatch<SetStateAction<string>>;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: Dispatch<SetStateAction<boolean>>;
}

export function SettingsPage({
  user,
  isPrivate,
  achievements,
  isSubmitting,
  confirmation,
  setConfirmation,
  showDeleteConfirm,
  setShowDeleteConfirm,
}: SettingsPageProps) {
  return (
    <main className={styles.settingsContainer}>
      <div className={styles.settingsCard}>
        <div className={styles.settingsHeader}>
          <h1 className={styles.settingsTitle}>Account Settings</h1>
        </div>
        <Achievements achievements={achievements} isSubmitting={isSubmitting} />
        <Privacy isPrivate={isPrivate} isSubmitting={isSubmitting} />
        <Danger
          user={user}
          isSubmitting={isSubmitting}
          confirmation={confirmation}
          setConfirmation={setConfirmation}
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />
      </div>
    </main>
  );
}
