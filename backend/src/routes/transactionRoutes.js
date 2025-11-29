import express from "express";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkImportTransactions,
  getTransactionSummary,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Summary route (must be before /:id)
router.get("/summary", getTransactionSummary);

// Bulk import route
router.post("/bulk", bulkImportTransactions);

// CRUD routes
router.route("/").get(getTransactions).post(createTransaction);

router
  .route("/:id")
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
