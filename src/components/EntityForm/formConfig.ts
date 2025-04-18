import { FormField, EntityType } from "./types";
import { UNITS_OF_MEASURE, USER_ROLES } from "./constants";

// Поля для каждого типа сущности
export const ENTITY_FIELDS: Record<EntityType, FormField[]> = {
  product: [
    { name: "name", type: "text", label: "Название товара", required: true },
    {
      name: "description",
      type: "textarea",
      label: "Описание",
      required: true,
    },
    { name: "price", type: "number", label: "Цена", required: true },
    { name: "image", type: "url", label: "URL изображения", required: true },
    {
      name: "categoryId",
      type: "select",
      label: "Категория",
      required: true,
      options: [],
    },
    {
      name: "unitOfMeasure",
      type: "select",
      label: "Единица измерения",
      required: true,
      options: UNITS_OF_MEASURE,
    },
  ],
  category: [
    { name: "name", type: "text", label: "Название категории", required: true },
    {
      name: "description",
      type: "textarea",
      label: "Описание",
      required: false,
    },
    { name: "image", type: "url", label: "URL изображения", required: true },
    {
      name: "parentId",
      type: "select",
      label: "Родительская категория",
      required: false,
      options: [],
    },
  ],
  user: [
    { name: "name", type: "text", label: "Имя пользователя", required: true },
    { name: "email", type: "email", label: "Email", required: true },
    { name: "login", type: "text", label: "Логин", required: true },
    { name: "password", type: "password", label: "Пароль", required: true },
    {
      name: "role",
      type: "select",
      label: "Роль",
      required: true,
      options: USER_ROLES,
    },
  ],
};
