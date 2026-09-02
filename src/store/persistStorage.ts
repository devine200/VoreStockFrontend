import type { WebStorage } from 'redux-persist'

const REMEMBER_FLAG = 'vsk-remember-me'
const REMEMBER_EMAIL = 'vsk-remember-email'

export function getRememberMe() {
  return localStorage.getItem(REMEMBER_FLAG) === '1'
}

export function setRememberMe(enabled: boolean) {
  if (enabled) localStorage.setItem(REMEMBER_FLAG, '1')
  else localStorage.removeItem(REMEMBER_FLAG)
}

export function getRememberedEmail() {
  return localStorage.getItem(REMEMBER_EMAIL) ?? ''
}

export function setRememberedEmail(email: string | null) {
  if (email) localStorage.setItem(REMEMBER_EMAIL, email)
  else localStorage.removeItem(REMEMBER_EMAIL)
}

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
