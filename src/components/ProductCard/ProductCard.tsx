import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../types/product";
import { ROUTES } from "../../constants/routes";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { addToCartWithNotification } from "../../reducers/cartSlice";
import { selectFilteredCategories } from "../../reducers/categories";
import { Button } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import styles from "./ProductCard.module.css";
import { scrollToTop } from "../../utils/scroll";

interface ProductCardProps {
  product: Product;
  isAuthenticated: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  isAuthenticated,
}) => {
  const categories = useAppSelector(selectFilteredCategories);
  const dispatch = useAppDispatch();

  // Мемоизируем название категории
  const categoryName = useMemo(() => {
    // Проверяем, существует ли product.category
    if (!product.category) {
      return "Без категории";
    }

    // Если product.category - строка (ID категории)
    if (typeof product.category === "string") {
      const foundCategory = categories.find(
        (cat) => cat._id === product.category
      );
      return foundCategory ? foundCategory.name : "Категория не найдена";
    }

    // Если product.category - объект (с полем name)
    if (product.category.name) {
      return product.category.name;
    }

    return "Неизвестная категория";
  }, [product.category, categories]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    e.stopPropagation(); // Предотвращаем всплытие события
    dispatch(addToCartWithNotification({ ...product, quantity: 1 }));
  }, [dispatch, product]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Предотвращаем перекрытие события клика на кнопку
    if ((e.target as Element).closest(`.${styles.cartButton}`)) {
      e.preventDefault();
      return;
    }
    scrollToTop();
  }, []);

  return (
    <>
      <Link
        to={ROUTES.PRODUCT_DETAIL.replace(":id", product._id)}
        className={styles.cardLink}
        onClick={handleCardClick}
      >
        <div className={styles.card}>
          <div className={styles.imageContainer}>
            <img
              src={product.image}
              alt={product.name}
              className={styles.image}
              loading="lazy"
            />
          </div>
          <div className={styles.content}>
            <h3 className={styles.title}>{product.name}</h3>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.category}>{categoryName}</div>
            <div className={styles.price}>
              {product.price} ₽ / {product.unitOfMeasure}
            </div>
            {isAuthenticated && (
              <div className={styles.actions}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddToCart}
                  className={styles.cartButton}
                  startIcon={<AddShoppingCartIcon />}
                >
                  В корзину
                </Button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}, (prevProps, nextProps) => {
  // Проверяем, действительно ли нужно перерендерить компонент
  return (
    prevProps.product._id === nextProps.product._id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.description === nextProps.product.description &&
    prevProps.product.image === nextProps.product.image &&
    prevProps.isAuthenticated === nextProps.isAuthenticated
  );
});
