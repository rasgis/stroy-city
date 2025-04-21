import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchProductById, selectSelectedProduct, selectProductLoading, selectProductError } from "../../reducers/products";
import { fetchCategories, selectFilteredCategories } from "../../reducers/categories";
import { addToCartWithNotification } from "../../reducers/cartSlice";
import { ROUTES } from "../../constants/routes";
import { categoryService } from "../../services/categoryService";
import { Breadcrumbs } from "../../components";
import styles from "./ProductDetail.module.css";
import { scrollToTop } from "../../utils/scroll";
import { BsExclamationCircle } from "react-icons/bs";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  
  // Используем мемоизированные селекторы для продукта
  const product = useAppSelector(selectSelectedProduct);
  const productLoading = useAppSelector(selectProductLoading);
  const productError = useAppSelector(selectProductError);
  
  // Используем мемоизированные селекторы для категорий
  const categories = useAppSelector(selectFilteredCategories);
  const categoriesLoading = useAppSelector((state) => state.categoriesList.loading);
  const categoriesError = useAppSelector((state) => state.categoriesList.error);
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    dispatch(fetchCategories());
    scrollToTop();
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCartWithNotification({ ...product, quantity: 1 }));
    }
  };

  if (productLoading || categoriesLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (productError || categoriesError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{productError || categoriesError}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>Товар не найден</div>
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
              url: ROUTES.CATALOG
            },
            ...categoryPath.map(category => ({
              _id: category._id,
              name: category.name,
              url: ROUTES.CATEGORY.replace(":categoryId", category._id)
            })),
            {
              _id: product._id,
              name: product.name,
              url: ""
            }
          ]}
          className={styles.breadcrumbs}
        />

        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <img
              src={product.image}
              alt={product.name}
              className={styles.image}
            />
          </div>
          <div className={styles.info}>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.price}>
              {product.price} ₽ / {product.unitOfMeasure}
            </div>
            {isAuthenticated && (
              <button
                className={styles.addToCartButton}
                onClick={handleAddToCart}
              >
                Добавить в корзину
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
