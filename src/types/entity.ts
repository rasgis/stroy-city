import { BaseUser } from "./user";

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

export interface User extends BaseEntity, BaseUser {
  email: string;
  role: "admin" | "user";
}
