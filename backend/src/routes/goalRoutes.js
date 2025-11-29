import express from "express";
import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  addToGoal,
  deleteGoal,
  archiveGoal,
} from "../controllers/goalController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getGoals).post(createGoal);

router.route("/:id").get(getGoal).put(updateGoal).delete(deleteGoal);

router.put("/:id/add", addToGoal);
router.put("/:id/archive", archiveGoal);

export default router;
