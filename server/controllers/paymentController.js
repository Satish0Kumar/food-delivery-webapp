const crypto = require('crypto')
const axios  = require('axios')
const Order  = require('../models/Order')
const { sendOrderEmail }        = require('../utils/sendEmail')
const { sendPushNotification }  = require('../utils/sendNotification')

const MERCHANT_ID  = process.env.PHONEPE_MERCHANT_ID
const SALT_KEY     = process.env.PHONEPE_SALT_KEY
const SALT_INDEX   = process.env.PHONEPE_SALT_INDEX || '1'
const BASE_URL     = process.env.PHONEPE_BASE_URL
const CALLBACK_URL = process.env.PHONEPE_CALLBACK_URL   // ngrok / Render URL
const CLIENT_URL   = process.env.CLIENT_URL             // http://localhost:5173

// ─────────────────────────────────────────────
// @route  POST /api/payment/initiate
// @access Public
// ─────────────────────────────────────────────
const initiatePayment = async (req, res) => {
  try {
    const { customerName, phone, address, items, totalAmount } = req.body

    if (!customerName || !phone || !address || !items?.length || !totalAmount) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    // Unique merchant transaction ID
    const merchantTransactionId = `MT${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`

    // Store pending order details in payload as base64 so callback can recreate the order
    const orderMeta = Buffer.from(
      JSON.stringify({ customerName, phone, address, items, totalAmount })
    ).toString('base64')

    const payload = {
      merchantId:            MERCHANT_ID,
      merchantTransactionId,
      merchantUserId:        `USR_${phone}`,
      amount:                totalAmount * 100,    // PhonePe expects paise
      redirectUrl:           `${CLIENT_URL}/payment-status?txnId=${merchantTransactionId}`,
      redirectMode:          'REDIRECT',
      callbackUrl:           `${CALLBACK_URL}/api/payment/callback`,
      mobileNumber:          phone,
      paymentInstrument:     { type: 'PAY_PAGE' },
      // carry order details through the transaction (custom field)
      merchantOrderId:       orderMeta,
    }

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
    const xVerify       = crypto
      .createHash('sha256')
      .update(base64Payload + '/pg/v1/pay' + SALT_KEY)
      .digest('hex') + '###' + SALT_INDEX

    const response = await axios.post(
      `${BASE_URL}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type':  'application/json',
          'X-VERIFY':       xVerify,
          'X-MERCHANT-ID':  MERCHANT_ID,
        },
      }
    )

    const phonePeData = response.data

    if (
      phonePeData.success &&
      phonePeData.data?.instrumentResponse?.redirectInfo?.url
    ) {
      return res.status(200).json({
        success:     true,
        redirectUrl: phonePeData.data.instrumentResponse.redirectInfo.url,
        txnId:       merchantTransactionId,
      })
    }

    return res.status(400).json({
      success: false,
      message: phonePeData.message || 'Payment initiation failed',
    })
  } catch (err) {
    console.error('PhonePe initiate error:', err?.response?.data || err.message)
    return res.status(500).json({ success: false, message: 'Payment initiation failed' })
  }
}

// ─────────────────────────────────────────────
// @route  POST /api/payment/callback
// @access PhonePe server-to-server (public)
// ─────────────────────────────────────────────
const paymentCallback = async (req, res) => {
  try {
    const { response: encodedResponse } = req.body

    if (!encodedResponse) {
      return res.status(400).json({ success: false, message: 'No response payload' })
    }

    // ── Step 1: Verify checksum ──
    const xVerifyHeader = req.headers['x-verify']
    const [receivedHash] = (xVerifyHeader || '').split('###')

    const computedHash = crypto
      .createHash('sha256')
      .update(encodedResponse + SALT_KEY)
      .digest('hex')

    if (computedHash !== receivedHash) {
      console.error('PhonePe callback: checksum mismatch')
      return res.status(400).json({ success: false, message: 'Checksum mismatch' })
    }

    // ── Step 2: Decode response ──
    const decoded     = JSON.parse(Buffer.from(encodedResponse, 'base64').toString())
    const txnData     = decoded.data
    const paymentSuccess = decoded.code === 'PAYMENT_SUCCESS'

    const merchantTransactionId = txnData?.merchantTransactionId
    const merchantOrderId       = txnData?.merchantOrderId   // base64 order meta

    if (paymentSuccess && merchantOrderId) {
      // ── Step 3: Recreate order from meta ──
      let orderMeta
      try {
        orderMeta = JSON.parse(Buffer.from(merchantOrderId, 'base64').toString())
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid order meta' })
      }

      const { customerName, phone, address, items, totalAmount } = orderMeta

      const Item = require('../models/Item')
      const orderItems = []
      let calculatedTotal = 0

      for (const item of items) {
        const dbItem = await Item.findById(item.itemId)
        if (!dbItem || !dbItem.isAvailable) continue
        orderItems.push({
          itemId:   item.itemId,
          name:     dbItem.name,
          price:    dbItem.price,
          quantity: item.quantity,
        })
        calculatedTotal += dbItem.price * item.quantity
      }

      const order = await Order.create({
        customerName,
        phone,
        address,
        items:          orderItems,
        totalAmount:    calculatedTotal,
        paymentMethod:  'ONLINE',
        paymentStatus:  'Paid',
        transactionId:  merchantTransactionId,
      })

      // Notify admin via socket.io
      // (server.js sets app's io instance; callback route uses req.app)
      const io = req.app.get('io')
      if (io) {
        io.emit('new-order', {
          orderId:      order._id,
          customerName,
          totalAmount:  calculatedTotal,
          phone,
        })
      }

      sendOrderEmail(order)
      sendPushNotification(order)

      console.log('✅ PhonePe payment success — Order saved:', order._id)
    } else {
      console.log('❌ PhonePe payment failed for txn:', merchantTransactionId)
    }

    // PhonePe expects 200 OK always
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('PhonePe callback error:', err.message)
    return res.status(500).json({ success: false, message: 'Callback processing failed' })
  }
}

// ─────────────────────────────────────────────
// @route  GET /api/payment/status/:txnId
// @access Public — frontend polls this
// ─────────────────────────────────────────────
const checkPaymentStatus = async (req, res) => {
  try {
    const { txnId } = req.params

    const xVerify = crypto
      .createHash('sha256')
      .update(`/pg/v1/status/${MERCHANT_ID}/${txnId}` + SALT_KEY)
      .digest('hex') + '###' + SALT_INDEX

    const response = await axios.get(
      `${BASE_URL}/pg/v1/status/${MERCHANT_ID}/${txnId}`,
      {
        headers: {
          'Content-Type':  'application/json',
          'X-VERIFY':       xVerify,
          'X-MERCHANT-ID':  MERCHANT_ID,
        },
      }
    )

    const data = response.data

    if (data.success && data.code === 'PAYMENT_SUCCESS') {
      // Find the order saved by callback
      const order = await Order.findOne({ transactionId: txnId })
      return res.status(200).json({
        success:  true,
        paid:     true,
        orderId:  order?._id || null,
        amount:   data.data?.amount ? data.data.amount / 100 : null,
      })
    }

    return res.status(200).json({
      success: true,
      paid:    false,
      code:    data.code,
      message: data.message,
    })
  } catch (err) {
    console.error('PhonePe status check error:', err?.response?.data || err.message)
    return res.status(500).json({ success: false, message: 'Status check failed' })
  }
}

module.exports = { initiatePayment, paymentCallback, checkPaymentStatus }
