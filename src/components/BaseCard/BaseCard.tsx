import React, { ReactNode, HTMLAttributes } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./BaseCard.module.css";
import { handleImageError } from "../../utils/imageUtils";

export interface BaseCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Заголовок карточки
   */
  title?: ReactNode;

  /**
   * Содержимое карточки
   */
  children?: ReactNode;

  /**
   * Содержимое нижней части карточки (футер)
   */
  footer?: ReactNode;

  /**
   * Изображение карточки
   */
  image?: string;

  /**
   * Альтернативный текст для изображения
   */
  imageAlt?: string;

  /**
   * Fallback-изображение при ошибке загрузки
   */
  fallbackImage?: string;

  /**
   * Ссылка при клике на карточку
   */
  linkTo?: string;

  /**
   * Обработчик клика на карточку
   */
  onClick?: (e: React.MouseEvent) => void;

  /**
   * Дополнительные элементы в заголовке карточки
   */
  headerActions?: ReactNode;

  /**
   * Вариант внешнего вида карточки
   */
  variant?:
    | "default"
    | "elevated"
    | "outlined"
    | "transparent"
    | "product"
    | "category"
    | "cart"
    | "adminCard";

  /**
   * Добавить градиентный фон
   */
  gradient?: boolean;

  /**
   * Дополнительный CSS класс
   */
  className?: string;
}

export const BaseCard: React.FC<BaseCardProps> = ({
  title,
  children,
  footer,
  image,
  imageAlt = "",
  fallbackImage = "/placeholder.jpg",
  linkTo,
  onClick,
  headerActions,
  variant = "default",
  gradient = false,
  className,
  ...props
}) => {
  const cardClassName = classNames(
    styles.card,
    {
      [styles.elevated]: variant === "elevated",
      [styles.outlined]: variant === "outlined",
      [styles.transparent]: variant === "transparent",
      [styles.productCard]: variant === "product",
      [styles.categoryCard]: variant === "category",
      [styles.cartCard]: variant === "cart",
      [styles.adminCard]: variant === "adminCard",
      [styles.gradient]: gradient,
      [styles.clickable]: linkTo || onClick,
    },
    className
  );

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
  };

  // Особая обработка заголовка для карточек категорий
  const renderTitle = () => {
    // Если это категория, обрабатываем особым образом
    if (variant === "category") {
      // Если заголовок уже ReactNode (div или другой элемент), используем его
      if (typeof title !== "string") {
        return title;
      }
      // Если заголовок - строка, обертываем его в div с принудительными стилями
      return (
        <div
          className={styles.cardTitle}
          style={{
            color:
              document.documentElement.getAttribute("data-theme") === "light"
                ? "#2c3e50"
                : "#d4ffea",
            background:
              document.documentElement.getAttribute("data-theme") === "light"
                ? "white"
                : "#1d1e24",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {title}
        </div>
      );
    }

    // Для других типов карточек
    return typeof title === "string" ? (
      <h3 className={styles.cardTitle}>{title}</h3>
    ) : (
      title
    );
  };

  const renderCardContent = () => (
    <>
      {image && (
        <div className={styles.imageContainer}>
          <img
            src={image}
            alt={imageAlt}
            className={styles.image}
            onError={(e) => handleImageError(e, fallbackImage)}
            loading="lazy"
          />
        </div>
      )}

      {(title || headerActions) && (
        <div className={styles.cardHeader}>
          {title && renderTitle()}
          {headerActions && (
            <div className={styles.headerActions}>{headerActions}</div>
          )}
        </div>
      )}

      {children && <div className={styles.cardContent}>{children}</div>}

      {footer && <div className={styles.cardFooter}>{footer}</div>}
    </>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className={classNames(styles.cardLink, cardClassName)}
        onClick={handleCardClick}
      >
        {renderCardContent()}
      </Link>
    );
  }

  return (
    <div className={cardClassName} onClick={handleCardClick} {...props}>
      {renderCardContent()}
    </div>
  );
};
