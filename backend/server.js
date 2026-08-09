const config = require("./config/env");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const movieRoutes = require("./routes/movieRoutes");
const tvShowRoutes = require("./routes/tvShowRoutes");
const webSeriesRoutes = require("./routes/webSeriesRoutes");
const genreRoutes = require("./routes/genreRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const watchHistoryRoutes = require("./routes/watchHistoryRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const brandRoutes = require("./routes/brandRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const channelRoutes = require("./routes/channelRoutes");
const errorHandler = require("./middleware/errorHandler");
const { verifySmtpConnection } = require("./services/emailService");
const seedPlans = require("./scripts/seedPlans");
const seedCategories = require("./scripts/seedCategories");
const seedGenres = require("./scripts/seedGenres");

const app = express();
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.set("trust proxy", 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));
app.use(morgan(config.IS_PRODUCTION ? "combined" : "dev"));
app.use(compression());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://basavarajreddy007.github.io",
  "https://ott-xnac.onrender.com",
  config.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.get("/uploads/:filename", cors(corsOptions), (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File not found" });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
  };
  const contentType = mimeTypes[ext] || "video/mp4";

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Accept-Ranges", "bytes");

  if (range) {

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
    });

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
    stream.on("error", (err) => {
      console.error("Stream error:", err.message);
      if (!res.headersSent) res.status(500).end();
    });
  } else {

    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again later." },
});

app.use("/api/", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "OTT Backend API is running 🚀",
    status: "OK",
    version: "1.0.0",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/tvshows", tvShowRoutes);
app.use("/api/webseries", webSeriesRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/history", watchHistoryRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/channels", channelRoutes);

if (config.AI_ENABLED) {
  app.use("/api/ai", aiRoutes);
} else {
  app.use("/api/ai", (_req, res) => {
    res.status(503).json({ success: false, message: "AI features are currently disabled." });
  });
}

app.use("/api/*", (_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

const migrateLocalhostUrls = async () => {
  const oldUrl = "http://localhost:5000";
  const newUrl = (config.SERVER_URL || config.API_URL || "https://ott-xnac.onrender.com").replace(/\/$/, "");

  if (oldUrl === newUrl) {
    console.log("[Migration] Development environment detected. Skipping migration.");
    return;
  }

  console.log(`[Migration] Starting check to migrate '${oldUrl}' URLs to '${newUrl}'...`);

  try {
    const Movie = require("./models/Movie");
    const TvShow = require("./models/TvShow");
    const WebSeries = require("./models/WebSeries");
    const Brand = require("./models/Brand");
    const User = require("./models/User");

    const replaceUrl = (str) => {
      if (typeof str !== "string") return str;
      return str.replace(new RegExp(oldUrl, "g"), newUrl);
    };

    const movies = await Movie.find();
    let movieUpdateCount = 0;
    for (const doc of movies) {
      let modified = false;

      for (const field of ["poster", "banner", "trailer", "video"]) {
        if (doc[field] && doc[field].url && doc[field].url.includes(oldUrl)) {
          doc[field].url = replaceUrl(doc[field].url);
          modified = true;
        }
      }

      if (doc.cast && doc.cast.length > 0) {
        for (const item of doc.cast) {
          if (item.image && item.image.includes(oldUrl)) {
            item.image = replaceUrl(item.image);
            modified = true;
          }
        }
      }

      if (modified) {
        await doc.save({ validateModifiedOnly: true });
        movieUpdateCount++;
      }
    }
    if (movieUpdateCount > 0) {
      console.log(`[Migration] Migrated ${movieUpdateCount} Movie records.`);
    }

    const tvShows = await TvShow.find();
    let tvShowUpdateCount = 0;
    for (const doc of tvShows) {
      let modified = false;

      for (const field of ["poster", "banner", "trailer"]) {
        if (doc[field] && doc[field].url && doc[field].url.includes(oldUrl)) {
          doc[field].url = replaceUrl(doc[field].url);
          modified = true;
        }
      }

      if (doc.cast && doc.cast.length > 0) {
        for (const item of doc.cast) {
          if (item.image && item.image.includes(oldUrl)) {
            item.image = replaceUrl(item.image);
            modified = true;
          }
        }
      }

      if (doc.seasons && doc.seasons.length > 0) {
        for (const season of doc.seasons) {
          if (season.episodes && season.episodes.length > 0) {
            for (const ep of season.episodes) {
              if (ep.video && ep.video.url && ep.video.url.includes(oldUrl)) {
                ep.video.url = replaceUrl(ep.video.url);
                modified = true;
              }
              if (ep.thumbnail && ep.thumbnail.url && ep.thumbnail.url.includes(oldUrl)) {
                ep.thumbnail.url = replaceUrl(ep.thumbnail.url);
                modified = true;
              }
            }
          }
        }
      }

      if (modified) {
        await doc.save({ validateModifiedOnly: true });
        tvShowUpdateCount++;
      }
    }
    if (tvShowUpdateCount > 0) {
      console.log(`[Migration] Migrated ${tvShowUpdateCount} TvShow records.`);
    }

    const webSeries = await WebSeries.find();
    let webSeriesUpdateCount = 0;
    for (const doc of webSeries) {
      let modified = false;

      for (const field of ["poster", "banner", "trailer"]) {
        if (doc[field] && doc[field].url && doc[field].url.includes(oldUrl)) {
          doc[field].url = replaceUrl(doc[field].url);
          modified = true;
        }
      }

      if (doc.cast && doc.cast.length > 0) {
        for (const item of doc.cast) {
          if (item.image && item.image.includes(oldUrl)) {
            item.image = replaceUrl(item.image);
            modified = true;
          }
        }
      }

      if (doc.seasons && doc.seasons.length > 0) {
        for (const season of doc.seasons) {
          if (season.episodes && season.episodes.length > 0) {
            for (const ep of season.episodes) {
              if (ep.video && ep.video.url && ep.video.url.includes(oldUrl)) {
                ep.video.url = replaceUrl(ep.video.url);
                modified = true;
              }
              if (ep.thumbnail && ep.thumbnail.url && ep.thumbnail.url.includes(oldUrl)) {
                ep.thumbnail.url = replaceUrl(ep.thumbnail.url);
                modified = true;
              }
            }
          }
        }
      }

      if (modified) {
        await doc.save({ validateModifiedOnly: true });
        webSeriesUpdateCount++;
      }
    }
    if (webSeriesUpdateCount > 0) {
      console.log(`[Migration] Migrated ${webSeriesUpdateCount} WebSeries records.`);
    }

    const brands = await Brand.find();
    let brandUpdateCount = 0;
    for (const doc of brands) {
      let modified = false;
      if (doc.logo && doc.logo.url && doc.logo.url.includes(oldUrl)) {
        doc.logo.url = replaceUrl(doc.logo.url);
        modified = true;
      }
      if (modified) {
        await doc.save({ validateModifiedOnly: true });
        brandUpdateCount++;
      }
    }
    if (brandUpdateCount > 0) {
      console.log(`[Migration] Migrated ${brandUpdateCount} Brand records.`);
    }

    const users = await User.find();
    let userUpdateCount = 0;
    for (const doc of users) {
      let modified = false;
      if (doc.avatar && doc.avatar.includes(oldUrl)) {
        doc.avatar = replaceUrl(doc.avatar);
        modified = true;
      }
      if (modified) {
        await doc.save({ validateModifiedOnly: true });
        userUpdateCount++;
      }
    }
    if (userUpdateCount > 0) {
      console.log(`[Migration] Migrated ${userUpdateCount} User records.`);
    }

    console.log("[Migration] Check and migration complete.");
  } catch (error) {
    console.error("[Migration] Error during check/migration:", error.message);
  }
};

const startServer = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("MongoDB connected successfully");
    await migrateLocalhostUrls();

    const server = app.listen(config.PORT, async () => {
      console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      try {
        await seedPlans();
        await seedCategories();
        await seedGenres();
      } catch (seedErr) {
        console.error("Error seeding data:", seedErr.message);
      }

      if (config.SMTP_ENABLED) {
        try {
          const smtpOk = await verifySmtpConnection();
          if (!smtpOk) {
            console.warn("WARNING: SMTP not reachable. Emails will not be sent.");
          }
        } catch (smtpErr) {
          console.warn("WARNING: SMTP verification failed:", smtpErr.message);
        }
      } else {
        console.log("SMTP is disabled. Skipping email verification.");
      }
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${config.PORT} is already in use. Please free the port or set PORT to a different value.`);
        process.exit(1);
      }
      console.error("Server error:", err.message);
      process.exit(1);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Gracefully shutting down...`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log("MongoDB connection closed.");
        } catch (err) {
          console.error("Error closing MongoDB:", err.message);
        }
        process.exit(0);
      });

      setTimeout(() => {
        console.error("Forced shutdown due to timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Promise Rejection:", err.message || err);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err.message || err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
