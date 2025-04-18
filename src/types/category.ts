export interface Category {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  isActive?: boolean;
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export interface CategoryFormData {
  name: string;
  description?: string;
  image?: string | File;
  parentId?: string;
  isActive?: boolean;
}
