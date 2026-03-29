const express = require("express");
const {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  toggleAvailability,
} = require("../controllers/itemController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public route - customers can view menu
router.get("/", getItems);

// Protected routes - admin only
router.use(protect); // All routes below need JWT token

router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.patch("/:id/availability", toggleAvailability);

module.exports = router;