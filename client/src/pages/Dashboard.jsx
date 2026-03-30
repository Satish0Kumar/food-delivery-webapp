import { useState, useEffect } from 'react'
import { ShoppingBag, CheckCircle, Clock, TrendingUp, ChefHat, Bike, AlertCircle } from 'lucide-react'
import { io } from 'socket.io-client'

const STATUS_COLORS = {
  Placed:            'bg-yellow-100 text-yellow-800',
  Preparing:         'bg-purple-100 text-purple-800',
  'Out for Delivery':'bg-orange-100 text-orange-800',
  Delivered:         'bg-green-100 text-green-800',
  Cancelled:         'bg-red-100 text-red-800',
}

const Dashboard = () => {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const token = localStorage.getItem('token')

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setOrders(data.data)
      else setError('Failed to load orders')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] })
    socket.on('new-order', () => fetchOrders())
    return () => socket.disconnect()
  }, [])

  const today          = new Date().toDateString()
  const todayOrders    = orders.filter((o) => new Date(o.createdAt).toDateString() === today)
  const todayRevenue   = todayOrders.reduce((s, o) => s + o.totalAmount, 0)
  const placedOrders   = orders.filter((o) => o.orderStatus === 'Placed').length
  const deliveredToday = todayOrders.filter((o) => o.orderStatus === 'Delivered').length
  const totalRevenue   = orders.reduce((s, o) => s + o.totalAmount, 0)
  const inProgress     = orders.filter((o) => ['Preparing', 'Out for Delivery'].includes(o.orderStatus)).length

  const stats = [
    { title: "Today's Orders", value: todayOrders.length, sub: `${orders.length} total`,        icon: ShoppingBag, iconColor:'text-blue-600',   bg:'bg-blue-50',   border:'border-blue-100'   },
    { title: 'New Orders',     value: placedOrders,       sub: `${inProgress} in progress`,     icon: Clock,       iconColor:'text-yellow-600', bg:'bg-yellow-50', border:'border-yellow-100' },
    { title: 'Delivered Today',value: deliveredToday,     sub: 'completed today',                icon: CheckCircle, iconColor:'text-green-600',  bg:'bg-green-50',  border:'border-green-100'  },
    { title: "Today's Revenue",value: `₹${todayRevenue}`, sub: `₹${totalRevenue} all-time`,      icon: TrendingUp,  iconColor:'text-orange-600', bg:'bg-orange-50', border:'border-orange-100' },
  ]

  const activeOrders = orders
    .filter((o) => !['Delivered','Cancelled'].includes(o.orderStatus))
    .slice(0, 8)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's today's overview.</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2 text-right">
          <p className="text-xs text-gray-400">Today</p>
          <p className="font-bold text-orange-600 text-sm">
            {new Date().toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short' })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.title} className={`bg-white rounded-2xl border ${stat.border} shadow-sm p-5 hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stat.bg} ${stat.iconColor}`}>Live</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{stat.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Active Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-gray-900">Active Orders</h3>
          </div>
          <span className="text-sm text-gray-400">{activeOrders.length} needing attention</span>
        </div>
        {activeOrders.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">All caught up!</p>
            <p className="text-gray-400 text-sm mt-1">No active orders right now</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID','Customer','Items','Amount','Status','Time'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-5 py-4 font-mono text-sm font-bold text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-[180px] truncate">
                      {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900 text-sm">₹{order.totalAmount}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { status:'Placed',            icon:Clock,        color:'text-yellow-600', bg:'bg-yellow-50' },
          { status:'Preparing',         icon:ChefHat,      color:'text-purple-600', bg:'bg-purple-50' },
          { status:'Out for Delivery',  icon:Bike,         color:'text-orange-600', bg:'bg-orange-50' },
          { status:'Delivered',         icon:CheckCircle,  color:'text-green-600',  bg:'bg-green-50'  },
          { status:'Cancelled',         icon:AlertCircle,  color:'text-red-600',    bg:'bg-red-50'    },
        ].map(({ status, icon: Icon, color, bg }) => (
          <div key={status} className={`${bg} rounded-2xl p-4 text-center`}>
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <p className={`text-2xl font-extrabold ${color}`}>
              {orders.filter((o) => o.orderStatus === status).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{status}</p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Dashboard
