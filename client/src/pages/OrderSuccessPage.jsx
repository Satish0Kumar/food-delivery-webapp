import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Home, UtensilsCrossed, Clock } from 'lucide-react'

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const orderId = searchParams.get('orderId') || ''
  const name    = searchParams.get('name') || 'Customer'
  const total   = searchParams.get('total') || '0'

  const displayId = orderId ? orderId.slice(-6).toUpperCase() : '------'

  const [seconds, setSeconds] = useState(10)
  useEffect(() => {
    if (seconds <= 0) { navigate('/'); return }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Green top banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-8 text-center">
            <div className="flex justify-center mb-3">
              <CheckCircle className="w-16 h-16 text-white drop-shadow-lg" aria-hidden="true" />
            </div>
            <h1 className="text-white font-extrabold text-2xl">{t('orderPlaced')}</h1>
            <p className="text-green-100 text-sm mt-1">{t('gotYourOrder', { name: name.split(' ')[0] })}</p>
          </div>

          {/* Order Details */}
          <div className="px-6 py-6 space-y-4">
            <div className="bg-gray-50 rounded-2xl px-5 py-4 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{t('orderId')}</p>
              <p className="font-extrabold text-gray-900 text-2xl tracking-wider">#{displayId}</p>
            </div>

            <div className="flex justify-between items-center bg-orange-50 rounded-2xl px-5 py-4">
              <div className="flex items-center space-x-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-gray-700">{t('totalPaid')}</span>
              </div>
              <span className="font-extrabold text-orange-500 text-lg">₹{total}</span>
            </div>

            <div className="flex justify-between items-center bg-blue-50 rounded-2xl px-5 py-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-gray-700">{t('estimatedDelivery')}</span>
              </div>
              <span className="font-bold text-blue-600">30–45 min</span>
            </div>

            <p className="text-center text-xs text-gray-400 px-2">{t('callConfirm')}</p>

            <div className="space-y-3 pt-1">
              <button
                onClick={() => navigate('/menu')}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-3.5 rounded-2xl transition-all min-h-[52px]"
              >
                {t('orderMore')}
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center space-x-2 border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-all min-h-[52px]"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                <span>{t('goHome')}</span>
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              {t('redirecting', { seconds })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
