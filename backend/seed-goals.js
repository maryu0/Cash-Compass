import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://ayush:ayush003@cluster0.rxm4jbd.mongodb.net/";

async function seedGoals() {
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

    // Sample goals for Bibek
    const goals = [
      {
        user: user._id,
        name: "Emergency Fund",
        targetAmount: 300000,
        currentAmount: 150000,
        deadline: new Date("2025-06-30"),
        category: "emergency_fund",
        icon: "🏦",
        color: "#22c55e",
        isCompleted: false,
        isArchived: false,
        notes: "6 months of living expenses",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-11-28"),
      },
      {
        user: user._id,
        name: "Goa Vacation",
        targetAmount: 50000,
        currentAmount: 35000,
        deadline: new Date("2025-03-15"),
        category: "vacation",
        icon: "🏖️",
        color: "#f59e0b",
        isCompleted: false,
        isArchived: false,
        notes: "Beach vacation with friends",
        createdAt: new Date("2024-06-01"),
        updatedAt: new Date("2024-11-28"),
      },
      {
        user: user._id,
        name: "New MacBook Pro",
        targetAmount: 200000,
        currentAmount: 80000,
        deadline: new Date("2025-12-31"),
        category: "gadgets",
        icon: "💻",
        color: "#8b5cf6",
        isCompleted: false,
        isArchived: false,
        notes: "M3 Max MacBook Pro for work",
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-11-28"),
      },
      {
        user: user._id,
        name: "Online Certification",
        targetAmount: 25000,
        currentAmount: 25000,
        deadline: new Date("2024-12-31"),
        category: "education",
        icon: "📚",
        color: "#3b82f6",
        isCompleted: true,
        isArchived: false,
        notes: "AWS Solutions Architect certification",
        createdAt: new Date("2024-08-01"),
        updatedAt: new Date("2024-11-15"),
      },
    ];

    // Clear existing goals for this user
    const deleteResult = await mongoose.connection.db
      .collection("goals")
      .deleteMany({ user: user._id });
    console.log("Deleted", deleteResult.deletedCount, "existing goals");

    // Insert new goals
    const insertResult = await mongoose.connection.db
      .collection("goals")
      .insertMany(goals);
    console.log("Inserted", insertResult.insertedCount, "goals");

    // Show active goals count
    const activeCount = await mongoose.connection.db
      .collection("goals")
      .countDocuments({
        user: user._id,
        isCompleted: false,
        isArchived: false,
      });
    console.log("Active goals:", activeCount);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

seedGoals();
