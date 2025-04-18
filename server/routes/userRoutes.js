import express from "express";
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/users - регистрация нового пользователя
router.post("/", registerUser);

// POST /api/users/login - авторизация пользователя
router.post("/login", authUser);

// Маршруты, требующие авторизации (защищенные маршруты)
router
  .route("/profile")
  .get(protect, getUserProfile) // GET /api/users/profile - получение профиля
  .put(protect, updateUserProfile); // PUT /api/users/profile - обновление профиля

// Административные маршруты
router.route("/").get(protect, admin, getUsers); // GET /api/users - получение всех пользователей

router
  .route("/:id")
  .get(protect, admin, getUserById) // GET /api/users/:id - получение пользователя по ID
  .put(protect, admin, updateUser) // PUT /api/users/:id - обновление пользователя
  .delete(protect, admin, deleteUser); // DELETE /api/users/:id - удаление пользователя

export default router;
