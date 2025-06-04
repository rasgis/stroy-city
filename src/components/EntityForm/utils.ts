import { EntityType } from "./types";

export const getInitialValues = (entityType: EntityType, entityData?: any) => {
  if (!entityData) {
    if (entityType === "product") {
      return {
        name: "",
        description: "",
        image: "",
        price: 0,
        categoryId: "",
        unitOfMeasure: "шт",
      };
    }

    if (entityType === "category") {
      return {
        name: "",
        description: "",
        image: "",
        parentId: "",
      };
    }

    if (entityType === "user") {
      const initialValues = {
        name: "",
        email: "",
        login: "",
        password: "",
        role: "user",
      };
      return initialValues;
    }

    return {
      name: "",
      description: "",
      image: "",
    };
  }

  const baseValues = {
    name: entityData.name || "",
    description: entityData.description || "",
    image: entityData.image || "",
  };

  if (entityType === "product") {
    const productValues = {
      ...baseValues,
      price: entityData.price || 0,
      categoryId: "",
      unitOfMeasure: entityData.unitOfMeasure || "шт",
    };

    if (typeof entityData.category === "object" && entityData.category) {
      productValues.categoryId =
        entityData.category._id || entityData.category.id || "";
    } else {
      productValues.categoryId =
        entityData.categoryId || entityData.category || "";
    }

    return productValues;
  }

  if (entityType === "category") {
    return {
      ...baseValues,
      parentId: entityData.parentId || "",
    };
  }

  if (entityType === "user") {
    const userValues = {
      name: entityData.name || "",
      email: entityData.email || "",
      login: entityData.login || "",
      password: entityData.password || "",
      role: entityData.role === "admin" ? "admin" : "user",
      _id: entityData._id || entityData.id || "",
    };
    return userValues;
  }

  return baseValues;
};

export const getTitleByEntityType = (
  entityType: EntityType,
  entityData?: any
) => {
  const titles = {
    product: entityData ? "Редактировать товар" : "Добавить товар",
    category: entityData ? "Редактировать категорию" : "Добавить категорию",
    user: entityData ? "Редактировать пользователя" : "Добавить пользователя",
  };

  return titles[entityType];
};
