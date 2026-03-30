const express = require('express')
const {
  initiatePayment,
  paymentCallback,
  checkPaymentStatus,
} = require('../controllers/paymentController')

const router = express.Router()

// Customer initiates payment
router.post('/initiate', initiatePayment)

// PhonePe server-to-server webhook (must be public HTTPS)
router.post('/callback', paymentCallback)

// Frontend polls to confirm payment result
router.get('/status/:txnId', checkPaymentStatus)

module.exports = router
