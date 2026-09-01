import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import { persistStorage } from './persistStorage'
import sessionReducer from './slices/sessionSlice'
import onboardingReducer from './slices/onboardingSlice'
import uiReducer from './slices/uiSlice'
import auctionsReducer from './slices/auctionsSlice'
import bidsReducer from './slices/bidsSlice'
import watchlistReducer from './slices/watchlistSlice'
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
})

const persistConfig = {
  key: 'vsk',
  storage: persistStorage,
  whitelist: ['session', 'onboarding', 'watchlist', 'bids', 'wallet', 'offers', 'profile'],
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
