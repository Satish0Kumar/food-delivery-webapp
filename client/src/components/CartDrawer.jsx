import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

const CartDrawer = () => {
  const {
    cartItems,
    isDrawerOpen,
    setIsDrawerOpen,
    increment,
    decrement,
    removeFromCart,
    totalItems,
    totalAmount,
  } = useCart()

  const navigate = useNavigate()

  const handleCheckout = () => {
    setIsDrawerOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      {/* ── Backdrop ── */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* ── Drawer Panel ── */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${ isDrawerOpen ? 'translate-x-0' : 'translate-x-full' }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-gray-900 text-lg">Your Cart</h2>
            {totalItems > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Empty State ── */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="text-7xl mb-4">🛒</div>
            <p className="text-gray-700 font-semibold text-lg">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Add items from the menu to get started</p>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* ── Cart Items List ── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center space-x-3 bg-gray-50 rounded-2xl p-3"
                >
                  {/* Image */}
                  <img
                    src={item.image || 'https://via.placeholder.com/60x60?text=Food'}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />

                  {/* Name + Price */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                    <p className="text-orange-500 font-bold text-sm">₹{item.price}</p>
                    <p className="text-xs text-gray-400">Subtotal: ₹{item.price * item.quantity}</p>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => decrement(item._id)}
                      className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="w-6 text-center font-bold text-gray-900 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increment(item._id)}
                      className="w-7 h-7 flex items-center justify-center bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>

            {/* ── Cart Summary + Checkout ── */}
            <div className="border-t border-gray-100 px-5 py-4 space-y-4">
              {/* Bill Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Items ({totalItems})</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-500">₹{totalAmount}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all text-base"
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default CartDrawer
