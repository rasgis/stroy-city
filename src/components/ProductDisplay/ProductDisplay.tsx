import React, { ReactNode } from "react";
import { BaseCard } from "../BaseCard";
import { Product } from "../../types/product";
import { formatCurrency } from "../../utils/formatCurrency";
import styles from "./ProductDisplay.module.css";

export interface ProductDisplayProps {
  product: Product;
  categoryName: string;
  variant?: "product" | "adminCard";
  linkTo?: string;
  onClick?: (e: React.MouseEvent) => void;
  footer?: ReactNode;
  headerActions?: ReactNode;
  className?: string;
  priceFormatter?: (price: number, unitOfMeasure: string) => string;
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
