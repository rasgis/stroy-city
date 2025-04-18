import * as Yup from "yup";
import { EntityType } from "./types";

export const getValidationSchema = (
  entityType: EntityType,
  isEdit: boolean = false
) => {
  const baseSchemas = {
    product: Yup.object({
      name: Yup.string().required("Название обязательно"),
      description: Yup.string().required("Описание обязательно"),
      price: Yup.number()
        .required("Цена обязательна")
        .min(0, "Цена не может быть отрицательной"),
      categoryId: Yup.string().required("Категория обязательна"),
      image: Yup.string().required("URL изображения обязателен"),
      unitOfMeasure: Yup.string().required("Единица измерения обязательна"),
    }),
    category: Yup.object({
      name: Yup.string().required("Название категории обязательно"),
      description: Yup.string(),
      image: Yup.string().required("URL изображения обязателен"),
      parentId: Yup.string(),
    }),
    user: Yup.object({
      name: Yup.string()
        .required("Имя обязательно")
        .min(2, "Минимум 2 символа"),
      email: Yup.string()
        .email("Введите корректный email")
        .required("Email обязателен"),
      login: Yup.string()
        .required("Логин обязателен")
        .min(3, "Минимум 3 символа")
        .matches(/^[a-zA-Z0-9_]+$/, "Только буквы, цифры и подчеркивание"),
      password: isEdit
        ? Yup.string().min(6, "Минимум 6 символов").nullable()
        : Yup.string()
            .required("Пароль обязателен")
            .min(6, "Минимум 6 символов"),
      role: Yup.string().required("Роль обязательна"),
    }),
  };

  return baseSchemas[entityType];
};
