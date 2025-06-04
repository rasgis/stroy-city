export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "number"
    | "email"
    | "password"
    | "url"
    | "image";
  label: string;
  required: boolean;
  options?: FieldOption[];
}

export type EntityType = "product" | "category" | "user";

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  unitOfMeasure: string;
  id?: string;
  _id?: string;
}

export interface CategoryFormValues {
  name: string;
  description: string;
  image: string;
  parentId: string;
  id?: string;
  _id?: string;
}

export interface UserFormValues {
  name: string;
  email: string;
  login: string;
  password: string;
  role: "user" | "admin";
  _id?: string;
  id?: string;
}

export type FormValues =
  | ProductFormValues
  | CategoryFormValues
  | UserFormValues;

export interface EntityFormProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityData?: any; 
  afterSubmit?: () => void; 
}
