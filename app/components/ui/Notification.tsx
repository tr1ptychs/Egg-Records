import { Check, AlertCircle } from "lucide-react";
import { NotificationProps } from "~/types/ui";
import styles from "~/styles/components/ui/Notification.module.css";

export function Notification({ type, message }: NotificationProps) {
  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      {type === "error" ? (
        <AlertCircle size={18} />
      ) : (
        <Check size={18} />
      )}
      <span>{message}</span>
    </div>
  );
}
