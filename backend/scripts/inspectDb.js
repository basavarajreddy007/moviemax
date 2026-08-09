const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const User = require("../models/User");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  const users = await User.find().select("+password");
  console.log("Found", users.length, "users:");
  for (const u of users) {
    console.log({
      id: u._id,
      name: u.name,
      email: u.email,
      password: u.password,
      isVerified: u.isVerified,
      otp: u.otp,
      loginOtp: u.loginOtp
    });
  }
  await mongoose.disconnect();
}
run().catch(console.error);
