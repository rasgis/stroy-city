import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaTrash, FaTelegram } from "react-icons/fa";
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
  const [isItemDeleteModalOpen, setIsItemDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemNameToDelete, setItemNameToDelete] = useState<string | null>(null);

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

  const handleRemoveItemRequest = (id: string, name: string) => {
    setItemToDelete(id);
    setItemNameToDelete(name);
    setIsItemDeleteModalOpen(true);
  };

  const handleRemoveItem = () => {
    if (itemToDelete) {
      dispatch(removeFromCart(itemToDelete));
      setIsItemDeleteModalOpen(false);
      setItemToDelete(null);
      setItemNameToDelete(null);
    }
  };

  const handleContactManager = () => {
    window.open("https://t.me", "_blank");
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

          <div className={styles.infoNote}>
            <p>
              Корзина носит информативный характер для расчета приблизительной
              стоимости товаров. Для получения точного расчета и оформления
              заказа, пожалуйста, свяжитесь с нашим специалистом.
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <FaShoppingCart className={styles.emptyIcon} />
              <h2>Корзина пуста</h2>
              <p>Добавьте товары в корзину, чтобы рассчитать стоимость</p>
            </div>
          ) : (
            <>
              <div className={styles.cartGrid}>
                {cartItems.map((item) => (
                  <div key={item._id} className={styles.cartItem}>
                    <CartItem
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={(id) => handleRemoveItemRequest(id, item.name)}
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
                <p className={styles.priceNote}>
                  * Указанная цена является ориентировочной. Окончательная
                  стоимость будет рассчитана нашим менеджером.
                </p>
                <div className={styles.actions}>
                  <Button
                    variant="danger"
                    startIcon={<FaTrash />}
                    onClick={() => setIsDeleteModalOpen(true)}
                    className={styles.clearButton}
                    title="Очистить корзину"
                  >
                    Очистить корзину
                  </Button>
                  <Button
                    variant="primary"
                    startIcon={<FaTelegram />}
                    className={styles.contactButton}
                    title="Связаться с менеджером"
                    onClick={handleContactManager}
                  >
                    Связаться с менеджером
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

      <Modal
        isOpen={isItemDeleteModalOpen}
        onClose={() => setIsItemDeleteModalOpen(false)}
        title="Удаление товара"
        type="delete"
        onConfirm={handleRemoveItem}
        confirmText="Удалить"
      >
        <p>Вы действительно хотите удалить этот товар из корзины?</p>
      </Modal>
    </div>
  );
};

export default Cart;
