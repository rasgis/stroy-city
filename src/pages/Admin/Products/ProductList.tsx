import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { fetchProducts, deleteProduct, selectFilteredProducts } from "../../../reducers/products";
import { fetchCategories, selectActiveCategoriesForDropdown } from "../../../reducers/categories";
import { FaEdit, FaTrash, FaPlus, FaFilter } from "react-icons/fa";
import { Modal } from "../../../components/Modal/Modal";
import { Loader, EntityForm, WeatherWidget } from "../../../components";
import { Product } from "../../../types";
import styles from "./Admin.module.css";

// Временная типизация для преобразования Product в ProductFormValues
const productToFormValues = (product: Product | null) => {
  if (!product) return undefined;
  
  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image || '',
    categoryId: typeof product.category === 'object' ? product.category._id : product.category,
    unitOfMeasure: product.unitOfMeasure
  };
};

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const productsLoading = useAppSelector((state) => state.productsList.loading);
  const productsError = useAppSelector((state) => state.productsList.error);
  const categories = useAppSelector(selectActiveCategoriesForDropdown);
  const products = useAppSelector(selectFilteredProducts);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: null as string | null,
    searchTerm: "",
    minPrice: null as number | null,
    maxPrice: null as number | null,
  });

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    setDeleteProductId(productId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteProductId) {
      await dispatch(deleteProduct(deleteProductId));
      setIsDeleteModalOpen(false);
      setDeleteProductId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormModalOpen(false);
    setSelectedProduct(null);
  };

  const handleFormSubmit = () => {
    dispatch(fetchProducts());
  };
  
  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };
  
  const handleApplyFilters = () => {
    dispatch({ 
      type: 'productsList/setFilters', 
      payload: filters 
    });
    setIsFilterModalOpen(false);
  };
  
  const handleResetFilters = () => {
    setFilters({
      category: null,
      searchTerm: "",
      minPrice: null,
      maxPrice: null,
    });
    dispatch({ type: 'productsList/resetFilters' });
    setIsFilterModalOpen(false);
  };

  if (productsLoading) {
    return <Loader message="Загрузка списка товаров..." />;
  }

  if (productsError) {
    return <div className={styles.error}>{productsError}</div>;
  }

  // Преобразование Product в ProductFormValues для EntityForm
  const productFormData = productToFormValues(selectedProduct);

  return (
    <div className={styles.container}>
      <WeatherWidget />
      <div className={styles.header}>
        <h2>Управление товарами</h2>
        <div className={styles.actions}>
          <button onClick={handleFilterClick} className={styles.filterButton}>
            <FaFilter className={styles.filterIcon} />
            Фильтры
          </button>
          <button onClick={handleAddClick} className={styles.addButton}>
            <FaPlus className={styles.addIcon} />
            Добавить товар
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>Нет товаров</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Изображение</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Категория</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>
                    {product.price} ₽ / {product.unitOfMeasure}
                  </td>
                  <td>
                    {product.category
                      ? typeof product.category === "object"
                        ? product.category.name || "Без названия"
                        : categories.find((cat) => cat.value === product.category)
                            ?.label || "Неизвестная категория"
                      : "Без категории"}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleEditClick(product)}
                        className={styles.editButton}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product._id)}
                        className={styles.deleteButton}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Подтверждение удаления"
      >
        <div className={styles.modalContent}>
          <p>Вы уверены, что хотите удалить этот товар?</p>
          <div className={styles.modalButtons}>
            <button
              onClick={handleDeleteConfirm}
              className={styles.dangerButton}
            >
              Удалить
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className={styles.cancelButton}
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
      
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Фильтры товаров"
      >
        <div className={styles.filterForm}>
          <div className={styles.formGroup}>
            <label>Поиск по названию:</label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              placeholder="Введите часть названия..."
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Категория:</label>
            <select
              value={filters.category || ""}
              onChange={(e) => setFilters({...filters, category: e.target.value || null})}
            >
              <option value="">Все категории</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Мин. цена:</label>
              <input
                type="number"
                value={filters.minPrice || ""}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value ? Number(e.target.value) : null})}
                placeholder="От"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Макс. цена:</label>
              <input
                type="number"
                value={filters.maxPrice || ""}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value ? Number(e.target.value) : null})}
                placeholder="До"
              />
            </div>
          </div>
          
          <div className={styles.filterActions}>
            <button onClick={handleApplyFilters} className={styles.applyButton}>
              Применить фильтры
            </button>
            <button onClick={handleResetFilters} className={styles.resetButton}>
              Сбросить фильтры
            </button>
          </div>
        </div>
      </Modal>
      
      {isFormModalOpen && (
        <EntityForm
          isOpen={isFormModalOpen}
          onClose={handleFormClose}
          entityType="product"
          entityData={productFormData}
          afterSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default ProductList;
