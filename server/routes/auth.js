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

router.use(logRequests);

router.post("/register", register); 

router.post("/login", login);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

export default router;
