import React, { useState, useEffect, useCallback } from 'react';
import styles from './SearchBar.module.css';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(({ 
  onSearch,
  placeholder = 'Поиск...',
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Используем useCallback для мемоизации функций-обработчиков
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsTyping(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setIsTyping(false);
    onSearch('');
  }, [onSearch]);

  // Функция для рендеринга кнопки очистки
  const renderClearButton = () => {
    if (!searchQuery) return null;
    return (
      <button 
        className={styles.clearButton} 
        onClick={handleClearSearch}
        type="button"
        aria-label="Очистить поиск"
        title="Очистить поиск"
      >
        <svg className={styles.clearIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    );
  };

  // Функция для рендеринга индикатора загрузки
  const renderLoadingIndicator = () => {
    if (!isTyping && !loading) return null;
    
    return (
      <div className={styles.loadingIndicator}>
        <div className={styles.loadingDot}></div>
        <div className={styles.loadingDot}></div>
        <div className={styles.loadingDot}></div>
      </div>
    );
  };

  // Дебаунс поискового запроса
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery !== debouncedQuery) {
        setDebouncedQuery(searchQuery);
      }
      setIsTyping(false);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery, debouncedQuery]);

  // Отправляем родительскому компоненту запрос только после дебаунса
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchInputContainer}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          aria-label="Поле поиска"
        />
        {renderLoadingIndicator()}
        {renderClearButton()}
      </div>
    </div>
  );
}); 