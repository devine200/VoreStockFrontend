import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { DEMO_USER } from '@/api/fixtures'
import { initialsFromName } from '@/session/googleAuth'
import type { User, UserRole } from '@/types'

interface SessionState {
  user: User | null
  hydrated: boolean
}

const initialState: SessionState = {
  user: null,
  hydrated: true,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    loginDummy(
      state,
      action: PayloadAction<{ email: string; name?: string; role?: UserRole; referredBy?: string }>,
    ) {
      const name = action.payload.name || DEMO_USER.name
      state.user = {
        ...DEMO_USER,
        email: action.payload.email || DEMO_USER.email,
        name,
        role: action.payload.role || 'user',
        avatarInitials: initialsFromName(name),
        referredBy: action.payload.referredBy,
      }
    },
    registerUser(
      state,
      action: PayloadAction<{ email: string; name: string; phone?: string; referredBy?: string }>,
    ) {
      const name = action.payload.name.trim() || 'New Buyer'
      state.user = {
        id: `u-${Date.now()}`,
        name,
        email: action.payload.email.trim(),
        role: 'user',
        phone: action.payload.phone?.trim() || undefined,
        tier: 1,
        kycStatus: 'unverified',
        kybStatus: 'unverified',
        avatarInitials: initialsFromName(name),
        authProvider: 'google',
        referredBy: action.payload.referredBy,
      }
    },
    logout(state) {
      state.user = null
    },
    setRole(state, action: PayloadAction<UserRole>) {
      if (state.user) state.user.role = action.payload
    },
    updateProfile(state, action: PayloadAction<Partial<User>>) {
      if (!state.user) return
      Object.assign(state.user, action.payload)
      if (action.payload.name) {
        state.user.avatarInitials = action.payload.name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      }
    },
  },
})

export const { loginDummy, registerUser, logout, setRole, updateProfile } = sessionSlice.actions
export default sessionSlice.reducer
