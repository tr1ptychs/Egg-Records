import { CardVariant } from "~/types/ui";
import styles from "~/styles/components/ui/Card.module.css";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
}

export function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  const variantClass = variant !== "default" ? styles[variant] : "";
  const classNames = [styles.card, variantClass, className]
    .filter(Boolean)
    .join(" ");

  return <div className={classNames}>{children}</div>;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`${styles.cardHeader} ${className}`}>{children}</div>;
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return <h2 className={`${styles.cardTitle} ${className}`}>{children}</h2>;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`${styles.cardBody} ${className}`}>{children}</div>;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return <div className={`${styles.cardFooter} ${className}`}>{children}</div>;
}
