import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  createMigrate,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import type { MigrationManifest, PersistedState } from 'redux-persist'
import { persistStorage } from './persistStorage'
import sessionReducer from './slices/sessionSlice'
import onboardingReducer from './slices/onboardingSlice'
import uiReducer from './slices/uiSlice'
import auctionsReducer from './slices/auctionsSlice'
import bidsReducer from './slices/bidsSlice'
import watchlistReducer, { INITIAL_WATCHLIST_SEARCHES } from './slices/watchlistSlice'
import walletReducer from './slices/walletSlice'
import offersReducer from './slices/offersSlice'
import {
  ordersReducer,
  notificationsReducer,
  disputesReducer,
  contractsReducer,
  profileReducer,
  ticketsReducer,
} from './slices/accountSlices'
import adminReducer from './slices/adminSlice'
import referralsReducer from './slices/referralsSlice'

const rootReducer = combineReducers({
  session: sessionReducer,
  onboarding: onboardingReducer,
  ui: uiReducer,
  auctions: auctionsReducer,
  bids: bidsReducer,
  watchlist: watchlistReducer,
  wallet: walletReducer,
  offers: offersReducer,
  orders: ordersReducer,
  notifications: notificationsReducer,
  disputes: disputesReducer,
  contracts: contractsReducer,
  profile: profileReducer,
  tickets: ticketsReducer,
  admin: adminReducer,
  referrals: referralsReducer,
})

const persistMigrations: MigrationManifest = {
  0: (state) => state as PersistedState,
  1: (state) => {
    const prev = (state ?? {}) as {
      watchlist?: { ids?: string[]; searches?: Array<Record<string, unknown>> }
    }
    const searches = prev.watchlist?.searches
    const legacySeed = searches?.some((s) => s.id === 'ss1' && s.name === 'Heavy equipment · US')
    const nextSearches = legacySeed
      ? INITIAL_WATCHLIST_SEARCHES
      : Array.isArray(searches)
        ? searches.map((s) => ({
            ...s,
            filters: s.filters ?? [`Category: ${String(s.category ?? 'All')}`],
            results: s.results ?? 0,
            frequency: s.frequency ?? 'Daily',
            updatedAt: s.updatedAt ?? s.createdAt ?? new Date().toISOString(),
          }))
        : INITIAL_WATCHLIST_SEARCHES
    return {
      ...(state as object),
      watchlist: {
        ...prev.watchlist,
        searches: nextSearches,
      },
    } as unknown as PersistedState
  },
  2: (state) => {
    const prev = (state ?? {}) as {
      watchlist?: { ids?: string[]; searches?: Array<Record<string, unknown>> }
    }
    const searches = prev.watchlist?.searches
    const needsReseed = searches?.some(
      (s) => s.id === 'ss1' && s.name !== 'Heavy Equipment — CAT',
    )
    return {
      ...(state as object),
      watchlist: {
        ...prev.watchlist,
        searches: needsReseed || !Array.isArray(searches) ? INITIAL_WATCHLIST_SEARCHES : searches,
      },
    } as unknown as PersistedState
  },
}

const persistConfig = {
  key: 'vsk',
  version: 2,
  storage: persistStorage,
  whitelist: ['session', 'onboarding', 'watchlist', 'bids', 'wallet', 'offers', 'profile', 'referrals'],
  migrate: createMigrate(persistMigrations, { debug: false }),
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
