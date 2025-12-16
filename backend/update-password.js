import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function updatePassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const newHash = bcrypt.hashSync("password123", 10);
    console.log("Generated hash:", newHash);

    const result = await mongoose.connection.db
      .collection("users")
      .updateOne(
        { email: "bibek@example.com" },
        { $set: { password: newHash } }
      );

    console.log("Updated:", result.modifiedCount, "document(s)");

    // Verify the update
    const user = await mongoose.connection.db
      .collection("users")
      .findOne({ email: "bibek@example.com" });
    console.log(
      "Verification - password hash updated:",
      user.password === newHash
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updatePassword();
