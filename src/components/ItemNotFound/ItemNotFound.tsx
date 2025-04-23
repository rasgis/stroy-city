import React from "react";
import { MdSearchOff } from "react-icons/md";
import styles from "./ItemNotFound.module.css";

interface ItemNotFoundProps {
  message: string;
  className?: string;
}

const ItemNotFound: React.FC<ItemNotFoundProps> = ({ message, className }) => {
  return (
    <div className={`${styles.notFoundContainer} ${className || ""}`}>
      <MdSearchOff className={styles.notFoundIcon} />
      <div className={styles.notFoundText}>{message}</div>
    </div>
  );
};

export default ItemNotFound;
