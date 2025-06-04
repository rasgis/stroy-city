import React, { useCallback, useMemo } from "react";
import { Product } from "../../types/product";
import { ROUTES } from "../../constants/routes";
import { useAppSelector, useAppDispatch } from "../../hooks";
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

    const categoryName = useMemo(() => {
      if (!product.category) {
        return "Без категории";
      }

      if (typeof product.category === "string") {
        const foundCategory = categories.find(
          (cat) => cat._id === product.category
        );
        return foundCategory ? foundCategory.name : "Категория не найдена";
      }

      if (product.category.name) {
        return product.category.name;
      }

      return "Неизвестная категория";
    }, [product.category, categories]);

    const handleAddToCart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAuthenticated) {
          dispatch(addToCartWithNotification({ ...product, quantity: 1 }));
        }
      },
      [dispatch, product, isAuthenticated]
    );

    const handleCardClick = useCallback((e: React.MouseEvent) => {
      if ((e.target as Element).closest(`.${styles.cartButton}`)) {
        e.preventDefault();
        return;
      }
      scrollToTop();
    }, []);

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
    // нужен ли перерендер 
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
