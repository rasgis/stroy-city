import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCategories, selectFilteredCategories } from "../../reducers/categories";
import { CategoryGrid, Loader, Breadcrumbs } from "../../components";
import { categoryService } from "../../services/categoryService";
import { ROUTES } from "../../constants/routes";
import { scrollToTop } from "../../utils/scroll";
import styles from "./ProductCatalog.module.css";

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
      <div className={styles.container}>
        <Loader message="Загрузка категорий..." />
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{categoriesError}</div>
      </div>
    );
  }

  const rootCategories = categoryService.buildFullCategoryTree(categories);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Breadcrumbs 
          items={[
            {
              _id: "catalog",
              name: "Каталог товаров",
              url: ROUTES.CATALOG
            }
          ]}
          className={styles.breadcrumbs}
        />
        
        <h1 className={styles.title}>
          Каталог товаров
        </h1>

        {rootCategories.length === 0 ? (
          <p className={styles.emptyMessage}>Нет доступных категорий</p>
        ) : (
          <div className={styles.categoriesContainer}>
            <CategoryGrid categories={rootCategories} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
