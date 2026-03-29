import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Home, UtensilsCrossed, Clock } from 'lucide-react'

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const orderId = searchParams.get('orderId') || ''
  const name = searchParams.get('name') || 'Customer'
  const total = searchParams.get('total') || '0'

  // Short display ID — last 6 chars of MongoDB ObjectId
  const displayId = orderId ? orderId.slice(-6).toUpperCase() : '------'

  // Countdown to auto-redirect home
  const [seconds, setSeconds] = useState(10)
  useEffect(() => {
    if (seconds <= 0) {
      navigate('/')
      return
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Green top banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-8 text-center">
            <div className="flex justify-center mb-3">
              <CheckCircle className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-white font-extrabold text-2xl">Order Placed!</h1>
            <p className="text-green-100 text-sm mt-1">We got your order, {name.split(' ')[0]} 🎉</p>
          </div>

          {/* Order Details */}
          <div className="px-6 py-6 space-y-4">

            {/* Order ID */}
            <div className="bg-gray-50 rounded-2xl px-5 py-4 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
              <p className="font-extrabold text-gray-900 text-2xl tracking-wider">#{displayId}</p>
            </div>

            {/* Amount */}
            <div className="flex justify-between items-center bg-orange-50 rounded-2xl px-5 py-4">
              <div className="flex items-center space-x-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-semibold text-gray-700">Total Paid</span>
              </div>
              <span className="font-extrabold text-orange-500 text-lg">₹{total}</span>
            </div>

            {/* Delivery Time */}
            <div className="flex justify-between items-center bg-blue-50 rounded-2xl px-5 py-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">Estimated Delivery</span>
              </div>
              <span className="font-bold text-blue-600">30–45 min</span>
            </div>

            {/* Info note */}
            <p className="text-center text-xs text-gray-400 px-2">
              Our team will call you to confirm. Keep your phone handy! 📞
            </p>

            {/* Actions */}
            <div className="space-y-3 pt-1">
              <button
                onClick={() => navigate('/menu')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95"
              >
                🍛 Order More
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center space-x-2 border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home</span>
              </button>
            </div>

            {/* Auto redirect countdown */}
            <p className="text-center text-xs text-gray-400">
              Redirecting to home in <span className="font-bold text-orange-500">{seconds}s</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
