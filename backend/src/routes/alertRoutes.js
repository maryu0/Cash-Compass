import express from "express";
import {
  getAlerts,
  getAlert,
  createAlert,
  markAsRead,
  markAllAsRead,
  resolveAlert,
  deleteAlert,
  clearAlerts,
} from "../controllers/alertController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAlerts).post(createAlert);

router.put("/read-all", markAllAsRead);
router.delete("/clear", clearAlerts);

router.route("/:id").get(getAlert).delete(deleteAlert);

router.put("/:id/read", markAsRead);
router.put("/:id/resolve", resolveAlert);

export default router;
