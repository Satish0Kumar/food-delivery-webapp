import { X, Phone, MapPin, CreditCard, Clock, ChevronDown } from 'lucide-react'

const STATUS_COLORS = {
  Placed:            'bg-yellow-100 text-yellow-800 border-yellow-200',
  Preparing:         'bg-purple-100 text-purple-800 border-purple-200',
  'Out for Delivery':'bg-orange-100 text-orange-800 border-orange-200',
  Delivered:         'bg-green-100 text-green-800 border-green-200',
  Cancelled:         'bg-red-100 text-red-800 border-red-200',
}

const STATUS_FLOW = {
  Placed:            ['Preparing', 'Cancelled'],
  Preparing:         ['Out for Delivery', 'Cancelled'],
  'Out for Delivery':['Delivered'],
  Delivered:         [],
  Cancelled:         [],
}

// Timeline steps in order
const TIMELINE = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered']

const OrderDetailModal = ({ order, onClose, onStatusUpdate, updatingId }) => {
  if (!order) return null

  const nextSteps  = STATUS_FLOW[order.orderStatus] || []
  const isTerminal = nextSteps.length === 0
  const displayId  = order._id.slice(-6).toUpperCase()
  const currentIdx = TIMELINE.indexOf(order.orderStatus)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="font-extrabold text-gray-900 text-lg">Order #{displayId}</p>
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleString('en-IN', {
                  weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100'}`}>
                {order.orderStatus}
              </span>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* Customer */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Customer</p>
              <p className="font-bold text-gray-900 text-base">{order.customerName}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{order.phone}</span>
              </div>
              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>{order.address}</span>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Items Ordered</p>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3">
                    <div className="flex items-center space-x-3">
                      {item.itemId?.image && (
                        <img src={item.itemId.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">₹{item.price} each</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">× {item.quantity}</p>
                      <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span><span>₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-900 text-lg pt-1">
                <span>Total</span>
                <span className="text-orange-500">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 font-medium">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                </span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.paymentStatus}
              </span>
            </div>

            {/* Status Timeline */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                <Clock className="w-3 h-3 inline mr-1" />Order Timeline
              </p>
              {order.orderStatus === 'Cancelled' ? (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
                  <span className="text-red-600 font-bold text-sm">❌ Order was Cancelled</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {TIMELINE.map((step, idx) => {
                    const isDone    = idx <= currentIdx
                    const isCurrent = idx === currentIdx
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center">
                        {/* Connector line before */}
                        <div className="flex items-center w-full">
                          {idx > 0 && (
                            <div className={`flex-1 h-0.5 ${ idx <= currentIdx ? 'bg-orange-400' : 'bg-gray-200' }`} />
                          )}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                            isCurrent ? 'bg-orange-500 border-orange-500 text-white scale-110'
                            : isDone   ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white border-gray-200 text-gray-400'
                          }`}>
                            {isDone && !isCurrent ? '✓' : idx + 1}
                          </div>
                          {idx < TIMELINE.length - 1 && (
                            <div className={`flex-1 h-0.5 ${ idx < currentIdx ? 'bg-orange-400' : 'bg-gray-200' }`} />
                          )}
                        </div>
                        <p className={`text-xs mt-1.5 text-center leading-tight ${
                          isCurrent ? 'text-orange-600 font-bold' : isDone ? 'text-green-600 font-medium' : 'text-gray-400'
                        }`}>
                          {step}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isTerminal && (
              <div className="space-y-2 pt-2">
                {nextSteps.map((next) => (
                  <button
                    key={next}
                    onClick={() => onStatusUpdate(order._id, next)}
                    disabled={updatingId === order._id}
                    className={`w-full font-bold py-3.5 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2 ${
                      next === 'Cancelled'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {updatingId === order._id
                      ? <span className="animate-pulse">Updating...</span>
                      : <><ChevronDown className="w-4 h-4" /><span>Mark as {next}</span></>
                    }
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}

export default OrderDetailModal
