import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaTrash, FaShoppingBag } from "react-icons/fa";
import { useAppSelector, useAppDispatch } from "../../hooks";
import {
  clearCart,
  removeFromCart,
  updateQuantity,
} from "../../reducers/cartSlice";
import { CartItem, Button } from "../../components";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Modal } from "../../components/Modal/Modal";
import { ROUTES } from "../../constants/routes";
import { scrollToTop } from "../../utils/scroll";
import { formatCurrency } from "../../utils/formatCurrency";
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

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ _id: id, quantity }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Breadcrumbs
          items={[
            {
              _id: "cart",
              name: "Корзина",
              url: ROUTES.CART,
            },
          ]}
          className={styles.breadcrumbs}
        />

        <div className={styles.cart}>
          <h1 className={styles.title}>Корзина</h1>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <FaShoppingCart className={styles.emptyIcon} />
              <h2>Корзина пуста</h2>
              <p>Добавьте товары в корзину, чтобы оформить заказ</p>
            </div>
          ) : (
            <>
              <div className={styles.cartGrid}>
                {cartItems.map((item) => (
                  <div key={item._id} className={styles.cartItem}>
                    <CartItem
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                      maxQuantity={item.stock || 10}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.cartSummary}>
                <div className={styles.total}>
                  <span>Итого:</span>
                  <span className={styles.totalAmount}>
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className={styles.actions}>
                  <Button
                    type="delete"
                    icon={<FaTrash />}
                    onClick={() => setIsDeleteModalOpen(true)}
                    className={styles.clearButton}
                    title="Очистить корзину"
                  >
                    Очистить корзину
                  </Button>
                  <Button
                    type="primary"
                    icon={<FaShoppingBag />}
                    className={styles.checkoutButton}
                    title="Оформить заказ"
                  >
                    Оформить заказ
                  </Button>
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
