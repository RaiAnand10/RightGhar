import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesStore {
  favorites: Set<string>
  showOnlyFavorites: boolean
  
  // Actions
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  setShowOnlyFavorites: (show: boolean) => void
  getFavoritesCount: () => number
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: new Set<string>(),
      showOnlyFavorites: false,

      toggleFavorite: (id: string) => {
        const { favorites } = get()
        const newFavorites = new Set(favorites)
        
        if (newFavorites.has(id)) {
          newFavorites.delete(id)
        } else {
          newFavorites.add(id)
        }
        
        set({ favorites: newFavorites })
      },

      isFavorite: (id: string) => {
        return get().favorites.has(id)
      },

      setShowOnlyFavorites: (show: boolean) => {
        set({ showOnlyFavorites: show })
      },

      getFavoritesCount: () => {
        return get().favorites.size
      },
    }),
    {
      name: 'rightghar-favorites',
      // Custom storage to handle Set serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const parsed = JSON.parse(str)
          return {
            ...parsed,
            state: {
              ...parsed.state,
              favorites: new Set(parsed.state.favorites || []),
            },
          }
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              favorites: Array.from(value.state.favorites || []),
            },
          }
          localStorage.setItem(name, JSON.stringify(toStore))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
