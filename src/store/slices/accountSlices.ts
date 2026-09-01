import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTIFICATION_PREFS,
  INITIAL_DISPUTES,
  INITIAL_CONTRACTS,
  INITIAL_TICKETS,
} from '@/api/fixtures'
import type { Order, NotificationItem, NotificationPrefs, Dispute, Contract, SupportTicket } from '@/types'

interface OrdersState {
  items: Order[]
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: INITIAL_ORDERS } as OrdersState,
  reducers: {
    addOrderFromWin(state, action: PayloadAction<{ lotId: string; amount: number }>) {
      state.items.unshift({
        id: `ORD-${3400 + state.items.length}`,
        lotId: action.payload.lotId,
        status: 'awaiting_payment',
        amount: action.payload.amount,
        placedAt: new Date().toISOString(),
        progress: 14,
        checkpointDone: 1,
        checkpointTotal: 7,
        steps: [
          { label: 'Auction Won & Deposit Secured', done: true },
          { label: 'Awaiting Payment', done: false, current: true, at: 'In progress' },
          { label: 'Balance Payment Settled', done: false },
          { label: 'In Transit', done: false },
          { label: 'Delivered', done: false },
        ],
      })
    },
  },
})

interface NotificationsState {
  items: NotificationItem[]
  prefs: NotificationPrefs
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: INITIAL_NOTIFICATIONS,
    prefs: INITIAL_NOTIFICATION_PREFS,
  } as NotificationsState,
  reducers: {
    markRead(state, action: PayloadAction<string>) {
      const n = state.items.find((i) => i.id === action.payload)
      if (n) n.read = true
    },
    markAllRead(state) {
      state.items.forEach((n) => {
        n.read = true
      })
    },
    updateNotificationPrefs(state, action: PayloadAction<NotificationPrefs>) {
      state.prefs = action.payload
    },
  },
})

const disputesSlice = createSlice({
  name: 'disputes',
  initialState: { items: INITIAL_DISPUTES as Dispute[] },
  reducers: {
    openDispute(
      state,
      action: PayloadAction<{ orderId: string; lotId: string; reason: string; details: string; amount: number }>,
    ) {
      const now = new Date()
      const stamp = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now)
      const seq = 1040 + state.items.length + 1
      state.items.unshift({
        id: `DSP-${seq}`,
        orderId: action.payload.orderId,
        lotId: action.payload.lotId,
        reason: action.payload.reason,
        details: action.payload.details,
        amount: action.payload.amount,
        status: 'awaiting_response',
        openedAt: now.toISOString(),
        updatedAt: now.toISOString(),
        completedSteps: 0,
        events: [
          {
            actor: 'you',
            title: 'Dispute opened',
            at: stamp,
            body: action.payload.details || action.payload.reason,
          },
        ],
      })
    },
  },
})

const contractsSlice = createSlice({
  name: 'contracts',
  initialState: { items: INITIAL_CONTRACTS as Contract[] },
  reducers: {
    signContract(state, action: PayloadAction<string>) {
      const c = state.items.find((i) => i.id === action.payload)
      if (!c) return
      const stamp = new Date().toISOString()
      const buyer = c.parties.find((p) => p.role === 'Buyer')
      if (buyer && !buyer.signed) {
        buyer.signed = true
        buyer.signedAt = stamp
        c.activity.push({ label: 'Buyer signed — Northbridge Trading Ltd', at: stamp })
      }
      const allSigned = c.parties.every((p) => p.signed)
      if (allSigned) {
        c.status = 'active'
        c.activity.push({ label: 'All parties signed — contract active', at: stamp })
      }
      c.updatedAt = stamp
    },
  },
})

interface ProfileState {
  outbidAlerts: boolean
  loginAlerts: boolean
  twoFactor: boolean
  street: string
  city: string
  country: string
  categories: string[]
  regions: string[]
  conditions: string[]
  auctionTypes: string[]
  priceMin: number
  priceMax: number
  auctionDurations: string[]
  bidMin: number
  bidMax: number
  deliveryCountry: string
  shippingPrefs: string[]
  personalizedRecs: boolean
  savedSearchAlerts: boolean
  newListingAlerts: boolean
}

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    outbidAlerts: false,
    loginAlerts: true,
    twoFactor: true,
    street: '14 Broad Street, Lagos Island',
    city: 'Lagos',
    country: 'Nigeria',
    categories: ['Heavy Equipment', 'Electronics', 'Commercial Vehicles'],
    regions: ['West Africa', 'EU'],
    conditions: ['Used — Good', 'Customer Returns'],
    auctionTypes: ['Live Auction', 'Timed Auction'],
    priceMin: 1000,
    priceMax: 200000,
    auctionDurations: ['3-7 days', '7-14 days'],
    bidMin: 5000,
    bidMax: 150000,
    deliveryCountry: 'Nigeria',
    shippingPrefs: ['International freight', 'Seller arranges'],
    personalizedRecs: true,
    savedSearchAlerts: true,
    newListingAlerts: true,
  } as ProfileState,
  reducers: {
    updatePrefs(state, action: PayloadAction<Partial<ProfileState>>) {
      Object.assign(state, action.payload)
    },
  },
})

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: { items: INITIAL_TICKETS as SupportTicket[] },
  reducers: {
    addTicket(
      state,
      action: PayloadAction<{ subject: string; category: string; details: string }>,
    ) {
      const now = new Date()
      const at = `Today ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const seq = 2290 + state.items.length + 1
      state.items.unshift({
        id: `TCK-${seq}`,
        subject: action.payload.subject,
        category: action.payload.category,
        status: 'open',
        updatedAt: now.toISOString(),
        messages: [
          {
            from: 'you',
            body: action.payload.details,
            at,
          },
        ],
      })
    },
    replyToTicket(state, action: PayloadAction<{ id: string; body: string }>) {
      const ticket = state.items.find((t) => t.id === action.payload.id)
      if (!ticket) return
      const now = new Date()
      const at = `Today ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      ticket.messages.push({ from: 'you', body: action.payload.body, at })
      ticket.updatedAt = now.toISOString()
      if (ticket.status === 'awaiting_you') ticket.status = 'open'
    },
  },
})

export const { addOrderFromWin } = ordersSlice.actions
export const { markRead, markAllRead, updateNotificationPrefs } = notificationsSlice.actions
export const { openDispute } = disputesSlice.actions
export const { signContract } = contractsSlice.actions
export const { updatePrefs } = profileSlice.actions
export const { addTicket, replyToTicket } = ticketsSlice.actions

export const ordersReducer = ordersSlice.reducer
export const notificationsReducer = notificationsSlice.reducer
export const disputesReducer = disputesSlice.reducer
export const contractsReducer = contractsSlice.reducer
export const profileReducer = profileSlice.reducer
export const ticketsReducer = ticketsSlice.reducer
