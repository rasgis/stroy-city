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
    event: React.ChangeEvent<unknown>,
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
        backgroundColor: "#1d1e24",
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(11, 224, 184, 0.2)",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          marginBottom: "12px",
          color: "#d4ffea",
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
              color: "#0be0b8",
              borderColor: "#0be0b8",
              backgroundColor: "#1a1a1f",
              margin: "0 4px",
              minWidth: "36px",
              height: "36px",
              fontWeight: 500,
              fontSize: "1rem",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(11, 224, 184, 0.1)",
                borderColor: "#0be0b8",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              },
              "&.Mui-selected": {
                backgroundColor: "#0be0b8",
                color: "#1a1a1f",
                fontWeight: 700,
                transform: "scale(1.1)",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                "&:hover": {
                  backgroundColor: "#0be0b8",
                  opacity: 0.9,
                },
              },
            },
            "& .MuiPaginationItem-icon": {
              color: "#0be0b8",
              fontSize: "1.5rem",
            },
          }}
        />
      </Stack>
    </Box>
  );
};
