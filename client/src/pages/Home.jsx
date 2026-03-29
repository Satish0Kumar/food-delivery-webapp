import { useNavigate } from 'react-router-dom'
import { Phone, MapPin, Clock, ChevronRight, Star, Bike } from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Clock,
      title: 'Fast Delivery',
      desc: 'Hot food delivered within 30–45 minutes',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      icon: Star,
      title: 'Fresh & Tasty',
      desc: 'Made fresh on every order — no pre-cooked food',
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      icon: Bike,
      title: 'Local Delivery',
      desc: 'Serving nearby villages and hatchery areas',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-bold text-gray-900">Raja Biryani</span>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <span>Order Now</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-8">

          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              🔥 Hot &amp; Fresh — Order Now
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Delicious Food<br />
              <span className="text-yellow-200">Delivered to Your Door</span>
            </h1>
            <p className="text-orange-100 text-lg mb-8 max-w-md">
              Authentic biryani, KFC-style chicken &amp; more — freshly made and
              delivered hot to your village or hatchery.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => navigate('/menu')}
                className="flex items-center justify-center space-x-2 bg-white text-orange-600 font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <span>View Menu</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              <a
                href="tel:+919999999999"
                className="flex items-center justify-center space-x-2 bg-orange-600/40 hover:bg-orange-600/60 text-white font-semibold px-8 py-3 rounded-2xl transition-all"
              >
                <Phone className="w-5 h-5" />
                <span>Call to Order</span>
              </a>
            </div>
          </div>

          {/* Emoji Illustration */}
          <div className="text-[120px] md:text-[160px] leading-none select-none drop-shadow-xl">
            🍛
          </div>

        </div>
      </div>

      {/* ── Feature Cards ── */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start space-x-4"
            >
              <div className={`${f.bg} p-3 rounded-xl shrink-0`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── About / Info Section ── */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-4">
            <h2 className="text-white font-bold text-lg">📍 Find Us</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="flex items-start space-x-3">
              <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Call Us</p>
                <a
                  href="tel:+919999999999"
                  className="text-gray-900 font-bold text-lg hover:text-orange-500 transition-colors"
                >
                  +91 99999 99999
                </a>
                <p className="text-xs text-gray-400 mt-0.5">9 AM – 9 PM, All days</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-green-50 p-2 rounded-lg shrink-0">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Delivery Area</p>
                <p className="text-gray-900 font-semibold">Nearby Villages</p>
                <p className="text-xs text-gray-400 mt-0.5">Hatchery &amp; surrounding areas</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-orange-50 p-2 rounded-lg shrink-0">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Delivery Time</p>
                <p className="text-gray-900 font-semibold">30–45 minutes</p>
                <p className="text-xs text-gray-400 mt-0.5">After order confirmation</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Sticky Bottom CTA (mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 px-4 py-3 z-50">
        <button
          onClick={() => navigate('/menu')}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all"
        >
          <span>🍛 Order Now</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* bottom padding so sticky CTA doesn't overlap content on mobile */}
      <div className="h-20 md:hidden" />

    </div>
  )
}

export default Home
