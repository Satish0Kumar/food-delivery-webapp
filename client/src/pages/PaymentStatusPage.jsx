import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'

const POLL_MAX      = 10
const POLL_INTERVAL = 4000
const FAIL_CODES    = ['PAYMENT_ERROR', 'PAYMENT_DECLINED', 'TIMED_OUT']

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { t }          = useTranslation()
  const txnId          = searchParams.get('txnId')

  const [status, setStatus]             = useState('checking')
  const [orderId, setOrderId]           = useState(null)
  const [amount, setAmount]             = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [countdown, setCountdown]       = useState(10)
  const pollRef    = useRef(null)
  const attemptsRef = useRef(0)   // Phase 8: ref so resetPoll works cleanly

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingOrder')
    if (pending) {
      try {
        const parsed = JSON.parse(pending)
        setCustomerName(parsed.customerName || '')
        setAmount(parsed.totalAmount || null)
      } catch {}
    }
  }, [])

  // Phase 8: extracted poll logic so checkAgain button can restart from 0
  const startPolling = () => {
    clearTimeout(pollRef.current)
    attemptsRef.current = 0
    setStatus('checking')

    if (!txnId) { setStatus('failed'); return }

    const poll = async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/status/${txnId}`)
        const data = await res.json()

        if (data.paid) {
          if (data.orderId) setOrderId(data.orderId)
          if (data.amount)  setAmount(data.amount)
          setStatus('success')
          sessionStorage.removeItem('pendingOrder')
          return
        }

        if (FAIL_CODES.includes(data.code)) {
          if (data.orderId) setOrderId(data.orderId)
          setStatus('failed')
          return
        }

        attemptsRef.current += 1
        if (attemptsRef.current < POLL_MAX) {
          pollRef.current = setTimeout(poll, POLL_INTERVAL)
        } else {
          // Final check after max attempts
          try {
            const finalRes  = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/status/${txnId}`)
            const finalData = await finalRes.json()
            setStatus(finalData.paid ? 'success' : 'failed')
            if (finalData.orderId) setOrderId(finalData.orderId)
            if (finalData.amount)  setAmount(finalData.amount)
          } catch {
            setStatus('failed')
          }
        }
      } catch {
        attemptsRef.current += 1
        if (attemptsRef.current < POLL_MAX) {
          pollRef.current = setTimeout(poll, POLL_INTERVAL)
        } else {
          setStatus('failed')
        }
      }
    }

    poll()
  }

  // Start polling on mount
  useEffect(() => {
    startPolling()
    return () => clearTimeout(pollRef.current)
  }, [txnId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-redirect countdown after success
  useEffect(() => {
    if (status !== 'success') return
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); navigate('/') }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status, navigate])

  // ── Checking ──
  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('verifyingPayment')}</h2>
          <p className="text-gray-500 text-sm">{t('pleaseWait')}</p>
          <p className="text-gray-400 text-xs mt-3">{t('doNotClose')}</p>
        </div>
      </div>
    )
  }

  // ── Success ──
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-green-500" aria-hidden="true" />
          </div>
          <div className="inline-block bg-green-50 text-green-700 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
            {t('paymentSuccess')}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            {customerName ? t('thankYou', { name: customerName.split(' ')[0] }) : t('paymentDone')}
          </h1>
          <p className="text-gray-500 text-sm mb-6">{t('orderConfirmed')}</p>
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-6 text-left">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{t('orderId')}</span>
                <span className="font-mono font-bold text-gray-900">#{String(orderId).slice(-6).toUpperCase()}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{t('amountPaid')}</span>
                <span className="font-bold text-green-600">₹{amount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">{t('payment')}</span>
              <span className="font-bold text-gray-900">{t('phonePe')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">{t('estimatedDelivery')}</span>
              <span className="font-bold text-gray-900">30–45 min</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-6">{t('redirecting', { seconds: countdown })}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 border border-orange-200 text-orange-500 font-bold py-3 rounded-2xl hover:bg-orange-50 active:bg-orange-100 transition-all min-h-[52px]"
            >
              {t('orderMore')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-2xl hover:bg-orange-600 active:bg-orange-700 transition-all min-h-[52px]"
            >
              {t('goHome')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Failed ──
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-14 h-14 text-red-500" aria-hidden="true" />
        </div>
        <div className="inline-block bg-red-50 text-red-700 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
          {t('paymentFailed')}
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{t('paymentUnsuccessful')}</h1>
        <p className="text-gray-500 text-sm mb-6">{t('paymentFailedDesc')}</p>
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500">{t('retryInfo')}</p>
        </div>
        <div className="flex flex-col space-y-3">
          {/* Phase 8: Check Again properly resets poll from attempt 0 */}
          <button
            onClick={startPolling}
            className="flex items-center justify-center space-x-2 border border-gray-200 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-all min-h-[52px]"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>{t('checkAgain')}</span>
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-orange-500 text-white font-bold py-3 rounded-2xl hover:bg-orange-600 active:bg-orange-700 transition-all min-h-[52px]"
          >
            {t('tryAgainBtn')}
          </button>
          <button
            onClick={() => navigate('/menu')}
            className="text-gray-400 text-sm py-2 hover:text-gray-600 transition-all min-h-[44px]"
          >
            {t('backToMenu')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentStatusPage
