import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import { INITIAL_WALLET_TX } from '@/api/fixtures'
import type { WalletTx } from '@/types'

interface WalletState {
  available: number
  reserved: number
  escrow: number
  refundsDue: number
  transactions: WalletTx[]
  depositAddress: string
}

const initialState: WalletState = {
  available: 48250.42,
  reserved: 12400,
  escrow: 31980.5,
  refundsDue: 1240,
  transactions: INITIAL_WALLET_TX,
  depositAddress: '0x8a3f71c2e9d04b5a1f6e8c21b9a0d447e2c91af3',
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    holdEscrow(state, action: PayloadAction<{ amount: number; label: string }>) {
      state.available -= action.payload.amount
      state.escrow += action.payload.amount
      state.transactions.unshift({
        id: nanoid(),
        type: 'escrow_hold',
        amount: -action.payload.amount,
        asset: 'USD',
        status: 'completed',
        date: todayLabel(),
        label: 'Escrow hold',
        detail: action.payload.label,
      })
    },
    deposit(state, action: PayloadAction<number>) {
      state.available += action.payload
      state.transactions.unshift({
        id: nanoid(),
        type: 'deposit',
        amount: action.payload,
        asset: 'USDC (ERC20)',
        status: 'completed',
        date: todayLabel(),
        label: 'Deposit',
        detail: state.depositAddress.slice(0, 6) + '…' + state.depositAddress.slice(-4),
      })
    },
    withdraw(state, action: PayloadAction<{ amount: number; asset?: string; detail?: string }>) {
      const amount = action.payload.amount
      if (amount <= 0 || amount > state.available) return
      state.available -= amount
      state.transactions.unshift({
        id: nanoid(),
        type: 'withdrawal',
        amount: -amount,
        asset: action.payload.asset ?? 'USDC (ERC20)',
        status: 'pending',
        date: todayLabel(),
        label: 'Withdrawal',
        detail: action.payload.detail,
      })
    },
    rotateDepositAddress(state) {
      const hex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      state.depositAddress = `0x${hex}`
    },
  },
})

export const { holdEscrow, deposit, withdraw, rotateDepositAddress } = walletSlice.actions
export default walletSlice.reducer
