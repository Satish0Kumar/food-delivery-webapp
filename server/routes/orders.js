const express = require("express");
const {
  placeOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  deleteAllOrders,
  getOrderStats,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public - customers place orders
router.post("/", placeOrder);

// Protected - admin only
router.use(protect);

router.get("/stats", getOrderStats);
router.get("/", getOrders);
router.patch("/:id/status", updateOrderStatus);
router.delete("/all", deleteAllOrders);   // DELETE ALL — must be before /:id
router.delete("/:id", deleteOrder);        // DELETE SINGLE

module.exports = router;
