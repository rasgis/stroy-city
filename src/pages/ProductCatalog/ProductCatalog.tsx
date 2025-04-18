import React, { useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCategories, selectFilteredCategories } from "../../reducers/categories";
import CategoryGrid from "../../components/CategoryGrid/CategoryGrid";
import { Loader } from "../../components";
import { categoryService } from "../../services/categoryService";
import styles from "./ProductCatalog.module.css";
import { scrollToTop } from "../../utils/scroll";

const ProductCatalog: React.FC = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectFilteredCategories);
  const categoriesLoading = useAppSelector((state) => state.categoriesList.loading);
  const categoriesError = useAppSelector((state) => state.categoriesList.error);

  useEffect(() => {
    dispatch(fetchCategories());
    scrollToTop();
  }, [dispatch]);

  if (categoriesLoading) {
    return (
      <Container className={styles.container}>
        <Loader message="Загрузка категорий..." />
      </Container>
    );
  }

  if (categoriesError) {
    return (
      <Container className={styles.container}>
        <Typography color="error">{categoriesError}</Typography>
      </Container>
    );
  }

  const rootCategories = categoryService.buildFullCategoryTree(categories);

  return (
    <Container className={styles.container}>
      <Box className={styles.content}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className={styles.title}
        >
          Каталог товаров
        </Typography>

        {rootCategories.length === 0 ? (
          <Typography>Нет доступных категорий</Typography>
        ) : (
          <Box className={styles.categoriesContainer}>
            <CategoryGrid categories={rootCategories} />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ProductCatalog;
