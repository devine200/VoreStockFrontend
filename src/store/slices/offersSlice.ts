import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { INITIAL_OFFERS } from '@/api/fixtures'
import type { Offer, OfferStatus } from '@/types'

interface OffersState {
  items: Offer[]
}

const initialState: OffersState = {
  items: INITIAL_OFFERS,
}

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    setOfferStatus(state, action: PayloadAction<{ id: string; status: OfferStatus; amount?: number }>) {
      const offer = state.items.find((o) => o.id === action.payload.id)
      if (offer) {
        offer.status = action.payload.status
        if (action.payload.amount != null) offer.amount = action.payload.amount
      }
    },
  },
})

export const { setOfferStatus } = offersSlice.actions
export default offersSlice.reducer
