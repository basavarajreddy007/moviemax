const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const User = require("../models/User");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  await User.deleteMany({ email: "test_rehash@example.com" });

  const user = new User({
    name: "Rehash Test",
    email: "test_rehash@example.com",
    password: "password123"
  });
  await user.save();
  const hash1 = user.password;
  console.log("Hash 1:", hash1);

  const match1 = await user.comparePassword("password123");
  console.log("Match 1:", match1);

  const retrieved = await User.findOne({ email: "test_rehash@example.com" }).select("+password");
  retrieved.loginOtp = undefined;
  retrieved.loginOtpExpires = undefined;

  console.log("Is password modified before save?", retrieved.isModified("password"));
  await retrieved.save({ validateModifiedOnly: true });
  console.log("Is password modified after save?", retrieved.isModified("password"));

  const hash2 = retrieved.password;
  console.log("Hash 2:", hash2);
  console.log("Are hashes identical?", hash1 === hash2);

  const match2 = await retrieved.comparePassword("password123");
  console.log("Match 2:", match2);

  await mongoose.disconnect();
}
run().catch(console.error);
