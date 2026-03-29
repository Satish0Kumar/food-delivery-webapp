const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send email notification to owner when new order arrives
 * @param {Object} order - The full order object from MongoDB
 */
const sendOrderEmail = async (order) => {
  try {
    const itemsList = order.items
      .map((i) => `• ${i.name} × ${i.quantity} — ₹${i.price * i.quantity}`)
      .join("\n");

    const mailOptions = {
      from: `"Food Delivery Bot" <${process.env.GMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `🍽️ New Order #${order._id.toString().slice(-6).toUpperCase()} — ₹${order.totalAmount}`,
      text: `
New order received!

ORDER ID   : #${order._id.toString().slice(-6).toUpperCase()}
CUSTOMER   : ${order.customerName}
PHONE      : ${order.phone}
ADDRESS    : ${order.address}
PAYMENT    : ${order.paymentMethod}

ITEMS:
${itemsList}

TOTAL      : ₹${order.totalAmount}

Login to admin panel to manage this order.
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: #2563eb; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">🍽️ New Order Received!</h2>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tr><td style="color: #6b7280; padding: 4px 0;">Order ID</td><td style="font-weight: bold;">#${order._id.toString().slice(-6).toUpperCase()}</td></tr>
              <tr><td style="color: #6b7280; padding: 4px 0;">Customer</td><td style="font-weight: bold;">${order.customerName}</td></tr>
              <tr><td style="color: #6b7280; padding: 4px 0;">Phone</td><td>${order.phone}</td></tr>
              <tr><td style="color: #6b7280; padding: 4px 0;">Address</td><td>${order.address}</td></tr>
              <tr><td style="color: #6b7280; padding: 4px 0;">Payment</td><td>${order.paymentMethod}</td></tr>
            </table>

            <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Items Ordered</h3>
            <ul style="padding-left: 16px; margin: 0 0 16px;">
              ${order.items.map((i) => `<li>${i.name} × ${i.quantity} — ₹${i.price * i.quantity}</li>`).join("")}
            </ul>

            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px; text-align: center;">
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #166534;">Total: ₹${order.totalAmount}</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Order email sent to owner");
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
};

module.exports = { sendOrderEmail };