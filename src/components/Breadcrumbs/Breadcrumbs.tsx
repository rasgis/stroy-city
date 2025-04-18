import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { FaHome, FaChevronRight } from "react-icons/fa";
import styles from "./Breadcrumbs.module.css";

interface BreadcrumbItem {
  _id: string;
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className,
}) => {
  return (
    <nav aria-label="Навигационная цепочка" className={`${styles.breadcrumbs} ${className || ""}`}>
      <ul className={styles.breadcrumbsList}>
        {showHome && (
          <li className={styles.breadcrumbItem}>
            <Link to={ROUTES.HOME} className={styles.breadcrumbLink}>
              <FaHome className={styles.homeIcon} />
              <span>Главная</span>
            </Link>
            <FaChevronRight className={styles.separator} aria-hidden="true" />
          </li>
        )}
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item._id} className={styles.breadcrumbItem}>
              {isLast ? (
                <span className={styles.breadcrumbActive}>
                  {item.name}
                </span>
              ) : (
                <>
                  <Link to={item.url} className={styles.breadcrumbLink}>
                    {item.name}
                  </Link>
                  <FaChevronRight className={styles.separator} aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}; 