import { Check, AlertCircle } from "lucide-react";
import { NotificationType } from "~/types/ui";
import styles from "~/styles/components/ui/Notification.module.css";

export interface NotificationProps {
  type: NotificationType;
  message: string;
}

export function Notification({ type, message }: NotificationProps) {
  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      {type === "error" ? <AlertCircle size={18} /> : <Check size={18} />}
      <span>{message}</span>
    </div>
  );
}
