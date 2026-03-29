const admin = require("firebase-admin");

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, "\n"),
    }),
  });
}

/**
 * Send FCM push notification to owner's browser/device
 * @param {Object} order - The full order object
 */
const sendPushNotification = async (order) => {
  try {
    const ownerFCMToken = process.env.OWNER_FCM_TOKEN;

    if (!ownerFCMToken) {
      console.warn("⚠️  OWNER_FCM_TOKEN not set — skipping push notification");
      return;
    }

    const message = {
      token: ownerFCMToken,
      notification: {
        title: `🍽️ New Order — ₹${order.totalAmount}`,
        body: `${order.customerName} ordered ${order.items.length} item(s) via ${order.paymentMethod}`,
      },
      data: {
        orderId: order._id.toString(),
        customerName: order.customerName,
        totalAmount: order.totalAmount.toString(),
      },
    };

    await admin.messaging().send(message);
    console.log("✅ FCM push notification sent");
  } catch (error) {
    console.error("❌ FCM notification failed:", error.message);
  }
};

module.exports = { sendPushNotification };