import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { productService } from "../../../services/productService";
import {
  fetchCategories,
  selectFilteredCategories,
} from "../../../reducers/categories";
import { ProductFormData } from "../../../types/product";
import { Loader } from "../../../components";
import ProductForm from "./ProductForm";
import styles from "./Admin.module.css";

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectFilteredCategories);
  const categoriesLoading = useAppSelector(
    (state) => state.categoriesList.loading
  );

  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, categoriesLoading]);

  const handleSubmit = async (productData: ProductFormData) => {
    try {
      await productService.createProduct(productData);
      navigate(ROUTES.ADMIN.PRODUCTS);
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Ошибка при создании продукта");
    }
  };

  if (categoriesLoading) {
    return <Loader message="Загрузка категорий..." />;
  }

  const emptyProduct = {
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    unitOfMeasure: "шт",
    stock: 0,
    isActive: true,
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Создание нового товара</h2>
      <ProductForm
        initialValues={emptyProduct}
        onSubmit={handleSubmit}
        categories={categories}
      />
    </div>
  );
};

export default ProductCreate;
