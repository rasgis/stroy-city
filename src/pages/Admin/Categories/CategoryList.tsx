import React, { useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Category } from "../../../types";
import styles from "./CategoryList.module.css";

interface CategoryListProps {
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Построение дерева категорий
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    categories.forEach((category) => {
      categoryMap.set(category._id, { ...category, children: [] });
    });

    const rootCategories: Category[] = [];
    categories.forEach((category) => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryMap.get(category._id)!);
        }
      } else {
        rootCategories.push(categoryMap.get(category._id)!);
      }
    });

    return rootCategories;
  };

  const toggleExpand = (categoryId: string) => {
    const newExpandedCategories = new Set(expandedCategories);
    if (newExpandedCategories.has(categoryId)) {
      newExpandedCategories.delete(categoryId);
    } else {
      newExpandedCategories.add(categoryId);
    }
    setExpandedCategories(newExpandedCategories);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id);

    return (
      <div key={category._id} className={styles.category}>
        <div className={styles.categoryItem}>
          <div className={styles.categoryInfo}>
            {hasChildren ? (
              <button
                className={styles.expandButton}
                onClick={() => toggleExpand(category._id)}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </button>
            ) : (
              <div className={styles.expandButtonPlaceholder}></div>
            )}
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className={styles.categoryImage}
              />
            )}
            <h3>{category.name}</h3>
          </div>
          <div className={styles.actions}>
            <button
              onClick={() => onEdit(category)}
              className={styles.editButton}
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(category._id)}
              className={styles.deleteButton}
            >
              <FaTrash />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className={styles.childrenContainer}>
            {category.children!.map((child) =>
              renderCategory(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const categoryTree = buildCategoryTree(categories);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Управление категориями</h2>
        <button onClick={() => onAdd()} className={styles.addButton}>
          <FaPlus className={styles.addIcon} />
          Добавить категорию
        </button>
      </div>

      <div className={styles.list}>
        {categoryTree.length === 0 ? (
          <div className={styles.empty}>Нет категорий</div>
        ) : (
          categoryTree.map((category) => renderCategory(category))
        )}
      </div>
    </div>
  );
};

export default CategoryList;
