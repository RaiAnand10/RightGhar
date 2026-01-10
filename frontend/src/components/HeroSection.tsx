import { usePropertyStore } from '../stores/usePropertyStore'

export function HeroSection() {
  const { toggleFilter, clearFilters } = usePropertyStore()

  const handleCityClick = (city: string) => {
    if (city === 'all') {
      clearFilters()
    } else {
      // Clear existing city filters and set the new one
      clearFilters()
      toggleFilter('city', city)
    }
    // Scroll to properties section
    document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20 lg:pt-32 lg:pb-28">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="text-xs sm:text-sm text-white/90 font-medium">One Platform for New Launch & Under-Construction Homes</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4 sm:mb-6">
            Find Your Right Ghar            <span className="block text-teal-400">Before Anyone Else</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-8 sm:mb-10 px-4">
            Filter from 100+ new launch and under construction projects, compare them, 
            get price history and reviews - all in one place.
          </p>

          {/* Quick City Selection */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12 px-2">
            <button
              onClick={() => handleCityClick('all')}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-teal-500 text-white text-sm sm:text-base font-medium hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/25"
            >
              Explore All Properties
            </button>
            <button
              onClick={() => handleCityClick('Hyderabad')}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm sm:text-base font-medium hover:bg-white/20 transition-colors"
            >
              Hyderabad
            </button>
            <button
              onClick={() => handleCityClick('Bangalore')}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm sm:text-base font-medium hover:bg-white/20 transition-colors"
            >
              Bangalore
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="font-display text-2xl sm:text-4xl md:text-5xl text-white mb-1 sm:mb-2">100+</div>
            <div className="text-[10px] sm:text-sm text-stone-400 uppercase tracking-wider">Projects</div>
          </div>
          <div className="text-center border-l border-white/10">
            <div className="font-display text-2xl sm:text-4xl md:text-5xl text-white mb-1 sm:mb-2">20+</div>
            <div className="text-[10px] sm:text-sm text-stone-400 uppercase tracking-wider">Builders</div>
          </div>
          <div className="text-center border-l border-white/10">
            <div className="font-display text-2xl sm:text-4xl md:text-5xl text-white mb-1 sm:mb-2">2</div>
            <div className="text-[10px] sm:text-sm text-stone-400 uppercase tracking-wider">Cities</div>
          </div>
          <div className="text-center border-l border-white/10">
            <div className="font-display text-2xl sm:text-4xl md:text-5xl text-white mb-1 sm:mb-2">50+</div>
            <div className="text-[10px] sm:text-sm text-stone-400 uppercase tracking-wider">Locations</div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#fafaf9"/>
        </svg>
      </div>
    </section>
  )
}
