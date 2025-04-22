import React from "react";
import { MdError } from "react-icons/md";
import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <div className={`${styles.errorContainer} ${className || ""}`}>
      <MdError className={styles.errorIcon} />
      <div className={styles.errorText}>{message}</div>
    </div>
  );
};

export default ErrorMessage;
