import React, { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { removeFromCart, updateQuantity } from "../../reducers/cartSlice";
import { CartItem as CartItemType } from "../../types";
import { Modal } from "../Modal/Modal";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { selectFilteredCategories } from "../../reducers/categories";
import styles from "./CartItem.module.css";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categories = useAppSelector(selectFilteredCategories);

  const handleRemove = useCallback(() => {
    dispatch(removeFromCart(item._id));
    setIsDeleteModalOpen(false);
  }, [dispatch, item._id]);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity <= 0) {
      setError("Мин. кол-во: 1");
      return;
    }

    if (item.stock && newQuantity > item.stock) {
      setError(`Макс: ${item.stock}`);
      return;
    }

    dispatch(updateQuantity({ _id: item._id, quantity: newQuantity }));
    setError(null);
  }, [dispatch, item._id, item.stock]);

  const getCategoryName = useCallback(() => {
    if (!item.category) return "Без категории";

    if (typeof item.category === "string") {
      const foundCategory = categories.find(cat => cat._id === item.category);
      return foundCategory ? foundCategory.name : "";
    }

    return item.category.name || "";
  }, [item.category, categories]);

  const itemTotal = item.price * item.quantity;

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <img
            src={item.image || "/placeholder-image.png"}
            alt={item.name}
            className={styles.image}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-image.png";
            }}
          />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{item.name}</h3>
          <div className={styles.category}>{getCategoryName()}</div>
          
          <div className={styles.priceContainer}>
            <div className={styles.price}>{item.price} ₽</div>
            <div className={styles.total}>{itemTotal} ₽</div>
          </div>
          
          {error && <p className={styles.error}>{error}</p>}
          
          <div className={styles.actions}>
            <div className={styles.quantity}>
              <button
                className={styles.quantityButton}
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label="Уменьшить"
              >
                <RemoveIcon fontSize="small" />
              </button>
              <span className={styles.quantityValue}>{item.quantity}</span>
              <button
                className={styles.quantityButton}
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.stock ? item.quantity >= item.stock : false}
                aria-label="Увеличить"
              >
                <AddIcon fontSize="small" />
              </button>
            </div>
            
            <button
              className={styles.removeButton}
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label="Удалить"
            >
              <DeleteIcon className={styles.removeIcon} />
              <span>Удалить</span>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Удаление товара"
        type="delete"
        onConfirm={handleRemove}
        confirmText="Удалить"
      >
        <p>Вы действительно хотите удалить товар "{item.name}" из корзины?</p>
      </Modal>
    </>
  );
};
