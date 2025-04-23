import React, { useState, useCallback, useMemo } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { CartItem as CartItemType } from "../../types";
import { formatCurrency } from "../../utils/formatCurrency";
import { handleImageError } from "../../utils/imageUtils";
import { Button } from "../";
import { BaseCard } from "../BaseCard";
import styles from "./CartItem.module.css";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  maxQuantity?: number;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  maxQuantity = 10,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleIncrement = useCallback(() => {
    if (!onUpdateQuantity) return;

    if (item.quantity < maxQuantity) {
      setError(null);
      onUpdateQuantity(item._id, item.quantity + 1);
    } else {
      setError(`Максимальное количество: ${maxQuantity}`);
      // Автоматически скрыть ошибку через 3 секунды
      setTimeout(() => setError(null), 3000);
    }
  }, [item._id, item.quantity, maxQuantity, onUpdateQuantity]);

  const handleDecrement = useCallback(() => {
    if (!onUpdateQuantity) return;

    if (item.quantity > 1) {
      setError(null);
      onUpdateQuantity(item._id, item.quantity - 1);
    }
  }, [item._id, item.quantity, onUpdateQuantity]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(item._id);
    }
  }, [item._id, onRemove]);

  const totalPrice = useMemo(() => {
    return item.price * item.quantity;
  }, [item.price, item.quantity]);

  const footer = (
    <div className={styles.actions}>
      <div className={styles.quantity}>
        <Button
          variant="secondary"
          size="small"
          startIcon={<FaMinus size={16} />}
          onClick={handleDecrement}
          disabled={item.quantity <= 1 || !onUpdateQuantity}
          title="Уменьшить количество"
          className={styles.quantityButton}
        />

        <span className={styles.quantityValue}>{item.quantity}</span>

        <Button
          variant="secondary"
          size="small"
          startIcon={<FaPlus size={16} />}
          onClick={handleIncrement}
          disabled={item.quantity >= maxQuantity || !onUpdateQuantity}
          title="Увеличить количество"
          className={styles.quantityButton}
        />
      </div>

      <Button
        variant="danger"
        size="medium"
        startIcon={<FaTrash size={14} />}
        onClick={handleRemove}
        disabled={!onRemove}
        title="Удалить из корзины"
        className={styles.removeButton}
      >
        Удалить
      </Button>
    </div>
  );

  return (
    <BaseCard
      variant="cart"
      title={item.name}
      image={item.image || "/placeholder-image.png"}
      imageAlt={item.name}
      fallbackImage="/placeholder-image.png"
      footer={footer}
    >
      <div className={styles.priceContainer}>
        <div className={styles.price}>
          {formatCurrency(item.price)} × {item.quantity}
        </div>
        <div className={styles.total}>{formatCurrency(totalPrice)}</div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </BaseCard>
  );
};
