import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export interface SavedSearch {
  id: string
  name: string
  query: string
  category: string
  newResults: number
  emailAlerts: boolean
  createdAt: string
}

interface WatchlistState {
  ids: string[]
  searches: SavedSearch[]
}

const initialState: WatchlistState = {
  ids: ['lot-3', 'lot-1', 'lot-6', 'lot-2'],
  searches: [
    {
      id: 'ss1',
      name: 'Heavy equipment · US',
      query: 'excavator OR tractor',
      category: 'Concentrates',
      newResults: 8,
      emailAlerts: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ss2',
      name: 'CBD cases under $5k',
      query: 'CBD case',
      category: 'Edibles',
      newResults: 5,
      emailAlerts: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ss3',
      name: 'Electronics pallets',
      query: 'iphone OR dyson',
      category: 'Electronics',
      newResults: 6,
      emailAlerts: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ss4',
      name: 'EU fleet surplus',
      query: 'Mercedes OR Actros',
      category: 'Promotions/Bundles',
      newResults: 3,
      emailAlerts: true,
      createdAt: new Date().toISOString(),
    },
  ],
}

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    toggleWatch(state, action: PayloadAction<string>) {
      const i = state.ids.indexOf(action.payload)
      if (i >= 0) state.ids.splice(i, 1)
      else state.ids.unshift(action.payload)
    },
    clearWatchlist(state) {
      state.ids = []
    },
    addSavedSearch(
      state,
      action: PayloadAction<{ name: string; query: string; category?: string }>,
    ) {
      if (!state.searches) state.searches = []
      state.searches.unshift({
        id: nanoid(),
        name: action.payload.name,
        query: action.payload.query,
        category: action.payload.category ?? 'All',
        newResults: 0,
        emailAlerts: true,
        createdAt: new Date().toISOString(),
      })
    },
    removeSavedSearch(state, action: PayloadAction<string>) {
      if (!state.searches) state.searches = []
      state.searches = state.searches.filter((s) => s.id !== action.payload)
    },
  },
})

export const { toggleWatch, clearWatchlist, addSavedSearch, removeSavedSearch } = watchlistSlice.actions
export default watchlistSlice.reducer
