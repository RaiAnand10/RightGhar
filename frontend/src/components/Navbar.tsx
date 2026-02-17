import { useState, useEffect } from 'react'
import { useFavoritesStore } from '../stores/useFavoritesStore'
import { usePropertyStore } from '../stores/usePropertyStore'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { favorites, showOnlyFavorites, setShowOnlyFavorites } = useFavoritesStore()
  const { compareList, setCompareOpen, viewMode, setViewMode } = usePropertyStore()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
              isScrolled ? 'bg-emerald-600' : 'bg-white/20 backdrop-blur-sm'
            }`}>
              <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isScrolled ? 'text-white' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div>
              <span className={`font-display text-xl sm:text-2xl font-semibold ${isScrolled ? 'text-stone-900' : 'text-white'}`}>
                RightGhar
              </span>
              <p className={`text-[10px] sm:text-xs tracking-wide hidden sm:block ${isScrolled ? 'text-stone-500' : 'text-white/70'}`}>
                Pick right. Live better.
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('properties-section')}
              className={`text-sm font-medium transition-colors ${
                isScrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => scrollToSection('value-proposition')}
              className={`text-sm font-medium transition-colors ${
                isScrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white'
              }`}
            >
              Why RightGhar
            </button>
            <button
              onClick={() => scrollToSection('footer')}
              className={`text-sm font-medium transition-colors ${
                isScrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white'
              }`}
            >
              Contact
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* AIGHAR Button */}
            <button
              onClick={() => {
                setViewMode('ai')
                scrollToSection('properties-section')
              }}
              className={`relative p-2 rounded-lg transition-colors ${
                viewMode === 'ai'
                  ? 'bg-teal-100 ring-2 ring-teal-300'
                  : isScrolled ? 'hover:bg-stone-100' : 'hover:bg-white/10'
              }`}
              title="Open AIGHAR — AI Property Assistant"
            >
              <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${viewMode === 'ai' ? 'text-teal-600' : isScrolled ? 'text-stone-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </button>

            {/* Favorites Badge */}
            <button
              onClick={() => {
                setShowOnlyFavorites(!showOnlyFavorites)
                scrollToSection('properties-section')
              }}
              className={`relative p-2 rounded-lg transition-colors ${
                showOnlyFavorites 
                  ? 'bg-rose-100 ring-2 ring-rose-300' 
                  : isScrolled ? 'hover:bg-stone-100' : 'hover:bg-white/10'
              }`}
              title={showOnlyFavorites ? 'Show all properties' : 'Show favorites only'}
            >
              <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${showOnlyFavorites ? 'text-rose-600' : isScrolled ? 'text-stone-600' : 'text-white'}`} fill={showOnlyFavorites ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {favorites.size > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-rose-500 text-white text-[10px] sm:text-xs font-medium rounded-full flex items-center justify-center">
                  {favorites.size}
                </span>
              )}
            </button>

            {/* Compare Badge */}
            <button
              onClick={() => setCompareOpen(true)}
              className={`relative p-2 rounded-lg transition-colors ${
                isScrolled ? 'hover:bg-stone-100' : 'hover:bg-white/10'
              }`}
              title="Compare"
            >
              <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isScrolled ? 'text-stone-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 text-white text-[10px] sm:text-xs font-medium rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isScrolled ? 'hover:bg-stone-100' : 'hover:bg-white/10'
              }`}
            >
              <svg className={`w-6 h-6 ${isScrolled ? 'text-stone-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-stone-200/50">
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => scrollToSection('properties-section')}
                className="px-4 py-2 text-left text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Properties
              </button>
              <button
                onClick={() => scrollToSection('value-proposition')}
                className="px-4 py-2 text-left text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Why RightGhar
              </button>
              <button
                onClick={() => scrollToSection('footer')}
                className="px-4 py-2 text-left text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
