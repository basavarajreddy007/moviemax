const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const User = require("../models/User");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  await User.deleteMany({ email: "admin@example.com" });

  const user = new User({
    name: "Admin User",
    email: "admin@example.com",
    password: "AdminPassword123",
    role: "admin",
    isVerified: true,
  });

  await user.save();
  console.log("Admin user created/updated successfully. Email: admin@example.com, Password: AdminPassword123");

  await mongoose.disconnect();
}
run().catch(console.error);
