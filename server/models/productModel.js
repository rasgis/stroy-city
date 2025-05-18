import mongoose from "mongoose";

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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
