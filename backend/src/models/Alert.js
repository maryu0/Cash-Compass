import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Alert title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Alert message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    severity: {
      type: String,
      enum: ["critical", "warning", "info"],
      default: "info",
    },
    category: {
      type: String,
      enum: [
        "overspending",
        "budget_exceeded",
        "unusual_activity",
        "goal_alert",
        "bill_reminder",
        "low_balance",
        "income_received",
        "risk_alert",
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
alertSchema.index({ user: 1, createdAt: -1 });
alertSchema.index({ user: 1, isRead: 1 });

// Static method to get unread count
alertSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({
    user: userId,
    isRead: false,
    isResolved: false,
  });
};

// Static method to get recent alerts
alertSchema.statics.getRecentAlerts = async function (userId, limit = 10) {
  return await this.find({
    user: userId,
    isResolved: false,
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
