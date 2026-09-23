import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  ADMIN_AUCTIONS,
  ADMIN_AUDIT,
  ADMIN_BUYERS,
  ADMIN_FEES,
  ADMIN_FEE_AUDIT,
  ADMIN_FEE_CONFIG,
  ADMIN_LOTS,
  ADMIN_ORDERS,
  ADMIN_PROXIES,
  ADMIN_REFERRALS,
  ADMIN_REFERRAL_AUDIT,
  ADMIN_REFERRAL_CONFIG,
  ADMIN_REGULATION,
  ADMIN_SETTLEMENTS,
  ADMIN_SHIPMENTS,
  ADMIN_SYNCS,
  ADMIN_SYNC_HEALTH,
  ADMIN_SYNC_SOURCE,
  ADMIN_TICKETS,
  ADMIN_TIERS,
  ADMIN_TIER_AUDIT,
  ADMIN_TIER_CONFIG,
  ADMIN_TPL,
  ADMIN_TRANSACTIONS,
  ADMIN_USERS,
  ADMIN_VERIFICATIONS,
  ADMIN_WITHDRAWALS,
} from '@/api/adminFixtures'
import type { AdminDateRange, AdminFeeAuditRow, AdminFeeConfig, AdminLot, AdminNote, AdminOrder, AdminReferralConfig, AdminRegulationAudit, AdminShipment, AdminTierAuditRow, AdminTierConfig, AdminUserRecord } from '@/types/admin'

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
  referralConfig: AdminReferralConfig
  referralAudit: typeof ADMIN_REFERRAL_AUDIT
  fees: typeof ADMIN_FEES
  feeConfig: AdminFeeConfig
  feeAudit: AdminFeeAuditRow[]
  tiers: typeof ADMIN_TIERS
  tierConfig: AdminTierConfig
  tierAudit: AdminTierAuditRow[]
  syncs: typeof ADMIN_SYNCS
  syncHealth: typeof ADMIN_SYNC_HEALTH
  syncSource: typeof ADMIN_SYNC_SOURCE
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
  referralConfig: { ...ADMIN_REFERRAL_CONFIG },
  referralAudit: ADMIN_REFERRAL_AUDIT.map((e) => ({ ...e })),
  fees: ADMIN_FEES,
  feeConfig: { ...ADMIN_FEE_CONFIG, tierBands: ADMIN_FEE_CONFIG.tierBands.map((r) => ({ ...r })), freight: ADMIN_FEE_CONFIG.freight.map((r) => ({ ...r })) },
  feeAudit: ADMIN_FEE_AUDIT.map((e) => ({ ...e })),
  tiers: ADMIN_TIERS,
  tierConfig: { ...ADMIN_TIER_CONFIG },
  tierAudit: ADMIN_TIER_AUDIT.map((e) => ({ ...e })),
  syncs: ADMIN_SYNCS,
  syncHealth: ADMIN_SYNC_HEALTH,
  syncSource: ADMIN_SYNC_SOURCE,
  audit: ADMIN_AUDIT,
  users: ADMIN_USERS,
}

function stamp(actor = 'Ops Admin') {
  return { at: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), actor }
}

function pushAudit(
  state: AdminState,
  partial: {
    action: string
    actor: string
    at: string
    module?: string
    record?: string
    change?: string
    reason?: string
    previous?: string
    next?: string
    relatedLabel?: string
    relatedTo?: string
    target?: string
    ip?: string
  },
) {
  const record = partial.record ?? partial.target ?? '—'
  state.audit.unshift({
    id: `AUD-${10000 + state.audit.length}`,
    action: partial.action,
    actor: partial.actor,
    module: partial.module ?? 'System',
    record,
    change: partial.change ?? '—',
    reason: partial.reason ?? '—',
    at: partial.at,
    previous: partial.previous ?? '—',
    next: partial.next ?? '—',
    relatedLabel: partial.relatedLabel ?? record,
    relatedTo: partial.relatedTo,
    target: partial.target,
    ip: partial.ip ?? '102.89.23.14',
  })
}


const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<AdminDateRange>) {
      state.dateRange = action.payload
    },
    setVerificationStatus(
      state,
      action: PayloadAction<{ id: string; status: string; note?: string; flaggedDocument?: string; historyTitle?: string }>,
    ) {
      const item = state.verifications.find((v) => v.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      item.status = action.payload.status
      item.lastUpdated = at
      item.updatedAt = at
      item.reviewedBy = actor
      if (action.payload.flaggedDocument) item.flaggedDocument = action.payload.flaggedDocument
      if (action.payload.note && action.payload.status === 'Requires Resubmission') {
        item.resubmissionReason = action.payload.note
        item.resubmissionAt = at
        item.waitingSince = at
      }
      if (action.payload.status === 'Approved') {
        item.documents = item.documents.map((doc) => ({ ...doc, status: 'Approved' }))
      }
      if (action.payload.status === 'Rejected') {
        item.documents = item.documents.map((doc) => ({ ...doc, status: 'Rejected' }))
      }
      if (action.payload.status === 'Requires Resubmission' && action.payload.flaggedDocument) {
        item.documents = item.documents.map((doc) =>
          doc.name === action.payload.flaggedDocument ? { ...doc, status: 'Requires Resubmission' } : doc,
        )
      }
      item.history.push({
        title: action.payload.historyTitle ?? action.payload.status,
        at,
        status: action.payload.status,
        detail: action.payload.note,
      })
      pushAudit(state, {
        action: `Verification ${action.payload.status.toLowerCase()}`,
        actor,
        at,
        record: item.applicant,
        relatedLabel: item.applicant,
      })
    },
    setVerificationDocumentStatus(state, action: PayloadAction<{ id: string; name: string; status: string }>) {
      const item = state.verifications.find((v) => v.id === action.payload.id)
      if (!item) return
      item.documents = item.documents.map((doc) => (doc.name === action.payload.name ? { ...doc, status: action.payload.status } : doc))
      item.lastUpdated = stamp().at
      item.updatedAt = item.lastUpdated
    },
    addAdminNote(
      state,
      action: PayloadAction<{ collection: 'verifications' | 'settlements' | 'withdrawals' | 'tickets' | 'buyers'; id: string; body: string }>,
    ) {
      const list = state[action.payload.collection] as Array<{ id: string; notes: AdminNote[]; history?: { title: string; at: string; actor?: string }[] }>
      const item = list.find((row) => row.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      item.notes.unshift({ id: `note-${Date.now()}`, body: action.payload.body, at, author: actor })
      if (action.payload.collection === 'tickets') {
        item.history?.push({ title: 'Internal note added', at, actor })
      }
    },
    replyToTicket(state, action: PayloadAction<{ id: string; body: string }>) {
      const item = state.tickets.find((row) => row.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      item.messages.push({ from: actor, at, role: 'admin', body: action.payload.body })
      item.lastReply = at
      item.updated = at
      item.history.push({ title: 'Reply sent to buyer', at, actor })
    },
    setRecordStatus(
      state,
      action: PayloadAction<{
        collection: 'settlements' | 'withdrawals' | 'proxies' | 'tpl' | 'tickets' | 'regulation' | 'orders' | 'referrals' | 'users' | 'lots' | 'transactions'
        id: string
        status: string
        extra?: Record<string, string>
        historyTitle?: string
        skipHistory?: boolean
      }>,
    ) {
      const list = state[action.payload.collection] as Array<{
        id: string
        status: string
        history?: { title: string; at: string; status?: string; actor?: string }[]
      }>
      const item = list.find((row) => row.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      const previousStatus = item.status
      item.status = action.payload.status
      if (action.payload.extra) Object.assign(item, action.payload.extra)
      if (!action.payload.skipHistory) {
        const title =
          action.payload.historyTitle ??
          (previousStatus !== action.payload.status
            ? `Status updated: ${previousStatus} → ${action.payload.status}`
            : action.payload.status)
        item.history?.push({ title, at, status: action.payload.status, actor })
      }
      const userAudit =
        action.payload.collection === 'users'
          ? action.payload.status === 'Suspended'
            ? 'Admin user suspended'
            : action.payload.status === 'Deactivated'
              ? 'Admin user deactivated'
              : action.payload.status === 'Active'
                ? 'Admin user reactivated'
                : `Admin user → ${action.payload.status}`
          : null
      pushAudit(state, {
        action: userAudit ?? `${action.payload.collection} → ${action.payload.status}`,
        actor,
        at,
        record: action.payload.id,
        relatedLabel: action.payload.id,
        module: action.payload.collection === 'users' ? 'Admin users' : undefined,
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
    updateFeeConfig(
      state,
      action: PayloadAction<{
        key:
          | 'buyerServiceFee'
          | 'overdrive'
          | 'bidHoldDefault'
          | 'bstockMarkup'
          | `freight:${string}`
        value: string
        label: string
        previous: string
      }>,
    ) {
      const { key, value, label, previous } = action.payload
      if (key === 'buyerServiceFee') state.feeConfig.buyerServiceFee = value
      else if (key === 'overdrive') state.feeConfig.overdrive = value
      else if (key === 'bidHoldDefault') state.feeConfig.bidHoldDefault = value
      else if (key === 'bstockMarkup') state.feeConfig.bstockMarkup = value
      else if (key.startsWith('freight:')) {
        const dest = key.slice('freight:'.length)
        const row = state.feeConfig.freight.find((f) => f.destination === dest)
        if (row) row.rate = value
      }
      const { at, actor } = stamp()
      state.feeAudit.unshift({
        id: `fa-${Date.now()}`,
        configuration: label,
        previous,
        next: value,
        admin: actor,
        at: at.replace(', ', ' · '),
        action: 'Updated',
      })
      const legacy = state.fees.find((f) => f.name === label || f.id.includes(key.split(':')[0]))
      if (legacy) {
        legacy.value = value
        legacy.lastChanged = at
        legacy.changedBy = actor
      }
    },
    updateTierValue(
      state,
      action: PayloadAction<{ boundary: 'tier1Max' | 'tier2Max'; value: number; previousLabel: string; nextLabel: string; tierName: string }>,
    ) {
      const { at, actor } = stamp()
      state.tierConfig[action.payload.boundary] = action.payload.value
      state.tierAudit.unshift({
        id: `ta-${Date.now()}`,
        action: `${action.payload.tierName} threshold updated`,
        previous: action.payload.previousLabel,
        next: action.payload.nextLabel,
        buyer: '—',
        reason: '—',
        admin: actor,
        at: at.replace(', ', ' · '),
      })
      pushAudit(state, {
        action: `${action.payload.tierName} threshold updated`,
        actor,
        at,
        record: action.payload.nextLabel,
        relatedLabel: action.payload.nextLabel,
      })
    },
    overrideBuyerTier(state, action: PayloadAction<{ id: string; tier: string; reason?: string }>) {
      const buyer = state.buyers.find((b) => b.id === action.payload.id)
      if (!buyer) return
      const before = buyer.tier
      buyer.tier = action.payload.tier
      const { at, actor } = stamp()
      const displayAt = at.replace(', ', ' · ')
      buyer.accountHistory.unshift({
        id: `bah-${Date.now()}`,
        dateTime: displayAt,
        action: 'Overrode buyer tier',
        before,
        after: action.payload.tier,
        admin: actor,
        notes: action.payload.reason ?? '—',
      })
      state.tierAudit.unshift({
        id: `ta-${Date.now()}`,
        action: 'Buyer tier override',
        previous: before,
        next: action.payload.tier,
        buyer: buyer.name,
        reason: action.payload.reason ?? '—',
        admin: actor,
        at: displayAt,
      })
      pushAudit(state, {
        action: 'Buyer tier overridden',
        actor,
        at,
        record: buyer.name,
        relatedLabel: buyer.name,
      })
    },
    setBuyerStatus(
      state,
      action: PayloadAction<{ id: string; status: string; reason?: string; note?: string }>,
    ) {
      const buyer = state.buyers.find((b) => b.id === action.payload.id)
      if (!buyer) return
      const before = buyer.status
      const { at, actor } = stamp()
      buyer.status = action.payload.status
      if (action.payload.status === 'Deactivated') {
        buyer.deactivatedAt = at.split(',')[0]
        buyer.deactivatedBy = actor
        buyer.deactivatedReason = action.payload.reason
      }
      if (action.payload.status === 'Active' && before === 'Deactivated') {
        buyer.deactivatedAt = undefined
        buyer.deactivatedBy = undefined
        buyer.deactivatedReason = undefined
      }
      buyer.accountHistory.unshift({
        id: `bah-${Date.now()}`,
        dateTime: at.replace(', ', ' · '),
        action:
          action.payload.status === 'Deactivated'
            ? 'Account deactivated'
            : action.payload.status === 'Restricted'
              ? 'Buyer suspended'
              : 'Account reactivated',
        before,
        after: action.payload.status,
        admin: actor,
        notes: action.payload.reason || action.payload.note || '—',
      })
      pushAudit(state, {
        action: `Buyer → ${action.payload.status}`,
        actor,
        at,
        record: buyer.name,
        relatedLabel: buyer.name,
      })
    },
    updateBuyerControls(
      state,
      action: PayloadAction<{
        id: string
        restrictBidding: boolean
        restrictWithdrawals: boolean
        restrictDeposits: boolean
        complianceHold: boolean
        reason?: string
      }>,
    ) {
      const buyer = state.buyers.find((b) => b.id === action.payload.id)
      if (!buyer) return
      const { at, actor } = stamp()
      buyer.restrictBidding = action.payload.restrictBidding
      buyer.restrictWithdrawals = action.payload.restrictWithdrawals
      buyer.restrictDeposits = action.payload.restrictDeposits
      buyer.complianceHold = action.payload.complianceHold
      const anyRestricted =
        action.payload.restrictBidding ||
        action.payload.restrictWithdrawals ||
        action.payload.restrictDeposits ||
        action.payload.complianceHold
      if (buyer.status !== 'Deactivated') {
        buyer.status = anyRestricted ? 'Restricted' : 'Active'
      }
      buyer.accountHistory.unshift({
        id: `bah-${Date.now()}`,
        dateTime: at.replace(', ', ' · '),
        action: 'Updated regulation controls',
        before: '—',
        after: anyRestricted ? 'Restricted' : 'Clear',
        admin: actor,
        notes: action.payload.reason ?? '—',
      })
    },
    upsertAdminUser(state, action: PayloadAction<AdminUserRecord>) {
      const existing = state.users.find((u) => u.id === action.payload.id)
      if (existing) Object.assign(existing, action.payload)
      else state.users.unshift(action.payload)
      const { at, actor } = stamp()
      pushAudit(state, {
        action: existing ? 'Admin user updated' : 'Admin user created',
        actor,
        at,
        module: 'Admin users',
        record: action.payload.name,
        relatedLabel: action.payload.name,
      })
    },
    issueReferralReward(state, action: PayloadAction<{ id: string; note?: string }>) {
      const row = state.referrals.find((r) => r.id === action.payload.id)
      if (!row) return
      const prev = row.rewardStatus
      const { at, actor } = stamp()
      row.qualification = 'Rewarded'
      row.rewardStatus = 'Issued'
      row.issuedAt = at
      row.journeyStep = 3
      if (!row.reward || row.reward === '—') {
        row.reward = `${row.rewardValue} ${row.rewardType.toLowerCase()}`
      }
      row.history.push({
        title: 'Reward issued manually',
        at: `${at} · ${actor}`,
        detail: action.payload.note || `${row.reward} to ${row.referrer}`,
      })
      state.referralAudit.unshift({
        id: `RAUD-${1000 + state.referralAudit.length}`,
        action: 'Manual reward issued',
        referral: row.code,
        admin: actor,
        at,
        reason: action.payload.note || 'Manual issuance',
        previousState: prev,
        newState: 'Issued',
      })
    },
    reverseReferralReward(state, action: PayloadAction<{ id: string; reason: string }>) {
      const row = state.referrals.find((r) => r.id === action.payload.id)
      if (!row) return
      const prev = row.qualification
      const { at, actor } = stamp()
      row.qualification = 'Reversed'
      row.rewardStatus = 'Reversed'
      row.history.push({
        title: 'Reward reversed',
        at: `${at} · ${actor}`,
        detail: action.payload.reason,
      })
      state.referralAudit.unshift({
        id: `RAUD-${1000 + state.referralAudit.length}`,
        action: 'Reward reversed',
        referral: row.code,
        admin: actor,
        at,
        reason: action.payload.reason,
        previousState: prev,
        newState: 'Reversed',
      })
    },
    saveReferralConfig(state, action: PayloadAction<AdminReferralConfig>) {
      const prev = state.referralConfig.rewardAmount
      const next = action.payload.rewardAmount
      state.referralConfig = action.payload
      if (prev !== next) {
        const { at, actor } = stamp()
        state.referralAudit.unshift({
          id: `RAUD-${1000 + state.referralAudit.length}`,
          action: 'Config updated',
          referral: '—',
          admin: actor,
          at,
          reason: `Reward amount: ${prev} → ${next}`,
          previousState: prev,
          newState: next,
        })
      }
    },
    retrySync(state, action: PayloadAction<{ id: string }>) {
      const job = state.syncs.find((s) => s.id === action.payload.id)
      if (!job) return
      job.items = job.items.map((item) =>
        item.syncStatus === 'Failed'
          ? { ...item, syncStatus: 'Successful', error: '—', lastAttempt: stamp().at }
          : item,
      )
      job.failed = 0
      job.successful = job.processed
      job.status = 'Healthy'
      job.finished = stamp().at
    },
    retrySyncItem(state, action: PayloadAction<{ syncId: string; itemId: string }>) {
      const job = state.syncs.find((s) => s.id === action.payload.syncId)
      if (!job) return
      const item = job.items.find((i) => i.id === action.payload.itemId)
      if (!item || item.syncStatus !== 'Failed') return
      item.syncStatus = 'Successful'
      item.error = '—'
      item.lastAttempt = stamp().at
      job.failed = Math.max(0, job.failed - 1)
      job.successful += 1
      if (job.failed === 0) job.status = 'Healthy'
    },
    publishSync(state, action: PayloadAction<{ id: string }>) {
      const job = state.syncs.find((s) => s.id === action.payload.id)
      if (!job) return
      job.publishStatus = 'Published'
      if (job.failed === 0) job.status = 'Healthy'
    },
    saveLotEdits(state, action: PayloadAction<{ id: string } & Partial<Omit<AdminLot, 'id'>>>) {
      const lot = state.lots.find((l) => l.id === action.payload.id)
      if (!lot) return
      const { id: _id, ...patch } = action.payload
      Object.assign(lot, patch)
    },
    updateRegulation(
      state,
      action: PayloadAction<{
        id: string
        status?: string
        restrictBidding?: boolean
        restrictWithdrawals?: boolean
        restrictDeposits?: boolean
        complianceHold?: boolean
        complianceStatus?: string
        auditEntry?: AdminRegulationAudit
      }>,
    ) {
      const item = state.regulation.find((r) => r.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      if (action.payload.status) item.status = action.payload.status
      if (action.payload.restrictBidding !== undefined) item.restrictBidding = action.payload.restrictBidding
      if (action.payload.restrictWithdrawals !== undefined) item.restrictWithdrawals = action.payload.restrictWithdrawals
      if (action.payload.restrictDeposits !== undefined) item.restrictDeposits = action.payload.restrictDeposits
      if (action.payload.complianceHold !== undefined) {
        item.complianceHold = action.payload.complianceHold
        item.complianceStatus = action.payload.complianceHold ? 'On hold' : 'Clear'
      }
      if (action.payload.complianceStatus) item.complianceStatus = action.payload.complianceStatus
      const labels: string[] = []
      if (item.restrictBidding) labels.push(item.status === 'Restricted' ? 'Restrict bidding' : 'Bidding')
      if (item.restrictWithdrawals) labels.push('Withdrawals')
      if (item.restrictDeposits) labels.push('Deposits')
      item.flags = labels
      if (action.payload.auditEntry) {
        item.audit.unshift(action.payload.auditEntry)
        item.history.unshift({
          title: action.payload.auditEntry.action,
          at: action.payload.auditEntry.at,
          status: item.status,
          detail: action.payload.auditEntry.reason,
        })
      }
      pushAudit(state, {
        action: `regulation → ${action.payload.status ?? 'flags'}`,
        actor,
        at,
        record: action.payload.id,
        relatedLabel: action.payload.id,
      })
    },
    updateOrder(
      state,
      action: PayloadAction<{
        id: string
        patch: Partial<{
          stage: string
          status: string
          logistics: string
          logisticsFailed: boolean
          logisticsStage: string
          logisticsUpdatedAt: string
          logisticsUpdatedBy: string
          tracking: string
          stageIndex: number
          tplStatus: string
          phonecheck: string
          canAdvanceLogistics: boolean
          deliveredBanner: string
          buyerConfirmed: string
          confirmedBy: string
          confirmedAt: string
          deliveryNote: string
          hasPod: boolean
        }>
        timeline?: AdminOrder['timeline']
        historyTitle?: string
      }>,
    ) {
      const item = state.orders.find((o) => o.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      Object.assign(item, action.payload.patch)
      if (action.payload.patch.stage) item.status = action.payload.patch.stage
      if (action.payload.timeline) item.timeline = action.payload.timeline
      item.updated = at.split(',')[0]?.replace(/ \d{4}$/, '') ?? item.updated
      item.updatedFull = at.split(',')[0] ?? item.updatedFull
      if (action.payload.historyTitle) {
        item.history.push({ title: action.payload.historyTitle, at, status: item.stage, detail: actor })
      }
      pushAudit(state, {
        action: action.payload.historyTitle ?? `Order → ${item.stage}`,
        actor,
        at,
        record: item.id,
        relatedLabel: item.id,
      })
    },
    updateShipment(
      state,
      action: PayloadAction<{
        id: string
        patch: Partial<{
          status: string
          airFreightStatus: string
          tracking: string
          stageIndex: number
          currentLocation: string
          lastUpdatedAt: string
          estimatedArrival: string
          canUpdate: boolean
          deliveredBanner: string
          buyerConfirmed: string
          confirmedBy: string
          confirmedAt: string
          deliveryNote: string
          hasPod: boolean
        }>
        timeline?: AdminShipment['timeline']
        ordersLogistics?: string
        historyTitle?: string
      }>,
    ) {
      const item = state.shipments.find((s) => s.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      Object.assign(item, action.payload.patch)
      if (action.payload.timeline) item.timeline = action.payload.timeline
      if (action.payload.ordersLogistics) {
        item.orders = item.orders.map((o) => ({
          ...o,
          logisticsStage: action.payload.ordersLogistics!,
          tracking: action.payload.patch.tracking ?? o.tracking,
        }))
      }
      item.updated = at.split(',')[0]?.replace(/ \d{4}$/, '') ?? item.updated
      item.updatedFull = at.split(',')[0] ?? item.updatedFull
      if (action.payload.historyTitle) {
        item.history.push({ title: action.payload.historyTitle, at, status: item.status, detail: actor })
      }
      pushAudit(state, {
        action: action.payload.historyTitle ?? `Shipment → ${item.status}`,
        actor,
        at,
        record: item.id,
        relatedLabel: item.id,
      })
    },
    updateTransaction(
      state,
      action: PayloadAction<{
        id: string
        status?: string
        historyEntry?: { title: string; at: string; actor: string; detail?: string }
        note?: string
      }>,
    ) {
      const item = state.transactions.find((t) => t.id === action.payload.id)
      if (!item) return
      const { at, actor } = stamp()
      if (action.payload.status) {
        item.status = action.payload.status
        item.canRefund = false
        if (action.payload.status === 'Completed' && item.steps.includes('Completed')) {
          item.stepIndex = item.steps.indexOf('Completed')
        }
      }
      if (action.payload.historyEntry) {
        item.history.push(action.payload.historyEntry)
      } else if (action.payload.note) {
        item.history.push({
          title: 'Note added',
          at: at.replace(',', ' ·'),
          actor,
          detail: action.payload.note,
        })
      }
      pushAudit(state, {
        action: `transaction → ${action.payload.status ?? 'note'}`,
        actor,
        at,
        record: action.payload.id,
        relatedLabel: action.payload.id,
      })
    },
  },
})

export const {
  setDateRange,
  setVerificationStatus,
  setVerificationDocumentStatus,
  addAdminNote,
  replyToTicket,
  setRecordStatus,
  updateFeeValue,
  updateFeeConfig,
  updateTierValue,
  overrideBuyerTier,
  setBuyerStatus,
  updateBuyerControls,
  upsertAdminUser,
  issueReferralReward,
  reverseReferralReward,
  saveReferralConfig,
  retrySync,
  retrySyncItem,
  publishSync,
  saveLotEdits,
  updateRegulation,
  updateOrder,
  updateShipment,
  updateTransaction,
} = adminSlice.actions

export default adminSlice.reducer
