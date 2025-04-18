export interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string | { _id: string; name?: string };
  unitOfMeasure: string;
  stock?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image: string | File;
  category: string;
  unitOfMeasure: string;
  stock?: number;
  isActive?: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}
