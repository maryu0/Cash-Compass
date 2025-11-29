import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://ayush:ayush003@cluster0.rxm4jbd.mongodb.net/";

async function seedTransactions() {
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

    // Sample transactions for Bibek (amounts: positive = income, negative = expense)
    const transactions = [
      // Income
      {
        user: user._id,
        date: new Date("2024-11-01"),
        amount: 95000,
        category: "income",
        description: "Monthly Salary",
        isExpense: false,
      },
      {
        user: user._id,
        date: new Date("2024-10-01"),
        amount: 95000,
        category: "income",
        description: "Monthly Salary",
        isExpense: false,
      },
      {
        user: user._id,
        date: new Date("2024-09-01"),
        amount: 90000,
        category: "income",
        description: "Monthly Salary",
        isExpense: false,
      },
      {
        user: user._id,
        date: new Date("2024-11-15"),
        amount: 5000,
        category: "income",
        description: "Freelance Work",
        isExpense: false,
      },

      // November Expenses
      {
        user: user._id,
        date: new Date("2024-11-05"),
        amount: -15000,
        category: "household",
        description: "Monthly Rent",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-03"),
        amount: -4500,
        category: "food",
        description: "Grocery Shopping - BigBasket",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-08"),
        amount: -1200,
        category: "food",
        description: "Restaurant - Family Dinner",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-10"),
        amount: -800,
        category: "food",
        description: "Swiggy Orders",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-12"),
        amount: -3000,
        category: "transport",
        description: "Petrol",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-14"),
        amount: -2500,
        category: "transport",
        description: "Uber/Ola Rides",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-16"),
        amount: -1500,
        category: "social_life_entertainment",
        description: "Movie + Dinner",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-18"),
        amount: -999,
        category: "social_life_entertainment",
        description: "Netflix Subscription",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-20"),
        amount: -500,
        category: "health_personal_care",
        description: "Gym Membership",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-22"),
        amount: -2000,
        category: "apparel",
        description: "New Shoes - Nike",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-25"),
        amount: -5000,
        category: "education",
        description: "Online Course - Udemy",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-11-28"),
        amount: -10000,
        category: "savings_investments",
        description: "SIP Investment",
        isExpense: true,
      },

      // October Expenses
      {
        user: user._id,
        date: new Date("2024-10-05"),
        amount: -15000,
        category: "household",
        description: "Monthly Rent",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-10-10"),
        amount: -5000,
        category: "food",
        description: "Groceries",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-10-15"),
        amount: -3500,
        category: "transport",
        description: "Petrol + Uber",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-10-20"),
        amount: -2000,
        category: "social_life_entertainment",
        description: "Concerts",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-10-25"),
        amount: -10000,
        category: "savings_investments",
        description: "SIP Investment",
        isExpense: true,
      },

      // September Expenses
      {
        user: user._id,
        date: new Date("2024-09-05"),
        amount: -15000,
        category: "household",
        description: "Monthly Rent",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-09-10"),
        amount: -6000,
        category: "food",
        description: "Groceries + Dining",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-09-15"),
        amount: -4000,
        category: "transport",
        description: "Travel Expenses",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-09-20"),
        amount: -15000,
        category: "travel",
        description: "Weekend Trip to Goa",
        isExpense: true,
      },
      {
        user: user._id,
        date: new Date("2024-09-25"),
        amount: -10000,
        category: "savings_investments",
        description: "SIP Investment",
        isExpense: true,
      },
    ];

    // Clear existing transactions for this user
    const deleteResult = await mongoose.connection.db
      .collection("transactions")
      .deleteMany({ user: user._id });
    console.log("Deleted", deleteResult.deletedCount, "existing transactions");

    // Insert new transactions
    const insertResult = await mongoose.connection.db
      .collection("transactions")
      .insertMany(transactions);
    console.log("Inserted", insertResult.insertedCount, "transactions");

    // Verify the data
    const count = await mongoose.connection.db
      .collection("transactions")
      .countDocuments({ user: user._id });
    console.log("Total transactions for Bibek:", count);

    // Show summary
    const summary = await mongoose.connection.db
      .collection("transactions")
      .aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] },
            },
            totalExpenses: {
              $sum: {
                $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
              },
            },
          },
        },
      ])
      .toArray();

    if (summary.length > 0) {
      console.log("\n=== Summary ===");
      console.log(
        "Total Income:",
        "₹" + summary[0].totalIncome.toLocaleString()
      );
      console.log(
        "Total Expenses:",
        "₹" + summary[0].totalExpenses.toLocaleString()
      );
      console.log(
        "Net Balance:",
        "₹" +
          (summary[0].totalIncome - summary[0].totalExpenses).toLocaleString()
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

seedTransactions();
