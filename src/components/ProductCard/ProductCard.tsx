import React, { useCallback, useMemo } from "react";
import { Product } from "../../types/product";
import { ROUTES } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { addToCartWithNotification } from "../../reducers/cartSlice";
import { selectFilteredCategories } from "../../reducers/categories";
import { Button } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { scrollToTop } from "../../utils/scroll";
import { ProductDisplay } from "../ProductDisplay/ProductDisplay";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  isAuthenticated: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product, isAuthenticated }) => {
    const categories = useAppSelector(selectFilteredCategories);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

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

    const handleAddToCart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault(); // Предотвращаем переход по ссылке
        e.stopPropagation(); // Предотвращаем всплытие события

        if (isAuthenticated) {
          // Добавляем в корзину только если пользователь авторизован
          dispatch(addToCartWithNotification({ ...product, quantity: 1 }));
        }
      },
      [dispatch, product, isAuthenticated]
    );

    const handleCardClick = useCallback((e: React.MouseEvent) => {
      // Предотвращаем перекрытие события клика на кнопку
      if ((e.target as Element).closest(`.${styles.cartButton}`)) {
        e.preventDefault();
        return;
      }
      scrollToTop();
    }, []);

    // Футер карточки с кнопкой "В корзину" только для авторизованных пользователей
    const cardFooter = isAuthenticated ? (
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddToCart}
        className={styles.cartButton}
        startIcon={<AddShoppingCartIcon />}
      >
        В корзину
      </Button>
    ) : null;

    return (
      <ProductDisplay
        product={product}
        categoryName={categoryName}
        variant="product"
        linkTo={ROUTES.PRODUCT_DETAIL.replace(":id", product._id)}
        onClick={handleCardClick}
        footer={cardFooter}
      />
    );
  },
  (prevProps, nextProps) => {
    // Проверяем, действительно ли нужно перерендерить компонент
    return (
      prevProps.product._id === nextProps.product._id &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.name === nextProps.product.name &&
      prevProps.product.description === nextProps.product.description &&
      prevProps.product.image === nextProps.product.image &&
      prevProps.isAuthenticated === nextProps.isAuthenticated
    );
  }
);
