import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { fetchProducts, deleteProduct, selectFilteredProducts } from "../../../reducers/products";
import { fetchCategories, selectActiveCategoriesForDropdown } from "../../../reducers/categories";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Modal } from "../../../components/Modal/Modal";
import { Loader, EntityForm, WeatherWidget, SearchBar } from "../../../components";
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
  const allProducts = useAppSelector(selectFilteredProducts);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(allProducts);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // Фильтруем продукты по поисковому запросу
    if (allProducts) {
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProducts(filtered);
    }
  }, [allProducts, searchQuery]);

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
          <button onClick={handleAddClick} className={styles.addButton}>
            <FaPlus className={styles.addIcon} />
            Добавить товар
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Поиск товаров..."
          loading={productsLoading}
        />
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>
          {searchQuery 
            ? "По вашему запросу товары не найдены" 
            : "Нет товаров"}
        </div>
      ) : (
        <div className={styles.productGrid}>
          {products.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.card}>
                <div className={styles.imageContainer}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.productImage}
                  />
                </div>
                <div className={styles.content}>
                  <h3 className={styles.title}>{product.name}</h3>
                  <p className={styles.description}>{product.description}</p>
                  <div className={styles.category}>
                    {product.category
                      ? typeof product.category === "object"
                        ? product.category.name || "Без названия"
                        : categories.find((cat) => cat.value === product.category)
                            ?.label || "Неизвестная категория"
                      : "Без категории"}
                  </div>
                  <div className={styles.price}>
                    {product.price} ₽ / {product.unitOfMeasure}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      onClick={(e) => handleEditClick(product, e)}
                      className={styles.editButton}
                    >
                      <FaEdit /> Изменить
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(product._id, e)}
                      className={styles.deleteButton}
                    >
                      <FaTrash /> Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Подтверждение удаления"
        type="delete"
        onConfirm={handleDeleteConfirm}
        confirmText="Удалить"
      >
        <p>Вы уверены, что хотите удалить этот товар?</p>
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
