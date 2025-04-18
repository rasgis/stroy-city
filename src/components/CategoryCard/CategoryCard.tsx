import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { Category } from "../../types";
import styles from "./CategoryCard.module.css";
import { scrollToTop } from "../../utils/scroll";

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = React.memo(({
  category,
  onClick,
}) => {
  const handleClick = useCallback(() => {
    scrollToTop();
    onClick?.();
  }, [onClick]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/placeholder.jpg";
  }, []);

  return (
    <Link
      to={ROUTES.CATEGORY.replace(":categoryId", category._id)}
      className={styles.link}
      onClick={handleClick}
    >
      <div className={styles.card}>
        <div className={styles.media}>
          <img
            src={category.image || "/placeholder.jpg"}
            alt={category.name}
            onError={handleImageError}
          />
        </div>
        <div className={styles.title}>{category.name}</div>
      </div>
    </Link>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.category._id === nextProps.category._id &&
    prevProps.category.name === nextProps.category.name &&
    prevProps.category.image === nextProps.category.image &&
    prevProps.onClick === nextProps.onClick
  );
});
