import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchAllProductsAdmin,
  deleteProduct,
  permanentDeleteProduct,
  restoreProduct,
  selectFilteredAdminProducts,
  setFilters,
} from "../../../reducers/products";
import {
  fetchCategories,
  selectActiveCategoriesForDropdown,
} from "../../../reducers/categories";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTrashAlt,
  FaRedoAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  Modal,
  Button,
  Loader,
  EntityForm,
  WeatherWidget,
  SearchBar,
  ErrorMessage,
} from "../../../components";
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
    image: product.image || "",
    categoryId:
      typeof product.category === "object"
        ? product.category._id
        : product.category,
    unitOfMeasure: product.unitOfMeasure,
    isActive: product.isActive,
  };
};

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const productsLoading = useAppSelector((state) => state.productsList.loading);
  const productsError = useAppSelector((state) => state.productsList.error);
  const categories = useAppSelector(selectActiveCategoriesForDropdown);
  const allProducts = useAppSelector(selectFilteredAdminProducts);
  const showInactive = useAppSelector(
    (state) => state.productsList.filters.showInactive
  );

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] =
    useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [actionProductId, setActionProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(allProducts);

  useEffect(() => {
    dispatch(fetchAllProductsAdmin());
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

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    setActionProductId(productId);
    setIsDeleteModalOpen(true);
  };

  const handlePermanentDeleteClick = (productId: string) => {
    console.log("Запрос на полное удаление товара с ID:", productId);
    setActionProductId(productId);
    setIsPermanentDeleteModalOpen(true);
  };

  const handleRestoreClick = async (productId: string) => {
    console.log("Нажата кнопка восстановления товара с ID:", productId);
    try {
      const resultAction = await dispatch(restoreProduct(productId));
      console.log("Результат восстановления товара:", resultAction);
      
      if (restoreProduct.fulfilled.match(resultAction)) {
        console.log("Товар успешно восстановлен:", resultAction.payload);
        // Redux уже обновляет данные в сторе, дополнительная загрузка не требуется
      } else if (restoreProduct.rejected.match(resultAction)) {
        console.error("Ошибка при восстановлении товара:", resultAction.error);
        alert("Ошибка при восстановлении товара: " + resultAction.error.message);
      }
    } catch (error) {
      console.error("Необработанная ошибка при восстановлении товара:", error);
      alert("Произошла ошибка при восстановлении товара");
    }
  };

  const handleDeleteConfirm = async () => {
    if (actionProductId) {
      console.log("Скрытие товара с ID:", actionProductId);
      try {
        const resultAction = await dispatch(deleteProduct(actionProductId));
        console.log("Результат скрытия товара:", resultAction);
        
        if (deleteProduct.fulfilled.match(resultAction)) {
          console.log("Товар успешно скрыт:", resultAction.payload);
          // Redux уже обновляет данные в сторе, дополнительная загрузка не требуется
        }
      } catch (error) {
        console.error("Ошибка при скрытии товара:", error);
      }
      
      setIsDeleteModalOpen(false);
      setActionProductId(null);
    }
  };

  const handlePermanentDeleteConfirm = async () => {
    if (actionProductId) {
      console.log("Полное удаление товара с ID:", actionProductId);
      try {
        const resultAction = await dispatch(permanentDeleteProduct(actionProductId));
        console.log("Результат полного удаления товара:", resultAction);
        
        if (permanentDeleteProduct.fulfilled.match(resultAction)) {
          console.log("Товар успешно удален полностью:", resultAction.payload);
          // Redux уже обновляет данные в сторе, дополнительная загрузка не требуется
        }
      } catch (error) {
        console.error("Ошибка при полном удалении товара:", error);
      }
      
      setIsPermanentDeleteModalOpen(false);
      setActionProductId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormModalOpen(false);
    setSelectedProduct(null);
  };

  const handleFormSubmit = () => {
    dispatch(fetchAllProductsAdmin());
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleShowInactive = () => {
    dispatch(setFilters({ showInactive: !showInactive }));
  };

  if (productsLoading) {
    return <Loader message="Загрузка списка товаров..." />;
  }

  if (productsError) {
    return <ErrorMessage message={productsError} />;
  }

  // Преобразование Product в ProductFormValues для EntityForm
  const productFormData = productToFormValues(selectedProduct);

  return (
    <div className={styles.container}>
      <WeatherWidget />
      <div className={styles.header}>
        <h2>Управление товарами</h2>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            startIcon={showInactive ? <FaEyeSlash /> : <FaEye />}
            onClick={toggleShowInactive}
            className={styles.filterButton}
          >
            {showInactive ? "Скрыть неактивные" : "Показать все"}
          </Button>
          <Button
            variant="primary"
            startIcon={<FaPlus className={styles.addIcon} />}
            onClick={handleAddClick}
            className={styles.addButton}
          >
            Добавить товар
          </Button>
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
          {searchQuery ? "По вашему запросу товары не найдены" : "Нет товаров"}
        </div>
      ) : (
        <div className={styles.productGrid}>
          {products.map((product) => (
            <div
              key={product._id}
              className={`${styles.productCard} ${
                !product.isActive ? styles.inactiveProduct : ""
              }`}
            >
              <div className={styles.card}>
                {!product.isActive && (
                  <div className={styles.inactiveLabel}>Скрыт</div>
                )}
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
                        : categories.find(
                            (cat) => cat.value === product.category
                          )?.label || "Неизвестная категория"
                      : "Без категории"}
                  </div>
                  <div className={styles.price}>
                    {product.price} ₽ / {product.unitOfMeasure}
                  </div>
                  <div className={styles.cardActions}>
                    <Button
                      variant="warning"
                      startIcon={<FaEdit />}
                      onClick={() => handleEditClick(product)}
                      className={styles.editButton}
                    >
                      Изменить
                    </Button>

                    {product.isActive ? (
                      <Button
                        variant="danger"
                        startIcon={<FaEyeSlash />}
                        onClick={() => handleDeleteClick(product._id)}
                        className={styles.hideButton}
                      >
                        Скрыть
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        startIcon={<FaRedoAlt />}
                        onClick={() => handleRestoreClick(product._id)}
                        className={styles.restoreButton}
                      >
                        Восстановить
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      startIcon={<FaTrashAlt />}
                      onClick={() => handlePermanentDeleteClick(product._id)}
                      className={styles.deleteButton}
                      title="Полное удаление из базы данных"
                    >
                      Удалить
                    </Button>
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
        title="Подтверждение скрытия товара"
        type="default"
        onConfirm={handleDeleteConfirm}
        confirmText="Скрыть"
      >
        <p>Вы уверены, что хотите скрыть этот товар?</p>
        <p>
          Товар будет скрыт для покупателей, но вы сможете восстановить его
          позже.
        </p>
      </Modal>

      <Modal
        isOpen={isPermanentDeleteModalOpen}
        onClose={() => setIsPermanentDeleteModalOpen(false)}
        title="Подтверждение полного удаления"
        type="delete"
        onConfirm={handlePermanentDeleteConfirm}
        confirmText="Удалить безвозвратно"
      >
        <p>
          Вы уверены, что хотите <strong>полностью удалить</strong> этот товар
          из базы данных?
        </p>
        <p>Это действие нельзя будет отменить!</p>
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
