import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Название категории обязательно"],
      unique: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      required: [true, "Изображение категории обязательно"],
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
