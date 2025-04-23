import { BaseUser } from "./user";

export type EntityType = "product" | "category" | "user";

/**
 * Базовая сущность для форм и UI-компонентов
 */
export interface BaseEntity {
  id: string;
  name: string;
  image: string;
}

/**
 * UI-представление продукта для компонентов форм
 */
export interface Product extends BaseEntity {
  price: number;
  description: string;
  categoryId: string;
}

/**
 * UI-представление категории для компонентов форм
 */
export interface Category extends BaseEntity {
  parentId?: string;
}

/**
 * UI-представление пользователя для компонентов форм
 */
export interface User extends BaseEntity, BaseUser {
  email: string;
  role: "admin" | "user";
}
