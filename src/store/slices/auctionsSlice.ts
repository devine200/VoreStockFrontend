import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { LOTS } from '@/api/fixtures'
import type { Lot } from '@/types'

interface AuctionsState {
  lots: Lot[]
  searchQuery: string
}

const initialState: AuctionsState = {
  lots: LOTS,
  searchQuery: '',
}

const auctionsSlice = createSlice({
  name: 'auctions',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    updateLotBid(state, action: PayloadAction<{ lotId: string; amount: number }>) {
      const lot = state.lots.find((l) => l.id === action.payload.lotId)
      if (lot) {
        lot.currentBid = action.payload.amount
        lot.bidCount += 1
      }
    },
  },
})

export const { setSearchQuery, updateLotBid } = auctionsSlice.actions
export default auctionsSlice.reducer
