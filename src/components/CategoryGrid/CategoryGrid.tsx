import React from "react";
import { CategoryCard } from "../CategoryCard/CategoryCard";
import { Category } from "../../types";
import styles from "./CategoryGrid.module.css";

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick?: (category: Category) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryClick,
}) => {
  if (!categories || categories.length === 0) {
    return (
      <div className={styles.gridContainer}>
        <p className={styles.emptyMessage}>Категории не найдены</p>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      <div className={styles.categoryGrid}>
        {categories.map((category) => (
          <div key={category._id} className={styles.gridItem}>
            <CategoryCard
              category={category}
              onClick={() => onCategoryClick?.(category)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
