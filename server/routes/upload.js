const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { uploadImage } = require("../controllers/uploadController");

// Use memory storage — file buffer held in RAM, streamed directly to Cloudinary
// No disk writes, no multer-storage-cloudinary dependency needed
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

const router = express.Router();

// POST /api/upload  — field name must be "image"
router.post("/", protect, upload.single("image"), uploadImage);

module.exports = router;
