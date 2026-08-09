const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getMovies, getMovie, getMovieById, createMovie, updateMovie, deleteMovie, getFeaturedMovies, getTrendingMovies, getNewReleases, getTopRated, likeMovie, dislikeMovie, getMoviesByGenre, getSimilarMovies } = require("../controllers/movieController");
const { protect, adminOnly, optionalAuth } = require("../middleware/auth");

const uploadsDir = path.join(__dirname, "../uploads/");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/webm",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/x-flv",
    "video/3gpp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only video files are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024,
  },
});

router.post(
  "/upload",
  protect,
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const baseUrl = (
        process.env.SERVER_URL ||
        process.env.API_URL ||
        `${req.protocol}://${req.get("host")}`
      ).replace(/\/$/, "");

      if (!baseUrl) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
        return res.status(500).json({
          success: false,
          message: "Server configuration error: Base URL not configured",
        });
      }

      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: "Video uploaded successfully",
        url: fileUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || "Video upload failed",
      });
    }
  }
);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "FILE_TOO_LARGE") {
      return res.status(413).json({
        success: false,
        message: "File size exceeds 2GB limit",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Upload error",
    });
  }
  next();
});

router.get("/", getMovies);
router.get("/featured", getFeaturedMovies);
router.get("/trending", getTrendingMovies);
router.get("/new-releases", getNewReleases);
router.get("/top-rated", getTopRated);
router.get("/genre/:genreId", getMoviesByGenre);
router.get("/id/:id", optionalAuth, getMovieById);
router.get("/:id/similar", getSimilarMovies);
router.get("/user-uploads", getMovies);
router.get("/:slug", optionalAuth, getMovie);
router.post("/", protect, createMovie);
router.put("/:id", protect, updateMovie);
router.delete("/:id", protect, deleteMovie);
router.post("/:id/like", protect, likeMovie);
router.post("/:id/dislike", protect, dislikeMovie);

module.exports = router;
