export type EntityType = "product" | "category" | "user";

export interface BaseEntity {
  id: string;
  name: string;
  image: string;
}

export interface Product extends BaseEntity {
  price: number;
  description: string;
  categoryId: string;
}

export interface Category extends BaseEntity {
  parentId?: string;
}

export interface User extends BaseEntity {
  email: string;
  role: "admin" | "user";
}
