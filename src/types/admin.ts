export type AdminStatusKind = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

export type AdminDateRange = 'today' | '7d' | '30d' | 'all'

export interface AdminKv {
  label: string
  value: string
  badge?: string
}

export interface AdminDoc {
  name: string
  size: string
  uploaded: string
  status: string
}

export interface AdminHistoryItem {
  title: string
  at: string
  status: string
  detail?: string
}

export interface AdminNote {
  id: string
  body: string
  at: string
  author: string
}

export interface AdminQueueCard {
  id: string
  title: string
  count: number
  description: string
  to: string
  icon: 'verification' | 'settlements' | 'proxy' | 'withdrawals' | 'tpl' | 'support'
  tone: 'maroon' | 'amber'
}

export interface AdminPriorityItem {
  id: string
  label: string
  title: string
  detail: string
  tone: 'urgent' | 'approaching'
  to: string
}

export interface AdminActivity {
  id: string
  activity: string
  reference: string
  status: string
  at: string
}

export interface AdminVerification {
  id: string
  applicant: string
  accountType: 'Individual' | 'Business'
  verificationType: string
  submitted: string
  lastUpdated: string
  status: string
  email: string
  phone: string
  address: string
  businessName?: string
  registrationNo?: string
  reviewedBy: string
  documents: AdminDoc[]
  history: AdminHistoryItem[]
  notes: AdminNote[]
}

export interface AdminSettlement {
  id: string
  buyer: string
  lot: string
  amount: string
  remaining: string
  window: string
  status: string
  due: string
  wonAt: string
  method: string
  orderRef: string
  fees: string
  netAmount: string
  date: string
  history: AdminHistoryItem[]
  notes: AdminNote[]
}

export interface AdminProxyBid {
  id: string
  lot: string
  buyer: string
  maxBid: string
  current: string
  t30: string
  status: string
  source: string
  auctionLot: string
  increment: string
  created: string
  ends: string
  history: AdminHistoryItem[]
}

export interface AdminWithdrawal {
  id: string
  buyer: string
  amount: string
  requested: string
  status: string
  destination: string
  method: string
  history: AdminHistoryItem[]
  notes: AdminNote[]
}

export interface AdminTplCheck {
  id: string
  orderId: string
  buyer: string
  device: string
  imei: string
  serial: string
  status: string
  submitted: string
  history: AdminHistoryItem[]
}

export interface AdminTicket {
  id: string
  buyer: string
  subject: string
  category: string
  priority: string
  sla: string
  status: string
  assignee: string
  opened: string
  lastReply: string
  created: string
  updated: string
  messages: { from: string; at: string; body: string }[]
  notes: AdminNote[]
}

export interface AdminBuyer {
  id: string
  name: string
  email: string
  phone: string
  type: 'Individual' | 'Business'
  kyc: string
  tier: string
  status: string
  wallet: string
  joined: string
  company?: string
  address: string
  notes: AdminNote[]
}

export interface AdminRegulation {
  id: string
  buyer: string
  flags: string[]
  status: string
  lastReview: string
  reason: string
  history: AdminHistoryItem[]
}

export interface AdminAuction {
  id: string
  title: string
  product: string
  lots: number
  starts: string
  ends: string
  status: string
  bids: number
  gmv: string
  currentBid: string
  highestBidder: string
  bidHold: string
}

export interface AdminLot {
  id: string
  title: string
  category: string
  status: string
  currentBid: string
  source: string
  published: string
  condition: string
  location: string
}

export interface AdminOrder {
  id: string
  buyer: string
  lot: string
  total: string
  status: string
  placed: string
  fulfillment: string
  history: AdminHistoryItem[]
}

export interface AdminShipment {
  id: string
  orderId: string
  buyer: string
  carrier: string
  tracking: string
  status: string
  eta: string
  origin: string
  destination: string
  history: AdminHistoryItem[]
}

export interface AdminTransaction {
  id: string
  buyer: string
  type: string
  amount: string
  status: string
  at: string
  method: string
  reference: string
  history: AdminHistoryItem[]
}

export interface AdminReferral {
  id: string
  referrer: string
  buyer: string
  code: string
  qualification: string
  reward: string
  date: string
}

export interface AdminFee {
  id: string
  name: string
  value: string
  appliesTo: string
  lastChanged: string
  changedBy: string
}

export interface AdminTier {
  id: string
  name: string
  hold: string
  limit: string
  buyers: number
  lastChanged: string
}

export interface AdminSyncJob {
  id: string
  source: string
  started: string
  finished: string
  status: string
  lots: number
  failed: number
}

export interface AdminAuditEntry {
  id: string
  action: string
  actor: string
  target: string
  at: string
  ip: string
}

export interface AdminUserRecord {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  created: string
}

export interface AdminChartPoint {
  label: string
  value: number
}

export interface AdminComboChartPoint {
  label: string
  deposits: number
  bids: number
}

export interface AdminDonutSlice {
  label: string
  value: number
  color: string
}

export interface AdminOverviewKpi {
  label: string
  value: string
  hint?: string
  hintTone?: 'warning' | 'success' | 'danger' | 'info' | 'muted'
  dot?: 'maroon' | 'amber' | 'none'
}

export interface AdminNeedsAttentionItem {
  id: string
  category: string
  detail: string
  to: string
}

export interface AdminFunnelRow {
  stage: string
  count: number
  conversion: string
}

export interface AdminAnalyticsPanel {
  type: 'line' | 'bar' | 'donut' | 'funnel'
  title: string
  points?: AdminChartPoint[]
  slices?: AdminDonutSlice[]
  funnel?: AdminFunnelRow[]
}

export interface AdminAnalyticsTab {
  id: string
  label: string
  subtitle: string
  kpis: { label: string; value: string; hint: string; hintTone?: 'warning' | 'success' | 'danger' | 'info' | 'muted' }[]
  panels: AdminAnalyticsPanel[]
  rows: { a: string; b: string; c: string; d: string }[]
  headers: [string, string, string, string]
}
