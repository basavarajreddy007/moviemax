const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const Movie = require("../models/Movie");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  const movies = await Movie.find();
  console.log("Found", movies.length, "movies:");
  for (const m of movies) {
    console.log({
      id: m._id,
      title: m.title,
      slug: m.slug,
      video: m.video,
      trailer: m.trailer,
      poster: m.poster,
    });
  }
  await mongoose.disconnect();
}
run().catch(console.error);
