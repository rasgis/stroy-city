import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchCategories,
  deleteCategory,
  selectAllCategories,
  hideCategory,
  restoreCategory,
  setFilters,
  selectFilteredCategories,
} from "../../../reducers/categories";
import {
  Loader,
  EntityForm,
  WeatherWidget,
  Modal,
  Button,
  ErrorMessage,
} from "../../../components";
import { Category } from "../../../types";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaRedoAlt,
} from "react-icons/fa";
import {
  MdExpandLess as ExpandLessIcon,
  MdExpandMore as ExpandMoreIcon,
} from "react-icons/md";
import styles from "./CategoryList.module.css";

// Временная типизация для преобразования Category в CategoryFormValues
const categoryToFormValues = (category: Category | null) => {
  if (!category) return undefined;

  return {
    _id: category._id,
    name: category.name,
    description: category.description || "",
    image: category.image || "",
    parentId: category.parentId || "",
    isActive: category.isActive,
  };
};

const CategoryListContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectAllCategories);
  const filteredCategories = useAppSelector(selectFilteredCategories);
  const loading = useAppSelector((state) => state.categoriesList.loading);
  const error = useAppSelector((state) => state.categoriesList.error);
  const showInactive = useAppSelector(
    (state) => state.categoriesList.filters.showInactive
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [actionCategoryId, setActionCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Отслеживаем изменения фильтров
  useEffect(() => {
    console.log('Значение showInactive в компоненте:', showInactive);
  }, [showInactive]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setActionCategoryId(categoryId);
    setIsDeleteModalOpen(true);
  };

  const handleHideCategory = (categoryId: string) => {
    setActionCategoryId(categoryId);
    setIsHideModalOpen(true);
  };

  const handleRestoreCategory = async (categoryId: string) => {
    await dispatch(restoreCategory(categoryId));
  };

  const handleDeleteConfirm = async () => {
    if (actionCategoryId) {
      await dispatch(deleteCategory(actionCategoryId));
      setIsDeleteModalOpen(false);
      setActionCategoryId(null);
    }
  };

  const handleHideConfirm = async () => {
    if (actionCategoryId) {
      await dispatch(hideCategory(actionCategoryId));
      setIsHideModalOpen(false);
      setActionCategoryId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormModalOpen(false);
    setSelectedCategory(null);
  };

  const handleFormSubmit = () => {
    dispatch(fetchCategories());
  };

  const toggleShowInactive = () => {
    console.log(`Переключение показа неактивных категорий, текущее значение: ${showInactive}`);
    const newValue = !showInactive;
    dispatch(setFilters({ showInactive: newValue }));
    console.log(`Новое значение showInactive: ${newValue}`);
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
            {category.isActive === false && (
              <span className={styles.inactiveLabel}>Неактивна</span>
            )}
          </div>
          <div className={styles.actions}>
            <Button
              variant="warning"
              size="small"
              startIcon={<FaEdit />}
              onClick={() => handleEditCategory(category)}
              className={styles.editButton}
            />

            {category.isActive !== false ? (
              <Button
                variant="danger"
                size="small"
                startIcon={<FaEyeSlash />}
                onClick={() => handleHideCategory(category._id)}
                className={styles.hideButton}
              />
            ) : (
              <Button
                variant="success"
                size="small"
                startIcon={<FaRedoAlt />}
                onClick={() => handleRestoreCategory(category._id)}
                className={styles.restoreButton}
              />
            )}

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
    return <ErrorMessage message={error} />;
  }

  const categoryTree = buildCategoryTree(filteredCategories);
  // Преобразование Category в CategoryFormValues для EntityForm
  const categoryFormData = categoryToFormValues(selectedCategory);

  return (
    <div>
      <WeatherWidget />

      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Управление категориями</h2>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              startIcon={showInactive ? <FaEyeSlash /> : <FaEye />}
              onClick={toggleShowInactive}
            >
              {showInactive ? "Скрыть неактивные" : "Показать все"}
            </Button>
            <Button
              variant="primary"
              onClick={handleAddCategory}
              startIcon={<FaPlus className={styles.addIcon} />}
            >
              Добавить категорию
            </Button>
          </div>
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

      <Modal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        title="Подтверждение скрытия категории"
        type="default"
        onConfirm={handleHideConfirm}
        confirmText="Скрыть"
      >
        <p>Вы уверены, что хотите скрыть эту категорию?</p>
        <p>
          Категория будет скрыта для покупателей, но вы сможете восстановить ее
          позже.
        </p>
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
