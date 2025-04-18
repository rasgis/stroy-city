import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import styles from "./styles.module.css";

const NotFound: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>Извините, запрашиваемая страница не существует.</p>
      <Link to={ROUTES.HOME} className={styles.link}>
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;
