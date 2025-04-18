import React, { useState } from "react";
import { useAppDispatch } from "../../hooks";
import { removeFromCart, updateQuantity } from "../../reducers/cartSlice";
import { CartItem as CartItemType } from "../../types";
import { Modal } from "../Modal/Modal";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import styles from "./CartItem.module.css";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = () => {
    try {
      dispatch(removeFromCart(item._id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError("Ошибка при удалении товара из корзины");
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        setError("Количество товара должно быть больше 0");
        return;
      }

      if (item.stock && newQuantity > item.stock) {
        setError(`Максимальное количество товара: ${item.stock}`);
        return;
      }

      dispatch(updateQuantity({ _id: item._id, quantity: newQuantity }));
      setError(null);
    } catch (err) {
      setError("Ошибка при изменении количества товара");
    }
  };

  const getCategoryName = () => {
    if (typeof item.category === "string") {
      return item.category;
    }
    return item.category.name || "Без категории";
  };

  return (
    <>
      <div className={styles.cartItem}>
        <div className={styles.imageContainer}>
          <img
            src={item.image || "/placeholder-image.png"}
            alt={item.name}
            className={styles.image}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-image.png";
            }}
          />
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{item.name}</h3>
          <p className={styles.category}>{getCategoryName()}</p>
          <p className={styles.price}>{item.price} ₽</p>
          {error && <p className={styles.error}>{error}</p>}
        </div>
        <div className={styles.quantity}>
          <button
            className={styles.quantityButton}
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <RemoveIcon />
          </button>
          <span className={styles.quantityValue}>{item.quantity}</span>
          <button
            className={styles.quantityButton}
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.stock ? item.quantity >= item.stock : false}
          >
            <AddIcon />
          </button>
        </div>
        <button
          className={styles.removeButton}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <DeleteIcon />
        </button>
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
        <p>Это действие нельзя будет отменить.</p>
      </Modal>
    </>
  );
};
