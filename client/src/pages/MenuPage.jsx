import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Search, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Breads', 'Rice', 'Desserts', 'Beverages']

const MenuPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { addToCart, increment, decrement, cartItems, totalItems, setIsDrawerOpen } = useCart()

  // Get qty of a specific item in cart
  const getQty = (id) => cartItems.find((i) => i._id === id)?.quantity || 0

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/items')
        const data = await res.json()
        if (data.success) setItems(data.data)
        else setError('Failed to load menu')
      } catch {
        setError('Could not connect to server. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const filtered = items.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍽️</div>
          <p className="text-gray-500 font-medium">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-700 font-semibold text-lg mb-2">Something went wrong</p>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <p className="font-bold text-gray-900 leading-none">🍛 Raja Biryani</p>
              <p className="text-xs text-green-600 font-medium">● Open Now</p>
            </div>
          </div>

          {/* Cart icon with live badge */}
          <button
            className="relative p-2 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
            onClick={() => setIsDrawerOpen(true)}
          >
            <ShoppingCart className="w-6 h-6 text-orange-500" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-5">

        {/* ── Search Bar ── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search biryani, chicken..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm"
          />
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-orange-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          {activeCategory !== 'All' && ` in ${activeCategory}`}
        </p>

        {/* ── Empty State ── */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 font-semibold text-lg">No items found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different category or search</p>
          </div>
        )}

        {/* ── Menu Item Cards ── */}
        <div className="space-y-4">
          {filtered.map((item) => {
            const qty = getQty(item._id)
            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex transition-all ${
                  item.isAvailable ? 'border-gray-100 hover:shadow-md' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Image */}
                <div className="relative shrink-0 w-28 h-28 md:w-36 md:h-36">
                  <img
                    src={item.image || 'https://via.placeholder.com/150x150?text=Food'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-base leading-snug">{item.name}</h3>
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full shrink-0 font-medium">
                        {item.category}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-extrabold text-gray-900">₹{item.price}</span>

                    {/* ── Add / Qty Control ── */}
                    {!item.isAvailable ? (
                      <span className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-xl">
                        Not Available
                      </span>
                    ) : qty === 0 ? (
                      // ADD button — shown when item not in cart
                      <button
                        onClick={() => addToCart({
                          _id: item._id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          category: item.category,
                        })}
                        className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all"
                      >
                        <span>Add</span>
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      // QTY CONTROLS — shown when item is already in cart
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => decrement(item._id)}
                          className="w-8 h-8 flex items-center justify-center bg-orange-100 hover:bg-orange-200 rounded-xl transition-colors"
                        >
                          <Minus className="w-4 h-4 text-orange-600" />
                        </button>
                        <span className="w-6 text-center font-extrabold text-gray-900">{qty}</span>
                        <button
                          onClick={() => increment(item._id)}
                          className="w-8 h-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Sticky Bottom Bar — visible when cart has items ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-gray-200 z-30">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full max-w-4xl mx-auto flex items-center justify-between bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all"
          >
            <span className="bg-orange-600 px-2 py-0.5 rounded-lg text-sm">{totalItems} items</span>
            <span>View Cart</span>
            <span>₹{cartItems.reduce((s, i) => s + i.price * i.quantity, 0)}</span>
          </button>
        </div>
      )}

    </div>
  )
}

export default MenuPage
