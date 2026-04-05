import { useTranslation } from 'react-i18next'

const LanguageToggle = ({ className = '' }) => {
  const { i18n } = useTranslation()
  const isTelugu = i18n.language === 'te'

  const toggle = () => {
    const next = isTelugu ? 'en' : 'te'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      title={isTelugu ? 'Switch to English' : 'తెలుగులోకి మార్చు'}
      className={`flex items-center space-x-1 border-2 rounded-xl px-3 py-1.5 text-sm font-bold transition-all min-h-[44px] ${
        isTelugu
          ? 'border-orange-500 bg-orange-500 text-white'
          : 'border-orange-200 bg-white text-orange-600 hover:bg-orange-50'
      } ${className}`}
    >
      <span className="text-base">{isTelugu ? 'EN' : 'తె'}</span>
    </button>
  )
}

export default LanguageToggle
