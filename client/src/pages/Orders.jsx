import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ShoppingBag, Eye, Bell, X, ChevronDown } from 'lucide-react'
import { io } from 'socket.io-client'
import OrderDetailModal from '../components/OrderDetailModal'

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

const STATUS_OPTIONS = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']

const STATUS_COLORS = {
  Placed:            'bg-yellow-100 text-yellow-800 border-yellow-200',
  Preparing:         'bg-purple-100 text-purple-800 border-purple-200',
  'Out for Delivery':'bg-orange-100 text-orange-800 border-orange-200',
  Delivered:         'bg-green-100 text-green-800 border-green-200',
  Cancelled:         'bg-red-100 text-red-800 border-red-200',
}

// Only valid next steps per status
const STATUS_FLOW = {
  Placed:            ['Preparing', 'Cancelled'],
  Preparing:         ['Out for Delivery', 'Cancelled'],
  'Out for Delivery':['Delivered'],
  Delivered:         [],
  Cancelled:         [],
}

const Orders = () => {
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [updatingId, setUpdatingId]   = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newOrderAlert, setNewOrderAlert] = useState(null)
  const [alertVisible, setAlertVisible]   = useState(false)

  const token = localStorage.getItem('token')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setOrders(data.data)
      else setError('Failed to fetch orders')
    } catch {
      setError('Network error. Could not load orders.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Socket.io — real-time new order alert
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socket.on('new-order', (payload) => {
      fetchOrders()
      setNewOrderAlert(payload)
      setAlertVisible(true)
      try { new Audio('https://www.soundjay.com/buttons/beep-07a.mp3').play() } catch {}
      setTimeout(() => setAlertVisible(false), 6000)
    })
    return () => socket.disconnect()
  }, [fetchOrders])

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        )
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }))
        }
      }
    } catch {
      alert('Failed to update status. Try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter((o) => o.orderStatus === filterStatus)

  const today = new Date().toDateString()
  const todayOrders    = orders.filter((o) => new Date(o.createdAt).toDateString() === today)
  const todayRevenue   = todayOrders.reduce((s, o) => s + o.totalAmount, 0)
  const pendingCount   = orders.filter((o) => o.orderStatus === 'Placed').length
  const preparingCount = orders.filter((o) => ['Preparing', 'Out for Delivery'].includes(o.orderStatus)).length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
        <p className="text-gray-500">Loading orders...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Real-time Toast Alert */}
      <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
        alertVisible ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0 pointer-events-none'
      }`}>
        {newOrderAlert && (
          <div className="bg-white border-l-4 border-orange-500 shadow-2xl rounded-2xl px-5 py-4 flex items-center space-x-4 min-w-[300px]">
            <div className="bg-orange-100 p-2 rounded-xl">
              <Bell className="w-6 h-6 text-orange-500 animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">🍛 New Order!</p>
              <p className="text-gray-600 text-xs">{newOrderAlert.customerName} · ₹{newOrderAlert.totalAmount}</p>
            </div>
            <button onClick={() => setAlertVisible(false)} className="p-1 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-500 text-sm mt-0.5">{orders.length} total · {todayOrders.length} today</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl transition-all font-semibold text-sm min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Orders", value: todayOrders.length,  color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: "Today's Revenue", value: `₹${todayRevenue}`, color: 'text-green-600',  bg: 'bg-green-50'  },
          { label: 'New (Placed)',    value: pendingCount,         color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'In Progress',     value: preparingCount,       color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl px-4 py-3`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {['All', ...STATUS_OPTIONS].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border min-h-[44px] ${
              filterStatus === status
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status}
            {status !== 'All' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({orders.filter((o) => o.orderStatus === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-20">
          <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">No orders found</p>
          <p className="text-gray-400 text-sm mt-1">
            {filterStatus === 'All' ? 'Orders will appear here once customers start ordering' : `No ${filterStatus} orders`}
          </p>
        </div>
      )}

      {/* Orders Cards */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const nextSteps  = STATUS_FLOW[order.orderStatus] || []
          const isTerminal = nextSteps.length === 0

          return (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                {/* Left */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(order.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">{order.customerName}</p>
                    <p className="text-sm text-gray-500">📞 {order.phone}</p>
                    <p className="text-sm text-gray-500 truncate">📍 {order.address}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-100">
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '📱 Online Payment'}
                    {' • '}
                    <span className={order.paymentStatus === 'Paid' ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end space-y-3 min-w-[180px]">
                  <p className="text-2xl font-extrabold text-gray-900">₹{order.totalAmount}</p>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center space-x-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-all w-full justify-center min-h-[44px]"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>

                  {/* Action Buttons — only valid next steps */}
                  {!isTerminal && (
                    <div className="flex flex-col w-full gap-2">
                      {nextSteps.map((next) => (
                        <button
                          key={next}
                          onClick={() => updateStatus(order._id, next)}
                          disabled={updatingId === order._id}
                          className={`w-full text-sm font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 min-h-[44px] ${
                            next === 'Cancelled'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          {updatingId === order._id
                            ? <span className="animate-pulse">Updating...</span>
                            : <><ChevronDown className="w-4 h-4" /><span>Mark {next}</span></>
                          }
                        </button>
                      ))}
                    </div>
                  )}

                  {isTerminal && (
                    <span className={`text-xs font-semibold px-3 py-2 rounded-xl w-full text-center ${
                      order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {order.orderStatus === 'Delivered' ? '✅ Completed' : '❌ Cancelled'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={updateStatus}
          updatingId={updatingId}
        />
      )}
    </div>
  )
}

export default Orders
