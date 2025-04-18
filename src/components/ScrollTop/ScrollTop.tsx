import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { scrollToTop } from "../../utils/scroll";
import styles from "./ScrollTop.module.css";

export const ScrollTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      className={`${styles.scrollTopButton} ${isVisible ? styles.visible : ""}`}
      onClick={scrollToTop}
      aria-label="Прокрутить вверх"
    >
      <FaArrowUp />
    </button>
  );
};
