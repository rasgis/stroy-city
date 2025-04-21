import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { Category } from "../../types";
import styles from "./CategoryCard.module.css";
import { scrollToTop } from "../../utils/scroll";
import { handleImageError } from "../../utils/imageUtils";

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = React.memo(({
  category,
  onClick,
}) => {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
    scrollToTop();
  }, [onClick]);

  return (
    <Link
      to={ROUTES.CATEGORY.replace(":categoryId", category._id)}
      className={styles.card}
      onClick={handleClick}
    >
      <div className={styles.imageContainer}>
        <img
          src={category.image || "/placeholder.jpg"}
          alt={category.name}
          onError={(e) => handleImageError(e, "/placeholder.jpg")}
          className={styles.image}
        />
      </div>
      <div className={styles.name}>{category.name}</div>
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
