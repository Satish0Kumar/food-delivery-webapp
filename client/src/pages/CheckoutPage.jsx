import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, ShoppingBag, User, Phone, MapPin,
  CreditCard, Banknote, Loader2,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import LanguageToggle from '../components/LanguageToggle'

const CheckoutPage = () => {
  const { cartItems, totalItems, totalAmount, clearCart } = useCart()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [form, setForm] = useState({
    customerName:  '',
    phone:         '',
    address:       '',
    paymentMethod: 'COD',
  })
  const [errors, setErrors]           = useState({})
  const [placing, setPlacing]         = useState(false)
  const [serverError, setServerError] = useState('')

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-7xl mb-4" role="img" aria-label="empty cart">🛒</div>
        <p className="text-gray-700 font-bold text-xl mb-2">{t('cartEmpty')}</p>
        <p className="text-gray-400 text-sm mb-6">{t('addItemsFirst')}</p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 active:bg-orange-700 transition-all min-h-[52px]"
        >
          {t('goToMenu')}
        </button>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!form.customerName.trim()) e.customerName = t('nameRequired')
    else if (form.customerName.trim().length < 2) e.customerName = t('validName')
    if (!form.phone.trim()) e.phone = t('phoneRequired')
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = t('validPhone')
    if (!form.address.trim()) e.address = t('addressRequired')
    else if (form.address.trim().length < 10) e.address = t('completeAddress')
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  const handleCOD = async (payload) => {
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...payload, paymentMethod: 'COD' }),
    })
    const data = await res.json()
    if (data.success) {
      clearCart()
      navigate(`/order-success?orderId=${data.data._id}&name=${encodeURIComponent(form.customerName.trim())}&total=${totalAmount}`)
    } else {
      throw new Error(data.message || t('somethingWrong'))
    }
  }

  const handleOnline = async (payload) => {
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/initiate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...payload, totalAmount }),
    })
    const data = await res.json()
    if (data.success && data.redirectUrl) {
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        customerName: form.customerName.trim(),
        totalAmount,
        txnId:   data.txnId,
        orderId: data.orderId,
      }))
      clearCart()
      window.location.href = data.redirectUrl
    } else {
      throw new Error(data.message || t('somethingWrong'))
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setPlacing(true)
    setServerError('')
    const payload = {
      customerName: form.customerName.trim(),
      phone:        form.phone.trim(),
      address:      form.address.trim(),
      items: cartItems.map((i) => ({ itemId: i._id, name: i.name, quantity: i.quantity })),
    }
    try {
      if (form.paymentMethod === 'COD') await handleCOD(payload)
      else await handleOnline(payload)
    } catch (err) {
      setServerError(err.message || t('somethingWrong'))
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/menu')}
              aria-label="Go back"
              className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <p className="font-bold text-gray-900 leading-none">{t('checkout')}</p>
              <p className="text-xs text-gray-400">{totalItems} {totalItems > 1 ? t('items') : t('item')} · ₹{totalAmount}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center space-x-2 px-5 py-4 border-b border-gray-50">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-gray-900">{t('orderSummary')}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image || 'https://placehold.co/40x40/FFF3E0/E65100?text=Food'}
                    alt={item.name}
                    loading="lazy"
                    width={40} height={40}
                    className="w-10 h-10 rounded-xl object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/40x40/FFF3E0/E65100?text=Food' }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">₹{item.price} × {item.quantity}</p>
                  </div>
                </div>
                <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-gray-50 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t('subtotal')}</span><span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t('delivery')}</span>
              <span className="text-green-600 font-semibold">{t('free')}</span>
            </div>
            <div className="flex justify-between font-extrabold text-gray-900 text-base pt-2 border-t border-gray-200">
              <span>{t('total')}</span>
              <span className="text-orange-500">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details Form */}
        <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">{t('deliveryDetails')}</h2>
          </div>

          <div className="px-5 py-5 space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <User className="w-4 h-4 inline mr-1 text-gray-400" />{t('fullName')} *
              </label>
              <input
                type="text" name="customerName" value={form.customerName}
                onChange={handleChange} placeholder={t('namePlaceholder')}
                autoComplete="name"
                className={`w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all min-h-[52px] ${errors.customerName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1" role="alert">{errors.customerName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Phone className="w-4 h-4 inline mr-1 text-gray-400" />{t('mobileNumber')} *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm text-gray-500 min-h-[52px]">+91</span>
                <input
                  type="tel" name="phone" value={form.phone}
                  onChange={handleChange} placeholder="9876543210" maxLength={10}
                  autoComplete="tel"
                  inputMode="numeric"
                  className={`flex-1 border rounded-r-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all min-h-[52px] ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1" role="alert">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4 inline mr-1 text-gray-400" />{t('deliveryAddress')} *
              </label>
              <textarea
                name="address" value={form.address} onChange={handleChange}
                placeholder={t('addressPlaceholder')}
                rows={3}
                autoComplete="street-address"
                className={`w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all resize-none ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1" role="alert">{errors.address}</p>}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('paymentMethod')} *</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm((p) => ({ ...p, paymentMethod: 'COD' }))}
                  className={`flex items-center space-x-3 border-2 rounded-xl px-4 py-3 transition-all min-h-[64px] ${ form.paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200' }`}
                >
                  <Banknote className={`w-5 h-5 ${form.paymentMethod === 'COD' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-bold ${form.paymentMethod === 'COD' ? 'text-orange-600' : 'text-gray-700'}`}>{t('cash')}</p>
                    <p className="text-xs text-gray-400">{t('payOnDelivery')}</p>
                  </div>
                </button>
                <button type="button" onClick={() => setForm((p) => ({ ...p, paymentMethod: 'ONLINE' }))}
                  className={`flex items-center space-x-3 border-2 rounded-xl px-4 py-3 transition-all min-h-[64px] ${ form.paymentMethod === 'ONLINE' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200' }`}
                >
                  <CreditCard className={`w-5 h-5 ${form.paymentMethod === 'ONLINE' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-bold ${form.paymentMethod === 'ONLINE' ? 'text-orange-600' : 'text-gray-700'}`}>{t('online')}</p>
                    <p className="text-xs text-gray-400">{t('upiCard')}</p>
                  </div>
                </button>
              </div>
              {form.paymentMethod === 'ONLINE' && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start space-x-2">
                  <span className="text-blue-500 text-base">🔒</span>
                  <p className="text-xs text-blue-700">{t('phonePeInfo')}</p>
                </div>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl" role="alert">
                ⚠️ {serverError}
              </div>
            )}

            <button
              type="submit" disabled={placing}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 text-white font-extrabold py-4 rounded-2xl transition-all text-base flex items-center justify-center space-x-2 min-h-[56px]"
            >
              {placing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>{t('processing')}</span></>
              ) : form.paymentMethod === 'ONLINE' ? (
                <span>🔒 {t('payViaPhonePe', { amount: totalAmount })}</span>
              ) : (
                <span>🍛 {t('placeOrder')} · ₹{totalAmount}</span>
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage
