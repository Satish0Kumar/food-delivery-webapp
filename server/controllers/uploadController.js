const cloudinary = require("cloudinary").v2;
// NOTE: cloudinary.config() is called once globally in server.js
// Do NOT call cloudinary.config() here — it would run before dotenv loads

/**
 * Stream file buffer from memory directly to Cloudinary
 * Works with cloudinary v2 — no multer-storage-cloudinary needed
 */
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "food-delivery/menu",
        transformation: [
          { width: 800, height: 600, crop: "limit", quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * @desc    Upload food image to Cloudinary
 * @route   POST /api/upload
 * @access  Private (Admin)
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary not configured. Add credentials to .env",
      });
    }

    const result = await streamUpload(req.file.buffer);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
};

module.exports = { uploadImage };
