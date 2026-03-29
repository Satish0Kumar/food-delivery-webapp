const Order = require("../models/Order");
const Item = require("../models/Item");
const { sendOrderEmail } = require("../utils/sendEmail");
const { sendPushNotification } = require("../utils/sendNotification");

// @desc    Place new order (Customer)
// @route   POST /api/orders
// @access  Public
const placeOrder = async (req, res) => {
  try {
    const { customerName, phone, address, items, paymentMethod } = req.body;

    // Validation
    if (!customerName || !phone || !address || !items.length) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Verify items exist and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const dbItem = await Item.findById(item.itemId);
      
      if (!dbItem || !dbItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${dbItem?.name || item.name} is not available`,
        });
      }

      orderItems.push({
        itemId: item.itemId,
        name: dbItem.name,
        price: dbItem.price,
        quantity: item.quantity,
      });

      totalAmount += dbItem.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      customerName,
      phone,
      address,
      items: orderItems,
      totalAmount,
      paymentMethod,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("new-order", {
        orderId: order._id,
        customerName,
        totalAmount,
        phone,
      });
    }

    // Email notification — fire and forget
    sendOrderEmail(order);

    // FCM push notification — fire and forget
    sendPushNotification(order);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private (Admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("items.itemId", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  updateOrderStatus,
};