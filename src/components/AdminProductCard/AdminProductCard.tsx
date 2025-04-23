import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../../components";
import { Product } from "../../types/product";
import { ProductDisplay } from "../ProductDisplay/ProductDisplay";
import styles from "./AdminProductCard.module.css";

interface AdminProductCardProps {
  product: Product;
  categoryName: string;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const AdminProductCard: React.FC<AdminProductCardProps> = ({
  product,
  categoryName,
  onEdit,
  onDelete,
}) => {
  const cardActions = (
    <div className={styles.cardActions}>
      <Button
        variant="warning"
        startIcon={<FaEdit />}
        onClick={() => onEdit(product)}
        className={styles.editButton}
      >
        Изменить
      </Button>
      <Button
        variant="danger"
        startIcon={<FaTrash />}
        onClick={() => onDelete(product._id)}
        className={styles.deleteButton}
      >
        Удалить
      </Button>
    </div>
  );

  return (
    <ProductDisplay
      product={product}
      categoryName={categoryName}
      variant="adminCard"
      className={styles.adminProductCard}
    >
      {cardActions}
    </ProductDisplay>
  );
};
