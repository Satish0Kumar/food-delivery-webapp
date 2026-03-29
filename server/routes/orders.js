const express = require("express");
const {
  placeOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public - customers place orders
router.post("/", placeOrder);

// Protected - admin only
router.use(protect);

router.get("/", getOrders);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;