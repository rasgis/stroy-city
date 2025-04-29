import React, { useState } from "react";
import { CategoryCard } from "../CategoryCard/CategoryCard";
import { Category } from "../../types";
import styles from "./CategoryGrid.module.css";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick?: (category: Category) => void;
  showChildren?: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryClick,
  showChildren = true,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  if (!categories || categories.length === 0) {
    return (
      <div className={styles.gridContainer}>
        <p className={styles.emptyMessage}>Категории не найдены</p>
      </div>
    );
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  };

  const renderCategories = (categoryList: Category[], level = 0) => {
    return categoryList.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category._id);

      return (
        <React.Fragment key={category._id}>
          <div
            className={`${styles.gridItem} ${
              level > 0 ? styles.subcategory : ""
            }`}
          >
            <div className={styles.categoryWrapper}>
              <CategoryCard
                category={category}
                onClick={() => {
                  onCategoryClick?.(category);
                }}
              />
              {hasChildren && showChildren && (
                <button
                  className={styles.expandButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category._id);
                  }}
                  title={
                    isExpanded
                      ? "Свернуть подкатегории"
                      : "Показать подкатегории"
                  }
                >
                  {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                </button>
              )}
            </div>
          </div>
          {showChildren && hasChildren && isExpanded && (
            <div className={styles.subcategoriesContainer}>
              {renderCategories(category.children || [], level + 1)}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={styles.gridContainer}>
      <div className={styles.categoryGrid}>{renderCategories(categories)}</div>
    </div>
  );
};
