const crypto = require('crypto')
const axios  = require('axios')
const Order  = require('../models/Order')
const Item   = require('../models/Item')
const { sendOrderEmail }       = require('../utils/sendEmail')
const { sendPushNotification } = require('../utils/sendNotification')

const MERCHANT_ID  = process.env.PHONEPE_MERCHANT_ID
const SALT_KEY     = process.env.PHONEPE_SALT_KEY
const SALT_INDEX   = process.env.PHONEPE_SALT_INDEX || '1'
const BASE_URL     = process.env.PHONEPE_BASE_URL
const CALLBACK_URL = process.env.PHONEPE_CALLBACK_URL
const CLIENT_URL   = process.env.CLIENT_URL

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

    // ── Step 1: Verify items & calculate total from DB (same as COD) ──
    const orderItems = []
    let calculatedTotal = 0

    for (const item of items) {
      const dbItem = await Item.findById(item.itemId)
      if (!dbItem || !dbItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${dbItem?.name || 'An item'} is not available`,
        })
      }
      orderItems.push({
        itemId:   item.itemId,
        name:     dbItem.name,
        price:    dbItem.price,
        quantity: item.quantity,
      })
      calculatedTotal += dbItem.price * item.quantity
    }

    // ── Step 2: Save order to DB immediately with paymentStatus: Pending ──
    // This ensures it exists in DB regardless of callback reliability
    const merchantTransactionId = `MT${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`

    const order = await Order.create({
      customerName,
      phone,
      address,
      items:          orderItems,
      totalAmount:    calculatedTotal,
      paymentMethod:  'ONLINE',
      paymentStatus:  'Pending',   // will be updated to Paid on success
      orderStatus:    'Placed',
      transactionId:  merchantTransactionId,
    })

    // ── Step 3: Build PhonePe payload ──
    const payload = {
      merchantId:            MERCHANT_ID,
      merchantTransactionId,
      merchantUserId:        `USR_${phone}`,
      amount:                calculatedTotal * 100,   // paise
      redirectUrl:           `${CLIENT_URL}/payment-status?txnId=${merchantTransactionId}`,
      redirectMode:          'REDIRECT',
      callbackUrl:           `${CALLBACK_URL}/api/payment/callback`,
      mobileNumber:          phone,
      paymentInstrument:     { type: 'PAY_PAGE' },
    }

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
    const xVerify = crypto
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
        orderId:     order._id,
      })
    }

    // PhonePe rejected — delete the pending order
    await Order.findByIdAndDelete(order._id)
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
// @access PhonePe server-to-server
// ─────────────────────────────────────────────
const paymentCallback = async (req, res) => {
  try {
    const { response: encodedResponse } = req.body

    if (!encodedResponse) {
      return res.status(400).json({ success: false, message: 'No response payload' })
    }

    // ── Verify checksum ──
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

    // ── Decode response ──
    const decoded        = JSON.parse(Buffer.from(encodedResponse, 'base64').toString())
    const txnData        = decoded.data
    const paymentSuccess = decoded.code === 'PAYMENT_SUCCESS'
    const merchantTxnId  = txnData?.merchantTransactionId

    if (paymentSuccess && merchantTxnId) {
      // Find the order we saved at initiation by transactionId
      const order = await Order.findOneAndUpdate(
        { transactionId: merchantTxnId, paymentStatus: 'Pending' },
        { paymentStatus: 'Paid' },
        { new: true }
      )

      if (order) {
        const io = req.app.get('io')
        if (io) {
          io.emit('new-order', {
            orderId:      order._id,
            customerName: order.customerName,
            totalAmount:  order.totalAmount,
            phone:        order.phone,
          })
        }
        sendOrderEmail(order)
        sendPushNotification(order)
        console.log('✅ PhonePe callback: order marked Paid —', order._id)
      } else {
        console.warn('⚠️ PhonePe callback: no pending order found for txn', merchantTxnId)
      }
    } else {
      // Payment failed — mark order as Failed
      if (merchantTxnId) {
        await Order.findOneAndUpdate(
          { transactionId: merchantTxnId, paymentStatus: 'Pending' },
          { paymentStatus: 'Failed', orderStatus: 'Cancelled' }
        )
      }
      console.log('❌ PhonePe callback: payment failed for txn', merchantTxnId)
    }

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
      // Callback may have already updated it — or we update it now (idempotent)
      const order = await Order.findOneAndUpdate(
        { transactionId: txnId },
        { paymentStatus: 'Paid' },
        { new: true }
      )

      // If callback didn't fire, emit socket now
      if (order && order.paymentStatus !== 'Paid') {
        const io = req.app?.get('io')
        if (io) {
          io.emit('new-order', {
            orderId:      order._id,
            customerName: order.customerName,
            totalAmount:  order.totalAmount,
            phone:        order.phone,
          })
        }
      }

      return res.status(200).json({
        success: true,
        paid:    true,
        orderId: order?._id || null,
        amount:  data.data?.amount ? data.data.amount / 100 : null,
      })
    }

    // Payment still pending or failed
    const currentOrder = await Order.findOne({ transactionId: txnId })
    if (data.code === 'PAYMENT_ERROR' || data.code === 'PAYMENT_DECLINED' || data.code === 'TIMED_OUT') {
      await Order.findOneAndUpdate(
        { transactionId: txnId, paymentStatus: 'Pending' },
        { paymentStatus: 'Failed', orderStatus: 'Cancelled' }
      )
    }

    return res.status(200).json({
      success: true,
      paid:    false,
      code:    data.code,
      message: data.message,
      orderId: currentOrder?._id || null,
    })
  } catch (err) {
    console.error('PhonePe status check error:', err?.response?.data || err.message)
    return res.status(500).json({ success: false, message: 'Status check failed' })
  }
}

module.exports = { initiatePayment, paymentCallback, checkPaymentStatus }
