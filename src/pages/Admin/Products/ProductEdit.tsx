import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { productService } from "../../../services/productService";
import {
  fetchCategories,
  selectFilteredCategories,
} from "../../../reducers/categories";
import { Loader } from "../../../components";
import ProductForm from "./ProductForm";
import { Product, ProductFormData } from "../../../types/product";
import styles from "./Admin.module.css";

const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = useAppSelector(selectFilteredCategories);
  const categoriesLoading = useAppSelector(
    (state) => state.categoriesList.loading
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (categories.length === 0 && !categoriesLoading) {
          await dispatch(fetchCategories());
        }

        if (id) {
          const fetchedProduct = await productService.getProductById(id);
          setProduct(fetchedProduct);
        }
      } catch (err) {
        console.error("Error loading product data:", err);
        setError("Не удалось загрузить данные продукта");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, id, categories.length, categoriesLoading]);

  const handleSubmit = async (updatedProduct: ProductFormData) => {
    try {
      if (!id) {
        throw new Error("ID продукта не найден");
      }

      await productService.updateProduct(id, updatedProduct);
      navigate(ROUTES.ADMIN.PRODUCTS);
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Ошибка при обновлении продукта");
    }
  };

  if (loading) {
    return <Loader message="Загрузка продукта..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!product) {
    return <div className={styles.notFound}>Продукт не найден</div>;
  }

  const productFormValues = {
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image || "",
    category:
      typeof product.category === "object"
        ? product.category._id
        : product.category,
    unitOfMeasure: product.unitOfMeasure,
    stock: product.stock || 0,
    isActive: product.isActive !== undefined ? product.isActive : true,
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Редактирование товара</h2>
      <ProductForm
        initialValues={productFormValues}
        onSubmit={handleSubmit}
        categories={categories}
      />
    </div>
  );
};

export default ProductEdit;
