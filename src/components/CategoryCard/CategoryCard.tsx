import React, { useCallback } from "react";
import { ROUTES } from "../../constants/routes";
import { Category } from "../../types";
import { scrollToTop } from "../../utils/scroll";
import { BaseCard } from "../BaseCard";
import "./fixCategory.css";

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = React.memo(
  ({ category, onClick }) => {
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if (onClick) {
          onClick();
        } else {
          scrollToTop();
        }
      },
      [onClick]
    );

    return (
      <BaseCard
        variant="category"
        title={<div className="category-title-fix">{category.name}</div>}
        image={category.image || "/placeholder.jpg"}
        imageAlt={category.name}
        fallbackImage="/placeholder.jpg"
        linkTo={ROUTES.CATEGORY.replace(":categoryId", category._id)}
        onClick={handleClick}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.category._id === nextProps.category._id &&
      prevProps.category.name === nextProps.category.name &&
      prevProps.category.image === nextProps.category.image &&
      prevProps.onClick === nextProps.onClick
    );
  }
);
