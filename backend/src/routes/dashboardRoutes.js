import express from "express";
import {
  getDashboardData,
  getRiskScore,
  getMonitoringStatus,
  startMonitoring,
  stopMonitoring,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/", getDashboardData);
router.get("/risk-score", getRiskScore);
router.get("/monitoring", getMonitoringStatus);
router.post("/monitoring/start", startMonitoring);
router.post("/monitoring/stop", stopMonitoring);

export default router;
