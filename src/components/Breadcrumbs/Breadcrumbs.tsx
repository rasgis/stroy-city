import React from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumbs as MuiBreadcrumbs,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { ROUTES } from "../../constants/routes";
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
    <MuiBreadcrumbs 
      aria-label="breadcrumb" 
      className={`${styles.breadcrumbs} ${className || ""}`}
    >
      {showHome && (
        <MuiLink
          component={Link}
          to={ROUTES.HOME}
          className={styles.breadcrumbLink}
        >
          <HomeIcon style={{ marginRight: "4px", fontSize: 18 }} />
          Главная
        </MuiLink>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return isLast ? (
          <Typography
            key={item._id}
            className={styles.breadcrumbActive}
          >
            {item.name}
          </Typography>
        ) : (
          <MuiLink
            key={item._id}
            component={Link}
            to={item.url}
            className={styles.breadcrumbLink}
          >
            {item.name}
          </MuiLink>
        );
      })}
    </MuiBreadcrumbs>
  );
}; 