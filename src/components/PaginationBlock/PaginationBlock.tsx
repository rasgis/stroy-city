import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Pagination as MuiPagination } from "@mui/material";
import { scrollToTop } from "../../utils/scroll";

interface PaginationBlockProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  autoScrollTop?: boolean;
}

export const PaginationBlock: React.FC<PaginationBlockProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  autoScrollTop = true,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (autoScrollTop) {
      scrollToTop();
    }
    onPageChange(page);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        margin: "30px 0",
        padding: "16px",
        backgroundColor: "var(--background-card)",
        borderRadius: "10px",
        boxShadow: "var(--card-shadow)",
        border: "1px solid var(--border-color)",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          marginBottom: "12px",
          color: "var(--text-primary)",
          fontSize: "0.9rem",
          opacity: 0.8,
        }}
      >
        Всего {totalItems} товаров / Страница {currentPage} из {totalPages}
      </Typography>

      <Stack spacing={2}>
        <MuiPagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          shape="rounded"
          size="large"
          showFirstButton
          showLastButton
          sx={{
            "& .MuiPaginationItem-root": {
              color: "var(--accent-primary)",
              borderColor: "var(--accent-primary)",
              backgroundColor: "var(--background-tertiary)",
              margin: "0 4px",
              minWidth: "36px",
              height: "36px",
              fontWeight: 500,
              fontSize: "1rem",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "var(--accent-focus)",
                borderColor: "var(--accent-primary)",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              },
              "&.Mui-selected": {
                backgroundColor: "var(--button-background)",
                color: "var(--button-text)",
                fontWeight: 700,
                transform: "scale(1.1)",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                "&:hover": {
                  backgroundColor: "var(--button-hover)",
                  opacity: 0.9,
                },
              },
            },
            "& .MuiPaginationItem-icon": {
              color: "var(--accent-primary)",
              fontSize: "1.5rem",
            },
          }}
        />
      </Stack>
    </Box>
  );
};
