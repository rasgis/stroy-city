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

router.use(logRequests);

router.route("/").get(protect, admin, getUsers);

router.route("/").post(protect, admin, registerUser);
  
router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
