import React from "react";
import { MdSearchOff } from "react-icons/md";
import styles from "./NotFound.module.css";

interface NotFoundProps {
  message: string;
  className?: string;
}

const NotFound: React.FC<NotFoundProps> = ({ message, className }) => {
  return (
    <div className={`${styles.notFoundContainer} ${className || ""}`}>
      <MdSearchOff className={styles.notFoundIcon} />
      <div className={styles.notFoundText}>{message}</div>
    </div>
  );
};

export default NotFound;
