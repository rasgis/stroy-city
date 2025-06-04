import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCategories,
  selectAllCategories,
} from "../../reducers/categories";
import { fetchProducts, selectFilteredProducts } from "../../reducers/products";
import {
  Loader,
  ProductCard,
  SearchBar,
  Breadcrumbs,
  CategoryGrid,
  PaginationBlock,
} from "../../components";
import { ROUTES } from "../../constants/routes";
import { Category, Product } from "../../types";
import { categoryService } from "../../services/categoryService";
import { scrollToTop } from "../../utils/scroll";
import styles from "./CategoryPage.module.css";
import { BsExclamationCircle } from "react-icons/bs";

const ITEMS_PER_PAGE = 20;

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useAppSelector(selectAllCategories);
  const categoriesLoading = useAppSelector(
    (state) => state.categoriesList.loading
  );
  const categoriesError = useAppSelector((state) => state.categoriesList.error);

  const products = useAppSelector(selectFilteredProducts);
  const productsLoading = useAppSelector((state) => state.productsList.loading);
  const productsError = useAppSelector((state) => state.productsList.error);

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchCategories());
      dispatch(fetchProducts());
      scrollToTop();
    }
  }, [dispatch, categoryId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  if (categoriesLoading || productsLoading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader message="Загрузка категории и товаров..." />
      </div>
    );
  }

  if (categoriesError || productsError) {
    return (
      <Container className={styles.container}>
        <Typography color="error">
          {categoriesError || productsError}
        </Typography>
      </Container>
    );
  }

  const currentCategory = categories.find(
    (category: Category) => category._id === categoryId
  );

  const categoryPath = categoryService.getCategoryPath(
    categories,
    categoryId || ""
  );

  const subcategories = categories.filter(
    (category: Category) =>
      category.parentId === categoryId && category.isActive !== false
  );

  const getAllSubcategoryIds = (parentCategoryId: string): string[] => {
    const directSubcategories = categories.filter(
      (category) =>
        category.parentId === parentCategoryId && category.isActive !== false
    );

    if (directSubcategories.length === 0) {
      return [parentCategoryId];
    }

    const allSubcategoryIds = directSubcategories.flatMap((subcat) =>
      getAllSubcategoryIds(subcat._id)
    );

    return [parentCategoryId, ...allSubcategoryIds];
  };

  const allCategoryIds = getAllSubcategoryIds(categoryId || "");

  const categoryProducts = products.filter((product: Product) => {
    const productCategoryId =
      typeof product.category === "object" && product.category !== null
        ? product.category._id
        : product.category;

    return allCategoryIds.includes(productCategoryId);
  });

  const filteredProducts = categoryProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <Container className={styles.container}>
      <Box className={styles.content}>
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
          ]}
          className={styles.breadcrumbs}
        />

        {currentCategory && currentCategory.description && (
          <Box className={styles.description}>
            <Typography variant="body1" className={styles.descriptionText}>
              {currentCategory.description}
            </Typography>
          </Box>
        )}

        {subcategories.length > 0 && (
          <Box className={styles.section}>
            <Typography
              variant="h5"
              component="h2"
              className={styles.sectionTitle}
            >
              Подкатегории
            </Typography>
            <Box className={styles.categoriesContainer}>
              <CategoryGrid
                categories={subcategories}
                showChildren={false}
                onCategoryClick={(category) => {
                  navigate(
                    ROUTES.CATEGORY.replace(":categoryId", category._id)
                  );
                  scrollToTop();
                }}
              />
            </Box>
          </Box>
        )}

        {categoryProducts.length > 0 && (
          <Box className={styles.section}>
            <Typography
              variant="h5"
              component="h2"
              className={styles.sectionTitle}
            >
              Товары в категории
            </Typography>
            <Box className={styles.searchBarContainer}>
              <SearchBar
                onSearch={handleSearch}
                placeholder="Поиск товаров в этой категории..."
                loading={productsLoading}
              />
            </Box>
            <div className={styles.productGrid}>
              {currentProducts.map((product: Product) => (
                <div key={product._id} className={styles.productGridItem}>
                  <ProductCard
                    product={product}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && searchQuery && (
              <Typography className={styles.noResults}>
                По вашему запросу ничего не найдено
              </Typography>
            )}

            <Box
              sx={{
                width: "100%",
                mt: 4,
              }}
            >
              <PaginationBlock
                totalItems={filteredProducts.length}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </Box>
          </Box>
        )}

        {categoryProducts.length === 0 && (
          <div className={styles.emptyMessage}>
            <BsExclamationCircle size={32} style={{ marginBottom: "1rem" }} />
            <Typography>В данной категории пока нет товаров</Typography>
            <Link to={ROUTES.CATALOG} className={styles.returnLink}>
              Вернуться в каталог
            </Link>
          </div>
        )}
      </Box>
    </Container>
  );
};

export default CategoryPage;
