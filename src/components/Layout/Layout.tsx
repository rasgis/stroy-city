import React, { memo } from "react";
import PropTypes from "prop-types";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import { ScrollTop } from "../ScrollTop/ScrollTop";
import { useLocationEffect } from "../../hooks/useLocationEffect";
import { scrollToTop } from "../../utils/scroll";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  // Использование хука для прокрутки страницы вверх при изменении маршрута
  useLocationEffect(scrollToTop);

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
      <ScrollTop />
    </div>
  );
});

Layout.propTypes = {
  children: PropTypes.node.isRequired as React.Validator<React.ReactNode>,
};

export default Layout;
