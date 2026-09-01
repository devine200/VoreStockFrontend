import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { DEMO_USER } from '@/api/fixtures'
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
    loginDummy(state, action: PayloadAction<{ email: string; name?: string; role?: UserRole }>) {
      state.user = {
        ...DEMO_USER,
        email: action.payload.email || DEMO_USER.email,
        name: action.payload.name || DEMO_USER.name,
        role: action.payload.role || 'user',
        avatarInitials: (action.payload.name || DEMO_USER.name)
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
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

export const { loginDummy, logout, setRole, updateProfile } = sessionSlice.actions
export default sessionSlice.reducer
