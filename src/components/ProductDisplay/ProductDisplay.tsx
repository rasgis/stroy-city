import React, { ReactNode } from "react";
import { BaseCard } from "../BaseCard";
import { Product } from "../../types/product";
import { formatCurrency } from "../../utils/formatCurrency";
import styles from "./ProductDisplay.module.css";

export interface ProductDisplayProps {
  /**
   * Объект товара для отображения
   */
  product: Product;

  /**
   * Название категории товара
   */
  categoryName: string;

  /**
   * Вариант отображения карточки
   */
  variant?: "product" | "adminCard";

  /**
   * Ссылка для перехода при клике
   */
  linkTo?: string;

  /**
   * Обработчик клика на карточку
   */
  onClick?: (e: React.MouseEvent) => void;

  /**
   * Футер карточки
   */
  footer?: ReactNode;

  /**
   * Дополнительные элементы в заголовке
   */
  headerActions?: ReactNode;

  /**
   * Дополнительные CSS классы
   */
  className?: string;

  /**
   * Форматтер цены
   */
  priceFormatter?: (price: number, unitOfMeasure: string) => string;

  /**
   * Дополнительный контент внутри карточки
   */
  children?: ReactNode;
}

export const ProductDisplay: React.FC<ProductDisplayProps> = ({
  product,
  categoryName,
  variant = "product",
  linkTo,
  onClick,
  footer,
  headerActions,
  className,
  priceFormatter,
  children,
}) => {
  // Используем переданный форматтер или дефолтный на основе formatCurrency
  const displayPrice = priceFormatter
    ? priceFormatter(product.price, product.unitOfMeasure)
    : `${formatCurrency(product.price)} / ${product.unitOfMeasure}`;

  return (
    <BaseCard
      variant={variant}
      title={product.name}
      image={product.image}
      imageAlt={product.name}
      linkTo={linkTo}
      onClick={onClick}
      footer={footer}
      headerActions={headerActions}
      className={className}
    >
      <div className={styles.content}>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.category}>{categoryName || "Без категории"}</div>
        <div className={styles.price}>{displayPrice}</div>
        {children}
      </div>
    </BaseCard>
  );
};
