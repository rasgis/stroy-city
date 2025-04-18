import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import styles from "./Loader.module.css";

interface LoaderProps {
  message?: string;
  size?: number;
}

export const Loader: React.FC<LoaderProps> = ({
  message = "Загрузка...",
  size = 60,
}) => {
  return (
    <Box className={styles.loaderContainer}>
      <div className={styles.loaderWrapper}>
        <CircularProgress
          size={size}
          thickness={4}
          className={styles.spinner}
        />
        <Typography variant="body1" className={styles.message}>
          {message}
        </Typography>
      </div>
    </Box>
  );
};
