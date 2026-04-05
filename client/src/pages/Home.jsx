import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, MapPin, Clock, ChevronRight, Star, Bike } from 'lucide-react'
import LanguageToggle from '../components/LanguageToggle'

const Home = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const features = [
    { icon: Clock, title: t('fastDelivery'), desc: t('fastDeliveryDesc'), color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Star,  title: t('freshTasty'),  desc: t('freshTastyDesc'),  color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { icon: Bike,  title: t('localDelivery'), desc: t('localDeliveryDesc'), color: 'text-green-500', bg: 'bg-green-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl" role="img" aria-label="food">🍽️</span>
            <span className="text-xl font-bold text-gray-900">{t('appName')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageToggle />
            <button
              onClick={() => navigate('/menu')}
              className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all min-h-[44px]"
            >
              <span>{t('orderNow')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {t('hotFresh')}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              {t('tagline').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h1>
            <p className="text-orange-100 text-base md:text-lg mb-8 max-w-md">
              {t('subTagline')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => navigate('/menu')}
                className="flex items-center justify-center space-x-2 bg-white text-orange-600 font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all min-h-[52px]"
              >
                <span>{t('viewMenu')}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              <a
                href="tel:+919999999999"
                className="flex items-center justify-center space-x-2 bg-orange-600/40 hover:bg-orange-600/60 active:bg-orange-700/60 text-white font-semibold px-8 py-3 rounded-2xl transition-all min-h-[52px]"
              >
                <Phone className="w-5 h-5" />
                <span>{t('callToOrder')}</span>
              </a>
            </div>
          </div>
          <div className="text-[100px] md:text-[160px] leading-none select-none drop-shadow-xl" role="img" aria-label="biryani">🍛</div>
        </div>
      </div>

      {/* ── Feature Cards ── */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start space-x-4">
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
      <div className="max-w-5xl mx-auto px-4 pb-28 md:pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-4">
            <h2 className="text-white font-bold text-lg">{t('findUs')}</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('callUs')}</p>
                <a href="tel:+919999999999" className="text-gray-900 font-bold text-lg hover:text-orange-500 transition-colors min-h-[44px] flex items-center">
                  +91 99999 99999
                </a>
                <p className="text-xs text-gray-400 mt-0.5">{t('openHours')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-50 p-2 rounded-lg shrink-0">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('deliveryArea')}</p>
                <p className="text-gray-900 font-semibold">{t('nearbyVillages')}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('hatcheryAreas')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-orange-50 p-2 rounded-lg shrink-0">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('deliveryTime')}</p>
                <p className="text-gray-900 font-semibold">{t('deliveryTimeVal')}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('afterConfirmation')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom CTA (mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 px-4 py-3 pb-safe z-50">
        <button
          onClick={() => navigate('/menu')}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all min-h-[52px]"
        >
          <span>🍛 {t('orderNow')}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  )
}

export default Home
