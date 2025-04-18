import { FieldOption } from "./types";

// Единицы измерения товаров
export const UNITS_OF_MEASURE: FieldOption[] = [
  { value: "шт", label: "Штуки" },
  { value: "м²", label: "Квадратные метры" },
  { value: "м³", label: "Кубические метры" },
  { value: "м", label: "Метры" },
  { value: "кг", label: "Килограммы" },
  { value: "т", label: "Тонны" },
  { value: "уп", label: "Упаковка" },
  { value: "рул", label: "Рулон" },
  { value: "лист", label: "Лист" },
  { value: "пал", label: "Паллета" },
  { value: "компл", label: "Комплект" },
];

// Роли пользователей
export const USER_ROLES: FieldOption[] = [
  { value: "user", label: "Пользователь" },
  { value: "admin", label: "Администратор" },
];

// Начальные значения для каждого типа сущности
export const INITIAL_VALUES = {
  name: "",
  description: "",
  image: "",
  price: 0,
  categoryId: "",
  parentId: "",
};
