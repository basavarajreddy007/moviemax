const Genre = require("../models/Genre");
const createSlug = require("../utils/slugify");

const genres = [
  {
    name: "Action",
    description: "High-energy stories featuring physical stunts, chases, and battles.",
  },
  {
    name: "Comedy",
    description: "Humorous content designed to amuse, entertain, and make you laugh.",
  },
  {
    name: "Drama",
    description: "Character-driven narratives focusing on realistic emotional themes and serious life conflicts.",
  },
  {
    name: "Fantasy",
    description: "Stories featuring magical elements, mythical creatures, and fictional worlds.",
  },
  {
    name: "Horror",
    description: "Content designed to scare, shock, and evoke fear through supernatural or psychological threats.",
  },
  {
    name: "Mystery",
    description: "Suspenseful plots built around solving a crime or uncovering secrets.",
  },
  {
    name: "Science Fiction",
    description: "Concepts driven by futuristic technology, space exploration, and advanced science.",
  },
];

const seedGenres = async () => {
  try {
    const existingCount = await Genre.countDocuments();
    if (existingCount >= genres.length) {
      console.log(`Genres already seeded (${existingCount} genres found)`);
      return;
    }

    for (const g of genres) {
      const slug = createSlug(g.name);
      await Genre.findOneAndUpdate(
        { slug },
        { name: g.name, description: g.description, isActive: true },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded standard genres successfully`);
  } catch (err) {
    console.error("Error seeding genres:", err.message);
  }
};

module.exports = seedGenres;
