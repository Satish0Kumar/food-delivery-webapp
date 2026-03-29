import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Search, ChevronRight } from 'lucide-react'

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Breads', 'Rice', 'Desserts', 'Beverages']

const MenuPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/items')
        const data = await res.json()
        if (data.success) {
          setItems(data.data)
        } else {
          setError('Failed to load menu')
        }
      } catch {
        setError('Could not connect to server. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  // Filter by category + search
  const filtered = items.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // ── Loading State ──
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

  // ── Error State ──
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
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
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
          {/* Cart icon — will be wired in Step 4 (CartContext) */}
          <button
            className="relative p-2 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="w-6 h-6 text-orange-500" />
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">

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
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-orange-50 hover:border-orange-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Result Count ── */}
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
          {filtered.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex transition-all ${
                item.isAvailable
                  ? 'border-gray-100 hover:shadow-md'
                  : 'border-gray-100 opacity-60'
              }`}
            >
              {/* Image */}
              <div className="relative shrink-0 w-28 h-28 md:w-36 md:h-36">
                <img
                  src={
                    item.image ||
                    'https://via.placeholder.com/150x150?text=Food'
                  }
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {/* Sold Out overlay */}
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
                    <h3 className="font-bold text-gray-900 text-base leading-snug">
                      {item.name}
                    </h3>
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full shrink-0 font-medium">
                      {item.category}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-extrabold text-gray-900">
                    ₹{item.price}
                  </span>
                  {/* Add to Cart — will be fully wired in Step 3 (CartContext) */}
                  {item.isAvailable ? (
                    <button
                      className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      <span>Add</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-xl">
                      Not Available
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default MenuPage
