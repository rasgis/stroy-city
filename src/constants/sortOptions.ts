/**
 * Константы для опций сортировки
 */
export const SORT_OPTIONS = {
  PRICE_ASC: "price-asc",
  PRICE_DESC: "price-desc",
  NAME: "name",
  NEWEST: "newest",
} as const;

/**
 * Тип для опций сортировки
 */
export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];
