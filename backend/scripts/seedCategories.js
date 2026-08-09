const Category = require("../models/Category");
const createSlug = require("../utils/slugify");

const categories = [
  {
    name: "Movies",
    description: "Full-length cinema and featured movies",
  },
  {
    name: "TV Shows",
    description: "Series and serial television shows",
  },
  {
    name: "Web Series",
    description: "Webisodes and online streaming original series",
  },
  {
    name: "Anime",
    description: "Japanese animated productions and shows",
  },
  {
    name: "Documentaries",
    description: "Non-fictional educational films",
  },
];

const seedCategories = async () => {
  try {
    const existingCount = await Category.countDocuments();
    if (existingCount >= categories.length) {
      console.log(`Categories already seeded (${existingCount} categories found)`);
      return;
    }

    for (const cat of categories) {
      const slug = createSlug(cat.name);
      await Category.findOneAndUpdate(
        { slug },
        { name: cat.name, description: cat.description, isActive: true },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded standard categories successfully`);
  } catch (err) {
    console.error("Error seeding categories:", err.message);
  }
};

module.exports = seedCategories;
