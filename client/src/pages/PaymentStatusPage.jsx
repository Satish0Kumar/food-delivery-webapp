import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const txnId          = searchParams.get('txnId')

  const [status, setStatus]   = useState('checking')  // checking | success | failed
  const [orderId, setOrderId] = useState(null)
  const [amount, setAmount]   = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [retryCount, setRetryCount]     = useState(0)
  const [countdown, setCountdown]       = useState(10)

  // Read pending order info saved before redirect
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingOrder')
    if (pending) {
      const parsed = JSON.parse(pending)
      setCustomerName(parsed.customerName || '')
      setAmount(parsed.totalAmount || null)
    }
  }, [])

  // Poll payment status from backend
  useEffect(() => {
    if (!txnId) {
      setStatus('failed')
      return
    }

    let attempts = 0
    const maxAttempts = 6

    const poll = async () => {
      try {
        const res  = await fetch(`/api/payment/status/${txnId}`)
        const data = await res.json()

        if (data.success && data.paid) {
          setOrderId(data.orderId)
          if (data.amount) setAmount(data.amount)
          setStatus('success')
          sessionStorage.removeItem('pendingOrder')
          return
        }

        // PhonePe sometimes takes a few seconds to process
        if (data.code === 'PAYMENT_PENDING' && attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 3000)  // retry every 3s, up to 6 times
          return
        }

        setStatus('failed')
      } catch {
        setStatus('failed')
      }
    }

    poll()
  }, [txnId, retryCount])

  // Auto-redirect countdown on success
  useEffect(() => {
    if (status !== 'success') return
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          navigate('/')
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status, navigate])

  // ── Checking State ──
  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
          <p className="text-gray-500 text-sm">Please wait while we confirm your payment with PhonePe</p>
        </div>
      </div>
    )
  }

  // ── Success State ──
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">

          {/* Checkmark */}
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>

          <div className="inline-block bg-green-50 text-green-700 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
            Payment Successful
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            {customerName ? `Thank you, ${customerName.split(' ')[0]}! 🎉` : 'Payment Done! 🎉'}
          </h1>
          <p className="text-gray-500 text-sm mb-6">Your order has been confirmed and is being prepared.</p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-6 text-left">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Order ID</span>
                <span className="font-mono font-bold text-gray-900">#{orderId.slice(-6).toUpperCase()}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount Paid</span>
                <span className="font-bold text-green-600">₹{amount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment</span>
              <span className="font-bold text-gray-900">📱 PhonePe</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Delivery</span>
              <span className="font-bold text-gray-900">30–45 min</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-6">Redirecting to home in {countdown}s...</p>

          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 border border-orange-200 text-orange-500 font-bold py-3 rounded-2xl hover:bg-orange-50 transition-all"
            >
              🍛 Order More
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-2xl hover:bg-orange-600 transition-all"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Failed State ──
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">

        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-14 h-14 text-red-500" />
        </div>

        <div className="inline-block bg-red-50 text-red-700 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
          Payment Failed
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Payment Unsuccessful</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your payment could not be processed. No amount has been deducted.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500">Don't worry — your cart items are safe.</p>
          <p className="text-sm text-gray-500">You can retry the payment or choose Cash on Delivery.</p>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => {
              setStatus('checking')
              setRetryCount((c) => c + 1)
            }}
            className="flex items-center justify-center space-x-2 border border-gray-200 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Again</span>
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-orange-500 text-white font-bold py-3 rounded-2xl hover:bg-orange-600 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/menu')}
            className="text-gray-400 text-sm py-2 hover:text-gray-600 transition-all"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentStatusPage
