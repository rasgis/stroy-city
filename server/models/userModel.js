import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Схема пользователя в MongoDB
 *
 * @typedef {Object} User
 * @property {string} name - Имя пользователя
 * @property {string} email - Email пользователя (уникальный)
 * @property {string} login - Логин пользователя (уникальный)
 * @property {string} password - Хешированный пароль пользователя
 * @property {string} role - Роль пользователя ("user" или "admin")
 * @property {Date} createdAt - Дата создания записи
 * @property {Date} updatedAt - Дата последнего обновления записи
 */
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Имя обязательно"],
    },
    email: {
      type: String,
      required: [true, "Email обязателен"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Пожалуйста, укажите корректный email"],
    },
    login: {
      type: String,
      required: [true, "Логин обязателен"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Пароль обязателен"],
      minlength: [6, "Пароль должен быть не менее 6 символов"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Middleware хеширования пароля перед сохранением
 * Срабатывает только при изменении пароля
 */
userSchema.pre("save", async function (next) {
  // Если пароль не был изменен, пропускаем хеширование
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Метод для проверки соответствия пароля хэшу
 *
 * @param {string} enteredPassword - Введенный пароль для проверки
 * @returns {Promise<boolean>} - Результат проверки
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("[User Model] Ошибка сравнения паролей:", error);
    return false;
  }
};

const User = mongoose.model("User", userSchema);

export default User;
