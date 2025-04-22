import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCategories,
  selectFilteredCategories,
} from "../../reducers/categories";
import { CategoryGrid, Loader, Breadcrumbs } from "../../components";
import { categoryService } from "../../services/categoryService";
import { ROUTES } from "../../constants/routes";
import { scrollToTop } from "../../utils/scroll";
import { MdError } from "react-icons/md";
import styles from "./ProductCatalog.module.css";

const ProductCatalog: React.FC = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectFilteredCategories);
  const categoriesLoading = useAppSelector(
    (state) => state.categoriesList.loading
  );
  const categoriesError = useAppSelector((state) => state.categoriesList.error);

  useEffect(() => {
    dispatch(fetchCategories());
    scrollToTop();
  }, [dispatch]);

  if (categoriesLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs
          items={[
            {
              _id: "catalog",
              name: "Каталог товаров",
              url: ROUTES.CATALOG,
            },
          ]}
        />
        <h1 className={styles.title}>Каталог товаров</h1>
        <div className={styles.loading}>
          <Loader message="Загрузка категорий..." />
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className={styles.container}>
        <Breadcrumbs
          items={[
            {
              _id: "catalog",
              name: "Каталог товаров",
              url: ROUTES.CATALOG,
            },
          ]}
        />
        <h1 className={styles.title}>Каталог товаров</h1>
        <div className={styles.error}>
          <MdError className={styles.errorIcon} />
          <div>{categoriesError}</div>
        </div>
      </div>
    );
  }

  const rootCategories = categoryService.buildFullCategoryTree(categories);

  return (
    <div className={styles.container}>
      <Breadcrumbs
        items={[
          {
            _id: "catalog",
            name: "Каталог товаров",
            url: ROUTES.CATALOG,
          },
        ]}
      />

      <h1 className={styles.title}>Каталог товаров</h1>

      {rootCategories.length === 0 ? (
        <div className={styles.error}>
          <p>Нет доступных категорий</p>
        </div>
      ) : (
        <div className={styles.categories}>
          <CategoryGrid categories={rootCategories} />
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
