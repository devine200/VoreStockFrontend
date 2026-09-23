import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export type SearchFrequency = 'Hourly' | 'Daily' | 'Weekly'

export interface SavedSearch {
  id: string
  name: string
  query: string
  category: string
  filters: string[]
  results: number
  newResults: number
  emailAlerts: boolean
  frequency: SearchFrequency
  createdAt: string
  updatedAt: string
}

export type SavedSearchInput = {
  name: string
  query: string
  category?: string
  filters?: string[]
  frequency?: SearchFrequency
  emailAlerts?: boolean
}

interface WatchlistState {
  ids: string[]
  searches: SavedSearch[]
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString()
const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()

export const INITIAL_WATCHLIST_SEARCHES: SavedSearch[] = [
    {
      id: 'ss1',
      name: 'Heavy Equipment — CAT',
      query: 'caterpillar excavator bulldozer',
      category: 'Concentrates',
      filters: ['Category: Heavy Equipment', 'Condition: Used', 'Price: $20k–$150k'],
      results: 34,
      newResults: 7,
      emailAlerts: true,
      frequency: 'Daily',
      createdAt: daysAgo(4),
      updatedAt: hoursAgo(2),
    },
    {
      id: 'ss2',
      name: 'Refurb Laptops Pallets',
      query: 'refurbished laptops pallet thinkpad macbook',
      category: 'Electronics',
      filters: ['Category: Electronics', 'Min units: 50', 'Max landed: $70,000'],
      results: 18,
      newResults: 3,
      emailAlerts: true,
      frequency: 'Daily',
      createdAt: daysAgo(3),
      updatedAt: hoursAgo(2),
    },
    {
      id: 'ss3',
      name: 'Commercial Trucks EU',
      query: 'tractor unit lorry HGV mercedes volvo',
      category: 'Promotions/Bundles',
      filters: ['Category: Commercial Vehicles', 'Location: EU', 'Condition: Any'],
      results: 11,
      newResults: 0,
      emailAlerts: false,
      frequency: 'Weekly',
      createdAt: daysAgo(12),
      updatedAt: daysAgo(1),
    },
    {
      id: 'ss4',
      name: 'Apple iPhones Grade B/C',
      query: 'iphone grade B C returns pallet',
      category: 'Electronics',
      filters: ['Category: Electronics', 'Brand: Apple', 'Condition: Customer Returns'],
      results: 29,
      newResults: 12,
      emailAlerts: true,
      frequency: 'Hourly',
      createdAt: daysAgo(1),
      updatedAt: minutesAgo(30),
    },
]

const initialState: WatchlistState = {
  ids: ['lot-3', 'lot-1', 'lot-6', 'lot-2'],
  searches: INITIAL_WATCHLIST_SEARCHES,
}

function defaultFilters(category: string) {
  return [`Category: ${category}`]
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
    addSavedSearch(state, action: PayloadAction<SavedSearchInput>) {
      if (!state.searches) state.searches = []
      const category = action.payload.category ?? 'All'
      const now = new Date().toISOString()
      state.searches.unshift({
        id: nanoid(),
        name: action.payload.name,
        query: action.payload.query,
        category,
        filters: action.payload.filters?.length ? action.payload.filters : defaultFilters(category),
        results: 0,
        newResults: 0,
        emailAlerts: action.payload.emailAlerts ?? true,
        frequency: action.payload.frequency ?? 'Daily',
        createdAt: now,
        updatedAt: now,
      })
    },
    updateSavedSearch(
      state,
      action: PayloadAction<{ id: string } & SavedSearchInput>,
    ) {
      if (!state.searches) state.searches = []
      const search = state.searches.find((s) => s.id === action.payload.id)
      if (!search) return
      const category = action.payload.category ?? search.category
      search.name = action.payload.name
      search.query = action.payload.query
      search.category = category
      search.filters = action.payload.filters?.length ? action.payload.filters : defaultFilters(category)
      if (action.payload.frequency) search.frequency = action.payload.frequency
      if (action.payload.emailAlerts != null) search.emailAlerts = action.payload.emailAlerts
      search.updatedAt = new Date().toISOString()
    },
    toggleSearchAlerts(state, action: PayloadAction<string>) {
      const search = state.searches?.find((s) => s.id === action.payload)
      if (!search) return
      search.emailAlerts = !search.emailAlerts
    },
    markSearchViewed(state, action: PayloadAction<string>) {
      const search = state.searches?.find((s) => s.id === action.payload)
      if (!search) return
      search.newResults = 0
    },
    removeSavedSearch(state, action: PayloadAction<string>) {
      if (!state.searches) state.searches = []
      state.searches = state.searches.filter((s) => s.id !== action.payload)
    },
  },
})

export const {
  toggleWatch,
  clearWatchlist,
  addSavedSearch,
  updateSavedSearch,
  toggleSearchAlerts,
  markSearchViewed,
  removeSavedSearch,
} = watchlistSlice.actions
export default watchlistSlice.reducer
