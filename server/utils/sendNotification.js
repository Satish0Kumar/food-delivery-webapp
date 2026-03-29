const admin = require("firebase-admin");

/**
 * Initialize Firebase Admin SDK lazily — only when actually needed.
 * This prevents the server from crashing at startup when
 * FIREBASE_PROJECT_ID / credentials are not yet configured in .env
 */
const initFirebase = () => {
  if (admin.apps.length) return true; // already initialized

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️  Firebase credentials not set in .env — FCM notifications disabled");
    return false;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
    return true;
  } catch (err) {
    console.error("❌ Firebase init failed:", err.message);
    return false;
  }
};

/**
 * Send FCM push notification to owner's browser/device
 * @param {Object} order - The full order object
 */
const sendPushNotification = async (order) => {
  try {
    // Skip silently if Firebase not configured yet
    const ready = initFirebase();
    if (!ready) return;

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
    // Never crash the order flow because of FCM failure
    console.error("❌ FCM notification failed:", error.message);
  }
};

module.exports = { sendPushNotification };
