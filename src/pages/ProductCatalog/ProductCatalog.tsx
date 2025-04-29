import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCategories,
  selectAllCategories,
} from "../../reducers/categories";
import { CategoryGrid, Loader, Breadcrumbs } from "../../components";
import { categoryService } from "../../services/categoryService";
import { ROUTES } from "../../constants/routes";
import { scrollToTop } from "../../utils/scroll";
import { MdError } from "react-icons/md";
import styles from "./ProductCatalog.module.css";
import { useNavigate } from "react-router-dom";
import { Category } from "../../types";

const ProductCatalog: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const categories = useAppSelector(selectAllCategories);
  const categoriesLoading = useAppSelector(
    (state) => state.categoriesList.loading
  );
  const categoriesError = useAppSelector((state) => state.categoriesList.error);

  useEffect(() => {
    dispatch(fetchCategories());
    scrollToTop();
  }, [dispatch]);

  const handleCategoryClick = (category: Category) => {
    navigate(ROUTES.CATEGORY.replace(":categoryId", category._id));
  };

  if (categoriesLoading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader message="Загрузка категорий..." />
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
          <CategoryGrid
            categories={rootCategories}
            showChildren={false}
            onCategoryClick={handleCategoryClick}
          />
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
