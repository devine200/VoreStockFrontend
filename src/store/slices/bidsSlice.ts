import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import { INITIAL_BIDS } from '@/api/fixtures'
import type { Bid, BidStatus } from '@/types'

interface BidsState {
  items: Bid[]
}

const initialState: BidsState = {
  items: INITIAL_BIDS,
}

const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    placeBid(
      state,
      action: PayloadAction<{ lotId: string; amount: number; maxBid?: number }>,
    ) {
      const existing = state.items.find(
        (b) => b.lotId === action.payload.lotId && (b.status === 'leading' || b.status === 'outbid' || b.status === 'active'),
      )
      if (existing) {
        existing.amount = action.payload.amount
        existing.maxBid = action.payload.maxBid
        existing.status = 'leading'
        existing.placedAt = new Date().toISOString()
      } else {
        state.items.unshift({
          id: nanoid(),
          lotId: action.payload.lotId,
          amount: action.payload.amount,
          maxBid: action.payload.maxBid,
          status: 'leading',
          placedAt: new Date().toISOString(),
        })
      }
    },
    setBidStatus(state, action: PayloadAction<{ id: string; status: BidStatus }>) {
      const bid = state.items.find((b) => b.id === action.payload.id)
      if (bid) bid.status = action.payload.status
    },
    settleWonBid(state, action: PayloadAction<string>) {
      const bid = state.items.find((b) => b.id === action.payload)
      if (bid) bid.status = 'won'
    },
  },
})

export const { placeBid, setBidStatus, settleWonBid } = bidsSlice.actions
export default bidsSlice.reducer
