import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import styles from "./styles.module.css";

const AccessDenied: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>403</h1>
      <h2>Доступ запрещен</h2>
      <p>У вас нет прав для доступа к этой странице.</p>
      <Link to={ROUTES.HOME} className={styles.link}>
        Вернуться на главную
      </Link>
    </div>
  );
};

export default AccessDenied;
