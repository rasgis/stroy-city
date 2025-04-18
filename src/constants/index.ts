export const API_URL = "http://localhost:3001/api";

export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  CART: "/cart",
  LOGIN: "/login",
  REGISTER: "/register",
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_PRODUCT_EDIT: "/admin/products/:id",
} as const;

export const SORT_OPTIONS = {
  PRICE_ASC: "price-asc",
  PRICE_DESC: "price-desc",
  NAME: "name",
} as const;

export const CATEGORIES = [
  "Цемент и бетон",
  "Кирпич и блоки",
  "Пиломатериалы",
  "Кровельные материалы",
  "Отделочные материалы",
  "Инструменты",
  "Крепежные материалы",
] as const;
