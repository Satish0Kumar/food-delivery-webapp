const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema(
  {
    itemId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    name:     { type: String,  required: true },
    price:    { type: Number,  required: true },
    quantity: { type: Number,  required: true, min: 1 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    customerName:  { type: String, required: true, trim: true },
    phone:         { type: String, required: true, trim: true },
    address:       { type: String, required: true, trim: true },
    items:         { type: [orderItemSchema], required: true },
    totalAmount:   { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    orderStatus:   {
      type:    String,
      enum:    ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    transactionId: { type: String, default: null },   // ← Phase 5: PhonePe txn ID
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
