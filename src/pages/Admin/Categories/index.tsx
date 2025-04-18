import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchCategories,
  deleteCategory,
  selectFilteredCategories,
} from "../../../reducers/categories";
import CategoryList from "./CategoryList";
import { Loader, EntityForm, WeatherWidget, Modal } from "../../../components";
import { Category } from "../../../types";

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

  if (loading) {
    return <Loader message="Загрузка категорий..." />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <WeatherWidget />
      <CategoryList
        categories={categories}
        onAdd={handleAddCategory}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />

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
        afterSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default CategoryListContainer;
