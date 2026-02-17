import { create } from 'zustand'
import { fetchFavorites, addFavorite, removeFavorite } from '../api'

interface FavoritesStore {
  favorites: Set<string>
  showOnlyFavorites: boolean
  loaded: boolean

  // Actions
  loadFavorites: () => Promise<void>
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  setShowOnlyFavorites: (show: boolean) => void
  getFavoritesCount: () => number
}

export const useFavoritesStore = create<FavoritesStore>()(
  (set, get) => ({
    favorites: new Set<string>(),
    showOnlyFavorites: false,
    loaded: false,

    loadFavorites: async () => {
      if (get().loaded) return
      try {
        const slugs = await fetchFavorites()
        set({ favorites: new Set(slugs), loaded: true })
      } catch {
        set({ loaded: true })
      }
    },

    toggleFavorite: (id: string) => {
      const { favorites } = get()
      const newFavorites = new Set(favorites)

      if (newFavorites.has(id)) {
        newFavorites.delete(id)
        removeFavorite(id).catch(() => {})
      } else {
        newFavorites.add(id)
        addFavorite(id).catch(() => {})
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
  })
)
