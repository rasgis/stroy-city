import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Grid } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchProducts, selectFilteredProducts } from "../../reducers/products";
import {
  SearchBar,
  Loader,
  ProductCard,
  Breadcrumbs,
  PaginationBlock,
  ErrorMessage,
} from "../../components";
import { scrollToTop } from "../../utils/scroll";
import { ROUTES } from "../../constants/routes";
import styles from "./AllProducts.module.css";
import { Product } from "../../types";

const ITEMS_PER_PAGE = 12;

const AllProducts: React.FC = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectFilteredProducts);
  const productsLoading = useAppSelector((state) => state.productsList.loading);
  const productsError = useAppSelector((state) => state.productsList.error);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts());
    scrollToTop();
  }, [dispatch]);

  useEffect(() => {
    if (products) {
      const filtered = products.filter((product: Product) =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
      setCurrentPage(1);
    }
  }, [products, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // --- Конец логики пагинации ---

  if (productsLoading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader message="Загрузка товаров..." />
      </div>
    );
  }

  if (productsError) {
    return (
      <Container className={styles.container}>
        <ErrorMessage message={productsError} />
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <Box className={styles.content}>
        <Breadcrumbs
          items={[
            {
              _id: "products",
              name: "Все товары",
              url: ROUTES.ALL_PRODUCTS,
            },
          ]}
          className={styles.breadcrumbs}
        />
        <SearchBar onSearch={handleSearch} loading={productsLoading} />

        {currentProducts.length === 0 ? (
          <ErrorMessage
            message={
              searchQuery
                ? "По вашему запросу товары не найдены."
                : "Нет доступных товаров."
            }
          />
        ) : (
          <>
            <Grid container spacing={3} className={styles.productGrid}>
              {currentProducts.map((product: Product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <ProductCard
                    product={product}
                    isAuthenticated={isAuthenticated}
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ width: "100%", mt: 4, mb: 4 }}>
              <PaginationBlock
                totalItems={filteredProducts.length}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default AllProducts;
