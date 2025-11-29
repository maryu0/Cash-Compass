import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Transaction date is required"],
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
    },
    category: {
      type: String,
      required: [true, "Transaction category is required"],
      enum: [
        "food",
        "social_life_entertainment",
        "transport",
        "household",
        "health_personal_care",
        "education",
        "pets",
        "apparel",
        "travel",
        "savings_investments",
        "gifts_donations",
        "miscellaneous",
        "income",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    isExpense: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });

// Static method to get summary by user
transactionSchema.statics.getSummaryByUser = async function (userId) {
  const summary = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] },
        },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: 1,
        totalExpenses: 1,
        netBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },
        transactionCount: 1,
      },
    },
  ]);

  return (
    summary[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      transactionCount: 0,
    }
  );
};

// Static method to get category breakdown
transactionSchema.statics.getCategoryBreakdown = async function (userId) {
  return await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        amount: { $lt: 0 },
      },
    },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: { $abs: "$amount" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);
};

// Static method to get weekly spending
transactionSchema.statics.getWeeklySpending = async function (userId) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        income: {
          $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] },
        },
        expenses: {
          $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        month: {
          $let: {
            vars: {
              monthsInString: [
                "",
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
            },
            in: { $arrayElemAt: ["$$monthsInString", "$_id.month"] },
          },
        },
        income: 1,
        expenses: 1,
      },
    },
  ]);
};

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
