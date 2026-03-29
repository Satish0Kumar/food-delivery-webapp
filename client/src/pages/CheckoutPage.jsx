import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, User, Phone, MapPin, CreditCard, Banknote, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'

const CheckoutPage = () => {
  const { cartItems, totalItems, totalAmount, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    paymentMethod: 'COD',
  })
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const [serverError, setServerError] = useState('')

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <p className="text-gray-700 font-bold text-xl mb-2">Your cart is empty</p>
        <p className="text-gray-400 text-sm mb-6">Add items before checking out</p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all"
        >
          Go to Menu
        </button>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!form.customerName.trim()) e.customerName = 'Name is required'
    else if (form.customerName.trim().length < 2) e.customerName = 'Enter a valid name'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number'
    if (!form.address.trim()) e.address = 'Delivery address is required'
    else if (form.address.trim().length < 10) e.address = 'Please enter a complete address'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setPlacing(true)
    setServerError('')

    try {
      const payload = {
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        paymentMethod: form.paymentMethod,
        items: cartItems.map((i) => ({
          itemId: i._id,
          name: i.name,      // send name too for better error messages
          quantity: i.quantity,
        })),
      }

      // Use native fetch to avoid any axios interceptor interference
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        const orderId = data.data._id
        clearCart()
        navigate(
          `/order-success?orderId=${orderId}&name=${encodeURIComponent(form.customerName.trim())}&total=${totalAmount}`
        )
      } else {
        setServerError(data.message || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      console.error('Order placement error:', err)
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center space-x-3">
          <button
            onClick={() => navigate('/menu')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <p className="font-bold text-gray-900 leading-none">Checkout</p>
            <p className="text-xs text-gray-400">{totalItems} item{totalItems > 1 ? 's' : ''} · ₹{totalAmount}</p>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        {/* ── Order Summary Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center space-x-2 px-5 py-4 border-b border-gray-50">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-gray-900">Order Summary</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image || 'https://via.placeholder.com/40x40?text=Food'}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover"
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
          {/* Bill */}
          <div className="px-5 py-4 bg-gray-50 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between font-extrabold text-gray-900 text-base pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-orange-500">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* ── Delivery Details Form ── */}
        <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Delivery Details</h2>
          </div>

          <div className="px-5 py-5 space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <User className="w-4 h-4 inline mr-1 text-gray-400" />Full Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="e.g. Raju Kumar"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all
                  ${errors.customerName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.customerName && (
                <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Phone className="w-4 h-4 inline mr-1 text-gray-400" />Mobile Number *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm text-gray-500">+91</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className={`flex-1 border rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all
                    ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4 inline mr-1 text-gray-400" />Delivery Address *
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House no, Street, Village / Area, Landmark..."
                rows={3}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all resize-none
                  ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, paymentMethod: 'COD' }))}
                  className={`flex items-center space-x-3 border-2 rounded-xl px-4 py-3 transition-all ${
                    form.paymentMethod === 'COD'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <Banknote className={`w-5 h-5 ${form.paymentMethod === 'COD' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-bold ${form.paymentMethod === 'COD' ? 'text-orange-600' : 'text-gray-700'}`}>Cash</p>
                    <p className="text-xs text-gray-400">Pay on delivery</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, paymentMethod: 'ONLINE' }))}
                  className={`flex items-center space-x-3 border-2 rounded-xl px-4 py-3 transition-all ${
                    form.paymentMethod === 'ONLINE'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 ${form.paymentMethod === 'ONLINE' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-bold ${form.paymentMethod === 'ONLINE' ? 'text-orange-600' : 'text-gray-700'}`}>Online</p>
                    <p className="text-xs text-gray-400">UPI / Card</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                ⚠️ {serverError}
              </div>
            )}

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={placing}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-extrabold py-4 rounded-2xl transition-all active:scale-95 text-base flex items-center justify-center space-x-2"
            >
              {placing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>Placing Order...</span></>
              ) : (
                <span>🍛 Place Order · ₹{totalAmount}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage
