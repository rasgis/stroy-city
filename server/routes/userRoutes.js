import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  registerUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

const logRequests = (req, res, next) => {
  console.log(`[User Routes] ${req.method} ${req.originalUrl}`);
  next();
};

router.use(logRequests); // логирование запросов

router.route("/").get(protect, admin, getUsers); // получение всех пользователей

router.route("/").post(protect, admin, registerUser); // создание нового пользователя
  
router
  .route("/:id") // получение, обновление и удаление пользователя по ID
  .get(protect, admin, getUserById) // получение пользователя по ID
  .put(protect, admin, updateUser) // обновление пользователя
  .delete(protect, admin, deleteUser); // удаление пользователя

export default router;
