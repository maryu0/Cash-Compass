import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://ayush:ayush003@cluster0.rxm4jbd.mongodb.net/";

async function seedAlerts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get Bibek's user ID
    const user = await mongoose.connection.db
      .collection("users")
      .findOne({ email: "bibek@example.com" });

    if (!user) {
      console.log("User bibek@example.com not found!");
      process.exit(1);
    }

    console.log("Found user:", user.name, "ID:", user._id);

    // Sample alerts for Bibek
    const alerts = [
      {
        user: user._id,
        title: "Budget Exceeded - Food",
        message:
          "You have spent ₹6,500 on food this month, exceeding your ₹5,000 budget by 30%.",
        severity: "warning",
        category: "budget_exceeded",
        isRead: false,
        isResolved: false,
        metadata: { category: "food", spent: 6500, budget: 5000 },
        createdAt: new Date("2024-11-20"),
      },
      {
        user: user._id,
        title: "High Spending Alert",
        message:
          "Your spending this week is 25% higher than your average weekly spending.",
        severity: "warning",
        category: "overspending",
        isRead: false,
        isResolved: false,
        metadata: { weeklySpent: 15000, averageWeekly: 12000 },
        createdAt: new Date("2024-11-25"),
      },
      {
        user: user._id,
        title: "SIP Investment Successful",
        message:
          "Your monthly SIP investment of ₹10,000 has been successfully processed.",
        severity: "info",
        category: "income_received",
        isRead: true,
        isResolved: true,
        metadata: { amount: 10000, type: "SIP" },
        createdAt: new Date("2024-11-28"),
      },
      {
        user: user._id,
        title: "Risk Level: Medium",
        message:
          "Your financial risk assessment shows moderate risk. Consider building an emergency fund.",
        severity: "warning",
        category: "risk_alert",
        isRead: false,
        isResolved: false,
        metadata: { riskScore: 45, riskLevel: "medium" },
        createdAt: new Date("2024-11-28"),
      },
      {
        user: user._id,
        title: "Goal Milestone - Emergency Fund",
        message:
          "Congratulations! You have reached 50% of your Emergency Fund goal.",
        severity: "info",
        category: "goal_alert",
        isRead: false,
        isResolved: false,
        metadata: { goalName: "Emergency Fund", progress: 50 },
        createdAt: new Date("2024-11-15"),
      },
    ];

    // Clear existing alerts for this user
    const deleteResult = await mongoose.connection.db
      .collection("alerts")
      .deleteMany({ user: user._id });
    console.log("Deleted", deleteResult.deletedCount, "existing alerts");

    // Insert new alerts
    const insertResult = await mongoose.connection.db
      .collection("alerts")
      .insertMany(alerts);
    console.log("Inserted", insertResult.insertedCount, "alerts");

    // Show unread count
    const unreadCount = await mongoose.connection.db
      .collection("alerts")
      .countDocuments({
        user: user._id,
        isRead: false,
        isResolved: false,
      });
    console.log("Unread alerts:", unreadCount);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

seedAlerts();
