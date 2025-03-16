import styles from "~/styles/components/profile/Profile.module.css";

export function PrivateProfile() {
  return (
    <div className={styles.privateMessage}>
      <div className={styles.lockIcon}>🔒</div>
      <h2 className={styles.privateTitle}>This profile is private</h2>
      <p className={styles.privateText}>The user has chosen to keep their scores private.</p>
    </div>
  );
}
