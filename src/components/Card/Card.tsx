import React, { ReactNode, HTMLAttributes } from "react";
import styles from "./Card.module.css";
import classNames from "classnames";

type HTMLDivProps = Omit<HTMLAttributes<HTMLDivElement>, "title">;

export interface CardProps extends HTMLDivProps {
  /**
   * Заголовок карточки
   */
  title?: ReactNode;

  /**
   * Дополнительные элементы в заголовке карточки
   */
  headerActions?: ReactNode;

  /**
   * Содержимое карточки
   */
  children: ReactNode;

  /**
   * Содержимое нижней части карточки (футер)
   */
  footer?: ReactNode;

  /**
   * Вариант внешнего вида карточки
   */
  variant?: "default" | "elevated" | "outlined" | "transparent";

  /**
   * Добавить градиентный фон
   */
  gradient?: boolean;

  /**
   * Сделать карточку кликабельной
   */
  clickable?: boolean;

  /**
   * Дополнительный CSS класс
   */
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  headerActions,
  children,
  footer,
  variant = "default",
  gradient = false,
  clickable = false,
  className,
  ...props
}) => {
  const cardClassName = classNames(
    styles.card,
    {
      [styles.elevated]: variant === "elevated",
      [styles.outlined]: variant === "outlined",
      [styles.transparent]: variant === "transparent",
      [styles.gradient]: gradient,
      [styles.clickable]: clickable,
    },
    className
  );

  return (
    <div className={cardClassName} {...props}>
      {(title || headerActions) && (
        <div className={styles.cardHeader}>
          {title &&
            (typeof title === "string" ? (
              <h2 className={styles.cardTitle}>{title}</h2>
            ) : (
              title
            ))}
          {headerActions}
        </div>
      )}

      <div className={styles.cardContent}>{children}</div>

      {footer && <div className={styles.cardFooter}>{footer}</div>}
    </div>
  );
};
