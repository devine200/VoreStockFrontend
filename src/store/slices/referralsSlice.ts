import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { REFERRAL_CODE, REFERRAL_SUMMARY } from '@/api/fixtures'

interface ReferralsState {
  code: string
  earned: number
  used: number
  available: number
}

const initialState: ReferralsState = {
  code: REFERRAL_CODE,
  earned: REFERRAL_SUMMARY.earned,
  used: REFERRAL_SUMMARY.used,
  available: REFERRAL_SUMMARY.available,
}

const referralsSlice = createSlice({
  name: 'referrals',
  initialState,
  reducers: {
    applyFreightCredit(state, action: PayloadAction<{ amount: number }>) {
      const amount = Math.min(Math.max(0, action.payload.amount), state.available)
      if (amount <= 0) return
      state.available -= amount
      state.used += amount
    },
  },
})

export const { applyFreightCredit } = referralsSlice.actions
export default referralsSlice.reducer
