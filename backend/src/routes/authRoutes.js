import express from "express";
import {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
