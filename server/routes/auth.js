import express from "express";
import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const logRequests = (req, res, next) => {
  console.log(`[Auth Routes] ${req.method} ${req.originalUrl}`);
  next();
};

router.use(logRequests); // логирование запросов

router.post("/register", register); // регистрация нового пользователя

router.post("/login", login); // вход пользователя

router
  .route("/profile")
  .get(protect, getUserProfile) // получение и обновление профиля пользователя
  .put(protect, updateUserProfile) // обновление профиля пользователя
  .delete(protect, deleteUserProfile); // удаление профиля пользователя

export default router;
