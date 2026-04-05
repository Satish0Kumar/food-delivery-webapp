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

    if (!customerName || !phone || !address || !items.length) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

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

    sendOrderEmail(order);
    sendPushNotification(order);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
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

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete a single order (Admin)
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete all orders (Admin)
// @route   DELETE /api/orders
// @access  Private (Admin)
const deleteAllOrders = async (req, res) => {
  try {
    const result = await Order.deleteMany({});
    res.status(200).json({ success: true, message: `${result.deletedCount} orders deleted` });
  } catch (error) {
    console.error("Delete all orders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc  Get order analytics stats (Admin)
// @route GET /api/orders/stats
// @access Private (Admin)
const getOrderStats = async (req, res) => {
  try {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalOrders, todayOrders, monthOrders, revenueAgg, todayRevenueAgg, statusCounts, paymentStatusCounts, last7Days] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: startOfToday } }),
        Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Order.aggregate([
          { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.aggregate([
          { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' }, createdAt: { $gte: startOfToday } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
        Order.aggregate([{ $group: { _id: '$paymentStatus', count: { $sum: 1 } } }]),
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
              paymentStatus: 'Paid',
              orderStatus: { $ne: 'Cancelled' },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$totalAmount' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ])

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        monthOrders,
        totalRevenue:  revenueAgg[0]?.total || 0,
        todayRevenue:  todayRevenueAgg[0]?.total || 0,
        statusCounts,
        paymentStatusCounts,
        last7Days,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = {
  placeOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  deleteAllOrders,
  getOrderStats,
};
