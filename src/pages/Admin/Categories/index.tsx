import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchCategories,
  deleteCategory,
  selectFilteredCategories,
} from "../../../reducers/categories";
import { Loader, EntityForm, WeatherWidget, Modal, Button } from "../../../components";
import { Category } from "../../../types";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { MdExpandLess as ExpandLessIcon, MdExpandMore as ExpandMoreIcon } from "react-icons/md";
import styles from "./CategoryList.module.css";

// Временная типизация для преобразования Category в CategoryFormValues
const categoryToFormValues = (category: Category | null) => {
  if (!category) return undefined;
  
  return {
    _id: category._id,
    name: category.name,
    description: category.description || '',
    image: category.image || '',
    parentId: category.parentId || '',
    isActive: category.isActive
  };
};

const CategoryListContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectFilteredCategories);
  const loading = useAppSelector((state) => state.categoriesList.loading);
  const error = useAppSelector((state) => state.categoriesList.error);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setDeleteCategoryId(categoryId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteCategoryId) {
      await dispatch(deleteCategory(deleteCategoryId));
      setIsDeleteModalOpen(false);
      setDeleteCategoryId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormModalOpen(false);
    setSelectedCategory(null);
  };

  const handleFormSubmit = () => {
    dispatch(fetchCategories());
  };

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
              <Button
                variant="text"
                className={styles.expandButton}
                onClick={() => toggleExpand(category._id)}
                startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              />
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
            <Button
              variant="warning"
              size="small"
              startIcon={<FaEdit />}
              onClick={() => handleEditCategory(category)}
              className={styles.editButton}
            />
            <Button
              variant="danger"
              size="small"
              startIcon={<FaTrash />}
              onClick={() => handleDeleteCategory(category._id)}
              className={styles.deleteButton}
            />
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

  if (loading) {
    return <Loader message="Загрузка категорий..." />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const categoryTree = buildCategoryTree(categories);
  // Преобразование Category в CategoryFormValues для EntityForm
  const categoryFormData = categoryToFormValues(selectedCategory);

  return (
    <div>
      <WeatherWidget />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Управление категориями</h2>
          <Button
            variant="primary"
            onClick={handleAddCategory}
            className={styles.addButton}
            startIcon={<FaPlus className={styles.addIcon} />}
          >
            Добавить категорию
          </Button>
        </div>

        <div className={styles.list}>
          {categoryTree.length === 0 ? (
            <div className={styles.empty}>Нет категорий</div>
          ) : (
            categoryTree.map((category) => renderCategory(category))
          )}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Удаление категории"
        type="delete"
        onConfirm={handleDeleteConfirm}
        confirmText="Удалить"
      >
        <p>Вы действительно хотите удалить эту категорию?</p>
        <p>Это действие нельзя будет отменить.</p>
      </Modal>

      <EntityForm
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        entityType="category"
        entityData={categoryFormData}
        afterSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default CategoryListContainer;
