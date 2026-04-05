import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, ArrowLeft, Search, Plus, Minus, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import LanguageToggle from '../components/LanguageToggle'

const MenuPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { addToCart, increment, decrement, cartItems, totalItems, setIsDrawerOpen } = useCart()

  const CATEGORIES = ['All', 'Starters', 'Main Course', 'Breads', 'Rice', 'Desserts', 'Beverages']

  const getQty = (id) => cartItems.find((i) => i._id === id)?.quantity || 0

  const fetchItems = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/items')
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      if (data.success) setItems(data.data)
      else setError(t('somethingWrong'))
    } catch {
      setError(t('somethingWrong') + '. ' + t('tryAgain') + '.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

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
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t('loadingMenu')}</p>
        </div>
      </div>
    )
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-xs">
          <div className="text-6xl mb-4" role="img" aria-label="error">😕</div>
          <p className="text-gray-700 font-semibold text-lg mb-2">{t('somethingWrong')}</p>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={fetchItems}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all min-h-[48px]"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              aria-label="Go back"
              className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <p className="font-bold text-gray-900 leading-none">🍛 {t('appName')}</p>
              <p className="text-xs text-green-600 font-medium">{t('openNow')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageToggle />
            <button
              aria-label="Open cart"
              className="relative p-2 bg-orange-50 hover:bg-orange-100 active:bg-orange-200 rounded-xl transition-colors min-h-[44px] min-w-[44px]"
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
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-5 space-y-4">

        {/* ── Search Bar ── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm"
          />
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border min-h-[44px] ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-orange-50'
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? t('item') : t('items')}
          {activeCategory !== 'All' && ` ${t('in')} ${t(`categories.${activeCategory}`)}`}
        </p>

        {/* ── Empty State ── */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4" role="img" aria-label="search">🔍</div>
            <p className="text-gray-600 font-semibold text-lg">{t('noItemsFound')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('tryDifferent')}</p>
          </div>
        )}

        {/* ── Menu Item Cards ── */}
        <div className="space-y-3">
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
                <div className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36">
                  <img
                    src={item.image || 'https://placehold.co/150x150/FFF3E0/E65100?text=Food'}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/150x150/FFF3E0/E65100?text=Food' }}
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        {t('soldOut')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{item.name}</h3>
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full shrink-0 font-medium">
                        {t(`categories.${item.category}`) || item.category}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg sm:text-xl font-extrabold text-gray-900">₹{item.price}</span>

                    {!item.isAvailable ? (
                      <span className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-xl min-h-[44px] flex items-center">
                        {t('notAvailable')}
                      </span>
                    ) : qty === 0 ? (
                      <button
                        onClick={() => addToCart({ _id: item._id, name: item.name, price: item.price, image: item.image, category: item.category })}
                        className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 active:scale-95 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all min-h-[44px]"
                      >
                        <span>{t('add')}</span>
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => decrement(item._id)}
                          aria-label="Decrease quantity"
                          className="w-10 h-10 flex items-center justify-center bg-orange-100 hover:bg-orange-200 active:bg-orange-300 rounded-xl transition-colors"
                        >
                          <Minus className="w-4 h-4 text-orange-600" />
                        </button>
                        <span className="w-7 text-center font-extrabold text-gray-900 text-base">{qty}</span>
                        <button
                          onClick={() => increment(item._id)}
                          aria-label="Increase quantity"
                          className="w-10 h-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl transition-colors"
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

      {/* ── Sticky Bottom Bar ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3 pb-safe bg-white border-t border-gray-200 z-30">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full max-w-4xl mx-auto flex items-center justify-between bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-6 py-3.5 rounded-2xl transition-all min-h-[52px]"
          >
            <span className="bg-orange-600 px-2 py-0.5 rounded-lg text-sm">{totalItems} {totalItems === 1 ? t('item') : t('items')}</span>
            <span>{t('viewCart')}</span>
            <span>₹{cartItems.reduce((s, i) => s + i.price * i.quantity, 0)}</span>
          </button>
        </div>
      )}

    </div>
  )
}

export default MenuPage
