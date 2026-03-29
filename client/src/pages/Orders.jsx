import { useState, useEffect } from 'react'
import { RefreshCw, ShoppingCart } from 'lucide-react'

const STATUS_OPTIONS = [
  'Pending',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
]

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')

  const token = localStorage.getItem('token')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setOrders(data.data)
    } catch (err) {
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await response.json()
      if (data.success) {
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId
              ? { ...order, orderStatus: newStatus }
              : order
          )
        )
      }
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Preparing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Out for Delivery': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.orderStatus === filterStatus)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-600 mt-1">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 flex-wrap gap-2">
        {['All', ...STATUS_OPTIONS].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              filterStatus === status
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status}
            {status !== 'All' && (
              <span className="ml-2 text-xs">
                ({orders.filter(o => o.orderStatus === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-bold text-gray-500">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {order.customerName}
                    </p>
                    <p className="text-sm text-gray-500">📞 {order.phone}</p>
                    <p className="text-sm text-gray-500">📍 {order.address}</p>
                  </div>

                  {/* Items */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                      >
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end space-y-3 min-w-[160px]">
                  {/* Amount */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{order.totalAmount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.paymentMethod} • {new Date(order.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    disabled={
                      updatingId === order._id ||
                      order.orderStatus === 'Delivered' ||
                      order.orderStatus === 'Cancelled'
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  {updatingId === order._id && (
                    <p className="text-xs text-blue-600 animate-pulse">
                      Updating...
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders