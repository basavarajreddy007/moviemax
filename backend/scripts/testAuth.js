const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  await User.deleteMany({ email: "test2@example.com" });

  const user = new User({
    name: "Test User 2",
    email: "test2@example.com",
    password: "password123"
  });

  console.log("Plain password before save:", user.password);
  await user.save();
  console.log("Hashed password after save:", user.password);

  const retrieved = await User.findOne({ email: "test2@example.com" }).select("+password");
  console.log("Retrieved hashed password:", retrieved.password);

  const manualMatch = await bcrypt.compare("password123", retrieved.password);
  console.log("Manual comparison match:", manualMatch);

  const methodMatch = await retrieved.comparePassword("password123");
  console.log("Method comparison match:", methodMatch);

  await mongoose.disconnect();
}
run().catch(console.error);
