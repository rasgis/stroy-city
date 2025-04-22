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

// Добавляем middleware для логирования запросов
const logRequests = (req, res, next) => {
  console.log(`[UserRoutes] ${req.method} ${req.originalUrl}`, {
    headers: req.headers.authorization ? 'Bearer ***' : 'No Auth',
    body: req.body
  });
  next();
};

// Применяем middleware логирования ко всем маршрутам
router.use(logRequests);

// POST /api/users - регистрация нового пользователя
router.post("/", registerUser);

// POST /api/users/login - авторизация пользователя
router.post("/login", authUser);

// PUT /api/users/profile - обновление профиля с отдельной обработкой для отладки
router.put("/profile", (req, res, next) => {
  console.log("[UserRoutes] Получен запрос PUT /api/users/profile");
  console.log("Тело запроса:", req.body);
  
  // Вызываем middleware protect вручную
  protect(req, res, () => {
    console.log("[UserRoutes] Пользователь прошел аутентификацию, ID:", req.user?._id);
    
    // Передаем управление контроллеру updateUserProfile
    try {
      updateUserProfile(req, res);
    } catch (error) {
      console.error("[UserRoutes] Ошибка в контроллере updateUserProfile:", error);
      return res.status(500).json({ 
        message: "Ошибка при обновлении профиля",
        error: error.message 
      });
    }
  });
});

// GET /api/users/profile - получение профиля
router.get("/profile", protect, getUserProfile);

// Административные маршруты
router.route("/").get(protect, admin, getUsers); // GET /api/users - получение всех пользователей

router
  .route("/:id")
  .get(protect, admin, getUserById) // GET /api/users/:id - получение пользователя по ID
  .put(protect, admin, updateUser) // PUT /api/users/:id - обновление пользователя
  .delete(protect, admin, deleteUser); // DELETE /api/users/:id - удаление пользователя

export default router;
