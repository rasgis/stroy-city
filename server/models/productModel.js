import mongoose from "mongoose";

/**
 * Схема продукта в MongoDB
 *
 * @typedef {Object} Product
 * @property {string} name - Название продукта
 * @property {string} description - Описание продукта
 * @property {number} price - Цена продукта
 * @property {string} image - URL изображения продукта
 * @property {mongoose.Schema.Types.ObjectId} category - Ссылка на категорию продукта
 * @property {string} unitOfMeasure - Единица измерения продукта
 * @property {number} stock - Количество на складе
 * @property {boolean} isActive - Статус активности продукта
 * @property {number} rating - Рейтинг продукта (от 0 до 5)
 * @property {number} numReviews - Количество отзывов
 * @property {Date} createdAt - Дата создания записи
 * @property {Date} updatedAt - Дата последнего обновления записи
 */
const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Название продукта обязательно"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Описание продукта обязательно"],
    },
    price: {
      type: Number,
      required: [true, "Цена продукта обязательна"],
      default: 0,
      min: [0, "Цена не может быть отрицательной"],
    },
    image: {
      type: String,
      required: [true, "Изображение продукта обязательно"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Категория продукта обязательна"],
      ref: "Category",
    },
    unitOfMeasure: {
      type: String,
      required: [true, "Единица измерения обязательна"],
    },
    stock: {
      type: Number,
      required: [true, "Количество на складе обязательно"],
      default: 0,
      min: [0, "Количество не может быть отрицательным"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Минимальный рейтинг - 0"],
      max: [5, "Максимальный рейтинг - 5"],
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, "Количество отзывов не может быть отрицательным"],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
