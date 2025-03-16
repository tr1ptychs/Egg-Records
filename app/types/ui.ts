export type NotificationType = "success" | "error";

export interface NotificationProps {
  type: NotificationType;
  message: string;
}

export type ButtonVariant = "primary" | "secondary" | "danger" | "text" | "discord";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}

export type CardVariant = "default" | "primary" | "accent" | "danger";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}
