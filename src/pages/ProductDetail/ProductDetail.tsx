import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchProductById,
  selectSelectedProduct,
  selectProductLoading,
  selectProductError,
} from "../../reducers/products";
import {
  fetchCategories,
  selectFilteredCategories,
} from "../../reducers/categories";
import { addToCartWithNotification } from "../../reducers/cartSlice";
import { ROUTES } from "../../constants/routes";
import { categoryService } from "../../services/categoryService";
import {
  Breadcrumbs,
  Loader,
  ErrorMessage,
  ItemNotFound,
  Button,
} from "../../components";
import styles from "./ProductDetail.module.css";
import { scrollToTop } from "../../utils/scroll";
import { handleImageError } from "../../utils/imageUtils";
import { useAuth } from "../../hooks/useAuth";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);

  // Используем мемоизированные селекторы для продукта
  const product = useAppSelector(selectSelectedProduct);
  const productLoading = useAppSelector(selectProductLoading);
  const productError = useAppSelector(selectProductError);

  // Используем мемоизированные селекторы для категорий
  const categories = useAppSelector(selectFilteredCategories);
  const categoriesLoading = useAppSelector(
    (state) => state.categoriesList.loading
  );
  const categoriesError = useAppSelector((state) => state.categoriesList.error);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    dispatch(fetchCategories());
    scrollToTop();
  }, [dispatch, id]);

  const handleAddToCart = () => {
    // Проверка авторизации перед добавлением в корзину
    if (!isAuthenticated) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      navigate(ROUTES.LOGIN, { state: { from: `/products/${id}` } });
      return;
    }

    if (product) {
      dispatch(addToCartWithNotification({ ...product, quantity: 1 }));
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    }
  };

  const closeSnackbar = () => {
    setShowSnackbar(false);
  };

  if (productLoading || categoriesLoading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader message="Загрузка информации о продукте..." />
      </div>
    );
  }

  if (productError || categoriesError) {
    return (
      <div className={styles.container}>
        <ErrorMessage
          message={
            productError ||
            categoriesError ||
            "Произошла ошибка при загрузке товара"
          }
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <ItemNotFound message="Товар не найден" />
      </div>
    );
  }

  const categoryPath = categoryService.getCategoryPath(
    categories,
    typeof product.category === "string"
      ? product.category
      : product.category._id
  );

  return (
    <div className={styles.container}>
      <div className={styles.product}>
        <Breadcrumbs
          items={[
            {
              _id: "catalog",
              name: "Каталог",
              url: ROUTES.CATALOG,
            },
            ...categoryPath.map((category) => ({
              _id: category._id,
              name: category.name,
              url: ROUTES.CATEGORY.replace(":categoryId", category._id),
            })),
            {
              _id: product._id,
              name: product.name,
              url: "",
            },
          ]}
          className={styles.breadcrumbs}
        />

        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <img
              src={product.image || "/placeholder-image.png"}
              alt={product.name}
              className={styles.image}
              onError={(e) => handleImageError(e, "/placeholder-image.png")}
            />
          </div>
          <div className={styles.info}>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.price}>
              {product.price} ₽ / {product.unitOfMeasure}
            </div>
            <Button
              variant="primary"
              startIcon={<FaShoppingCart />}
              className={styles.addToCartButton}
              onClick={handleAddToCart}
            >
              {isAuthenticated
                ? "Добавить в корзину"
                : "Войти и добавить в корзину"}
            </Button>
          </div>
        </div>
      </div>

      {showSnackbar && (
        <div className={styles.snackbar}>
          <div className={styles.snackbarContent}>
            <span>Товар добавлен в корзину</span>
            <button className={styles.closeButton} onClick={closeSnackbar}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
