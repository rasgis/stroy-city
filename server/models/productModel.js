import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Название товара обязательно"],
    },
    description: {
      type: String,
      required: [true, "Описание товара обязательно"],
    },
    price: {
      type: Number,
      required: [true, "Цена товара обязательна"],
      default: 0,
    },
    image: {
      type: String,
      required: [true, "Изображение товара обязательно"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Категория товара обязательна"],
    },
    unitOfMeasure: {
      type: String,
      required: [true, "Единица измерения обязательна"],
      default: "шт",
    },
    stock: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
