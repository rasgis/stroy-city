import React, { useState, useEffect } from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { clearCart } from "../../reducers/cartSlice";
import { CartItem } from "../../components";
import { Modal } from "../../components/Modal/Modal";
import { scrollToTop } from "../../utils/scroll";
import styles from "./Cart.module.css";

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const total = useAppSelector((state) => state.cart.total);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    scrollToTop();
  }, []);

  const handleClearCart = () => {
    dispatch(clearCart());
    setIsDeleteModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.cart}>
          <h1 className={styles.title}>Корзина</h1>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingCartIcon className={styles.emptyIcon} />
              <h2>Корзина пуста</h2>
              <p>Добавьте товары в корзину, чтобы оформить заказ</p>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cartItems.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
              <div className={styles.cartSummary}>
                <div className={styles.total}>
                  <span>Итого:</span>
                  <span className={styles.totalAmount}>{total} ₽</span>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.clearButton}
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <DeleteIcon />
                    Очистить корзину
                  </button>
                  <button className={styles.checkoutButton}>
                    Оформить заказ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Очистка корзины"
        type="delete"
        onConfirm={handleClearCart}
        confirmText="Очистить"
      >
        <p>Вы действительно хотите очистить корзину?</p>
        <p>Это действие нельзя будет отменить.</p>
      </Modal>
    </div>
  );
};

export default Cart;
