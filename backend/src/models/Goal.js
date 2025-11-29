import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [0, "Target amount must be positive"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
    },
    deadline: {
      type: Date,
      required: [true, "Goal deadline is required"],
    },
    category: {
      type: String,
      enum: [
        "emergency_fund",
        "vacation",
        "education",
        "home",
        "car",
        "investment",
        "retirement",
        "gadgets",
        "other",
      ],
      default: "other",
    },
    icon: {
      type: String,
      default: "🎯",
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
goalSchema.index({ user: 1, isArchived: 1 });

// Virtual for progress percentage
goalSchema.virtual("progress").get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min(
    Math.round((this.currentAmount / this.targetAmount) * 100),
    100
  );
});

// Virtual for days remaining
goalSchema.virtual("daysRemaining").get(function () {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Ensure virtuals are included in JSON
goalSchema.set("toJSON", { virtuals: true });
goalSchema.set("toObject", { virtuals: true });

// Pre-save hook to check completion
goalSchema.pre("save", function (next) {
  if (this.currentAmount >= this.targetAmount) {
    this.isCompleted = true;
  }
  next();
});

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
