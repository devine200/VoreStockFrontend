import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  ADMIN_AUCTIONS,
  ADMIN_AUDIT,
  ADMIN_BUYERS,
  ADMIN_FEES,
  ADMIN_LOTS,
  ADMIN_ORDERS,
  ADMIN_PROXIES,
  ADMIN_REFERRALS,
  ADMIN_REGULATION,
  ADMIN_SETTLEMENTS,
  ADMIN_SHIPMENTS,
  ADMIN_SYNCS,
  ADMIN_TICKETS,
  ADMIN_TIERS,
  ADMIN_TPL,
  ADMIN_TRANSACTIONS,
  ADMIN_USERS,
  ADMIN_VERIFICATIONS,
  ADMIN_WITHDRAWALS,
} from '@/api/adminFixtures'
import type { AdminDateRange, AdminNote, AdminUserRecord } from '@/types/admin'

interface AdminState {
  dateRange: AdminDateRange
  verifications: typeof ADMIN_VERIFICATIONS
  settlements: typeof ADMIN_SETTLEMENTS
  proxies: typeof ADMIN_PROXIES
  withdrawals: typeof ADMIN_WITHDRAWALS
  tpl: typeof ADMIN_TPL
  tickets: typeof ADMIN_TICKETS
  buyers: typeof ADMIN_BUYERS
  regulation: typeof ADMIN_REGULATION
  auctions: typeof ADMIN_AUCTIONS
  lots: typeof ADMIN_LOTS
  orders: typeof ADMIN_ORDERS
  shipments: typeof ADMIN_SHIPMENTS
  transactions: typeof ADMIN_TRANSACTIONS
  referrals: typeof ADMIN_REFERRALS
  fees: typeof ADMIN_FEES
  tiers: typeof ADMIN_TIERS
  syncs: typeof ADMIN_SYNCS
  audit: typeof ADMIN_AUDIT
  users: typeof ADMIN_USERS
}

const initialState: AdminState = {
  dateRange: 'today',
  verifications: ADMIN_VERIFICATIONS,
  settlements: ADMIN_SETTLEMENTS,
  proxies: ADMIN_PROXIES,
  withdrawals: ADMIN_WITHDRAWALS,
  tpl: ADMIN_TPL,
  tickets: ADMIN_TICKETS,
  buyers: ADMIN_BUYERS,
  regulation: ADMIN_REGULATION,
  auctions: ADMIN_AUCTIONS,
  lots: ADMIN_LOTS,
  orders: ADMIN_ORDERS,
  shipments: ADMIN_SHIPMENTS,
  transactions: ADMIN_TRANSACTIONS,
  referrals: ADMIN_REFERRALS,
  fees: ADMIN_FEES,
  tiers: ADMIN_TIERS,
  syncs: ADMIN_SYNCS,
  audit: ADMIN_AUDIT,
  users: ADMIN_USERS,
}

function stamp(actor = 'Ops Admin') {
  return { at: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), actor }
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<AdminDateRange>) {
      state.dateRange = action.payload
    },
    setVerificationStatus(state, action: PayloadAction<{ id: string; status: string; note?: string }>) {
      const item = state.verifications.find((v) => v.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      item.status = action.payload.status
      item.lastUpdated = at
      item.reviewedBy = actor
      item.history.push({ title: action.payload.status, at, status: action.payload.status, detail: action.payload.note })
      state.audit.unshift({
        id: `AUD-${10000 + state.audit.length}`,
        action: `Verification ${action.payload.status.toLowerCase()}`,
        actor,
        target: item.applicant,
        at,
        ip: '102.89.23.14',
      })
    },
    addAdminNote(
      state,
      action: PayloadAction<{ collection: 'verifications' | 'settlements' | 'withdrawals' | 'tickets' | 'buyers'; id: string; body: string }>,
    ) {
      const list = state[action.payload.collection] as Array<{ id: string; notes: AdminNote[] }>
      const item = list.find((row) => row.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      item.notes.unshift({ id: `note-${Date.now()}`, body: action.payload.body, at, author: actor })
    },
    setRecordStatus(
      state,
      action: PayloadAction<{
        collection: 'settlements' | 'withdrawals' | 'proxies' | 'tpl' | 'tickets' | 'regulation' | 'orders' | 'referrals' | 'users' | 'lots' | 'transactions'
        id: string
        status: string
        extra?: Record<string, string>
      }>,
    ) {
      const list = state[action.payload.collection] as Array<{ id: string; status: string; history?: { title: string; at: string; status: string }[] }>
      const item = list.find((row) => row.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      item.status = action.payload.status
      if (action.payload.extra) Object.assign(item, action.payload.extra)
      item.history?.push({ title: action.payload.status, at, status: action.payload.status })
      state.audit.unshift({
        id: `AUD-${10000 + state.audit.length}`,
        action: `${action.payload.collection} → ${action.payload.status}`,
        actor,
        target: action.payload.id,
        at,
        ip: '102.89.23.14',
      })
    },
    updateFeeValue(state, action: PayloadAction<{ id: string; value: string }>) {
      const fee = state.fees.find((f) => f.id === action.payload.id)
      if (!fee) return
      const { at, actor } = stamp()
      fee.value = action.payload.value
      fee.lastChanged = at
      fee.changedBy = actor
    },
    updateTierValue(state, action: PayloadAction<{ id: string; hold?: string; limit?: string }>) {
      const tier = state.tiers.find((t) => t.id === action.payload.id)
      if (!tier) return
      if (action.payload.hold) tier.hold = action.payload.hold
      if (action.payload.limit) tier.limit = action.payload.limit
      tier.lastChanged = stamp().at
    },
    overrideBuyerTier(state, action: PayloadAction<{ id: string; tier: string }>) {
      const buyer = state.buyers.find((b) => b.id === action.payload.id)
      if (!buyer) return
      buyer.tier = action.payload.tier
      const { at, actor } = stamp()
      state.audit.unshift({
        id: `AUD-${10000 + state.audit.length}`,
        action: 'Buyer tier overridden',
        actor,
        target: buyer.name,
        at,
        ip: '102.89.23.14',
      })
    },
    upsertAdminUser(state, action: PayloadAction<AdminUserRecord>) {
      const existing = state.users.find((u) => u.id === action.payload.id)
      if (existing) Object.assign(existing, action.payload)
      else state.users.unshift(action.payload)
      const { at, actor } = stamp()
      state.audit.unshift({
        id: `AUD-${10000 + state.audit.length}`,
        action: existing ? 'Admin user updated' : 'Admin user created',
        actor,
        target: action.payload.name,
        at,
        ip: '102.89.23.14',
      })
    },
    issueReferralReward(state, action: PayloadAction<{ id: string }>) {
      const row = state.referrals.find((r) => r.id === action.payload.id)
      if (!row) return
      row.qualification = 'Rewarded'
      row.reward = '$20 wallet credit'
    },
    reverseReferralReward(state, action: PayloadAction<{ id: string }>) {
      const row = state.referrals.find((r) => r.id === action.payload.id)
      if (!row) return
      row.qualification = 'Reversed'
      row.reward = '—'
    },
    retrySync(state, action: PayloadAction<{ id: string }>) {
      const job = state.syncs.find((s) => s.id === action.payload.id)
      if (!job) return
      job.status = 'Published'
      job.failed = 0
      job.finished = stamp().at
    },
    saveLotEdits(state, action: PayloadAction<{ id: string; title: string; status: string }>) {
      const lot = state.lots.find((l) => l.id === action.payload.id)
      if (!lot) return
      lot.title = action.payload.title
      lot.status = action.payload.status
    },
  },
})

export const {
  setDateRange,
  setVerificationStatus,
  addAdminNote,
  setRecordStatus,
  updateFeeValue,
  updateTierValue,
  overrideBuyerTier,
  upsertAdminUser,
  issueReferralReward,
  reverseReferralReward,
  retrySync,
  saveLotEdits,
} = adminSlice.actions

export default adminSlice.reducer
