import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { CircularProgress } from "@mui/material";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(({
  onSearch,
  placeholder = "Поиск товаров...",
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== "") {
        setIsTyping(false);
        onSearch(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setIsTyping(true);
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setIsTyping(false);
    onSearch("");
  }, [onSearch]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className={styles.searchContainer} role="search">
      {!isLoading && !isTyping ? (
        <FaSearch className={styles.searchIcon} aria-hidden="true" />
      ) : (
        <div className={styles.loadingIcon}>
          <CircularProgress size={20} color="inherit" />
        </div>
      )}
      <input
        type="search"
        className={styles.searchInput}
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label={placeholder}
        aria-busy={isLoading}
        autoComplete="off"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="Очистить поиск"
        >
          <FaTimes aria-hidden="true" />
        </button>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.onSearch === nextProps.onSearch && 
         prevProps.placeholder === nextProps.placeholder &&
         prevProps.isLoading === nextProps.isLoading;
});

export { SearchBar };
