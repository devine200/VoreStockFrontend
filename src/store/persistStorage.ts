import type { WebStorage } from 'redux-persist'

/**
 * Vite ESM interop often turns `redux-persist/lib/storage` into a module
 * object without getItem/setItem. Use a thin localStorage wrapper instead.
 */
export const persistStorage: WebStorage = {
  getItem(key) {
    return Promise.resolve(localStorage.getItem(key))
  },
  setItem(key, value) {
    localStorage.setItem(key, value)
    return Promise.resolve()
  },
  removeItem(key) {
    localStorage.removeItem(key)
    return Promise.resolve()
  },
}
