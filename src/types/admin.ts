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
  submittedAt?: string
  updatedAt?: string
  flaggedDocument?: string
  resubmissionReason?: string
  resubmissionAt?: string
  waitingSince?: string
  rejectionReason?: string
  rejectedAt?: string
  verifiedAt?: string
  tier?: string
  buyerId?: string
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
  seller?: string
  createdAt?: string
  lastUpdated?: string
  settlementDate?: string
  paymentStatus?: string
  grossAmount?: string
  platformFee?: string
  platformFeeLabel?: string
  charges?: string
  holdReason?: string
  holdAt?: string
  holdNotes?: string
  processingDate?: string
  currentStage?: string
  completionDate?: string
  failureReason?: string
  failedAt?: string
  previousAttempts?: string
  detailLot?: string
  attempts?: string
  relatedOrder?: string
  stage?: string
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
  createdAt?: string
  auctionEnd?: string
  bidsPlaced?: string
  lastBid?: string
  tier?: string
  email?: string
  phone?: string
  walletAvailable?: string
  auctionId?: string
  tierBand?: string
  orderId?: string
  outcome?: string
  history: AdminHistoryItem[]
}

export interface AdminWithdrawal {
  id: string
  buyer: string
  buyerId?: string
  amount: string
  requested: string
  status: string
  destination: string
  method: string
  tier?: string
  accountType?: string
  email?: string
  phone?: string
  availableBalance?: string
  heldBalance?: string
  balanceAfter?: string
  rejectionReason?: string
  rejectedAt?: string
  reviewedBy?: string
  approvedAt?: string
  payoutAt?: string
  history: AdminHistoryItem[]
  notes: AdminNote[]
}

export interface AdminTplCheck {
  id: string
  orderId: string
  buyer: string
  product: string
  imei: string
  serial: string
  status: 'Pending Verification' | 'Failed / Requires Review' | 'Verified at US 3PL'
  submitted: string
  suiteId: string
  warehouseLocation: string
  receivedAt: string
  photoCount: number
  photos: { label: string; empty?: boolean }[]
  phonecheck: {
    result: 'Passed' | 'Failed' | null
    detail: string
  }
  banner?: string
  history: AdminHistoryItem[]
}

export interface AdminTicketMessage {
  from: string
  at: string
  body: string
  role: 'buyer' | 'admin'
}

export interface AdminTicketHistoryItem {
  title: string
  at: string
  actor: string
}

export interface AdminTicket {
  id: string
  buyer: string
  subject: string
  category: string
  priority: string
  sla: string
  slaPastDeadline?: string
  slaDeadlineNote?: string
  status: string
  assignee: string
  opened: string
  lastReply: string
  created: string
  updated: string
  resolutionNote?: string
  resolvedAt?: string
  resolvedBy?: string
  closedAt?: string
  messages: AdminTicketMessage[]
  history: AdminTicketHistoryItem[]
  notes: AdminNote[]
}

export interface AdminBuyerWalletTxn {
  id: string
  dateTime: string
  type: string
  amount: string
  status: string
  ref: string
}

export interface AdminBuyerBid {
  id: string
  lot: string
  currentBid: string
  status: string
}

export interface AdminBuyerWin {
  id: string
  lot: string
  winningBid: string
  orderStage: string
}

export interface AdminBuyerOrderRow {
  id: string
  lot: string
  amount: string
  stage: string
}

export interface AdminBuyerReferralRow {
  id: string
  referredBuyer: string
  code: string
  qualification: string
  reward: string
}

export interface AdminBuyerDocument {
  id: string
  name: string
  uploaded: string
  size: string
}

export interface AdminBuyerSupportTicket {
  id: string
  subject: string
  opened: string
  status: string
}

export interface AdminBuyerAuditRow {
  id: string
  dateTime: string
  action: string
  before: string
  after: string
  admin: string
  notes: string
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
  activeBids: number
  wins: number
  openOrdersCount: number
  availableBalance: string
  heldBalance: string
  escrowBalance: string
  walletActivity: AdminBuyerWalletTxn[]
  bids: AdminBuyerBid[]
  winsList: AdminBuyerWin[]
  openOrdersList: AdminBuyerOrderRow[]
  completedOrders: AdminBuyerOrderRow[]
  referralCode: string
  referrals: AdminBuyerReferralRow[]
  verification: {
    status: string
    verifiedDate: string
    reviewedBy: string
    type: string
  }
  documents: AdminBuyerDocument[]
  supportTickets: AdminBuyerSupportTicket[]
  accountHistory: AdminBuyerAuditRow[]
  restrictBidding: boolean
  restrictWithdrawals: boolean
  restrictDeposits: boolean
  complianceHold: boolean
  deactivatedAt?: string
  deactivatedBy?: string
  deactivatedReason?: string
}

export interface AdminRegulationAudit {
  action: string
  reason: string
  note: string
  admin: string
  at: string
}

export interface AdminRegulation {
  id: string
  buyerId: string
  buyer: string
  initials: string
  status: string
  kyc: string
  tier: string
  tierLabel: string
  restrictBidding: boolean
  restrictWithdrawals: boolean
  restrictDeposits: boolean
  complianceHold: boolean
  complianceStatus: string
  lastReview: string
  reason: string
  flags: string[]
  history: AdminHistoryItem[]
  audit: AdminRegulationAudit[]
}

export interface AdminAuctionBid {
  id: string
  bidder: string
  amount: string
  at: string
  status: string
  hold: string
  holdKind?: 'badge' | 'text'
  highlight?: boolean
}

export interface AdminAuction {
  id: string
  product: string
  tier: string
  status: 'Live' | 'Upcoming' | 'Ended'
  currentBid: string
  bids: number
  highestBidder: string
  starts: string
  startsFull: string
  ends: string
  endsFull: string
  bidHold: string
  bidHoldDetail: string
  timeRemaining?: string
  timeHint?: string
  endedDate?: string
  endedClock?: string
  catalogRef: string
  syncStatus: string
  banner?: string
  orderId?: string
  orderStatus?: string
  earlierBidsHidden?: number
  bidActivity: AdminAuctionBid[]
}

export interface AdminLot {
  id: string
  title: string
  bStockSource: string
  category: string
  subcategory: string
  price: string
  tier: string
  syncStatus: string
  listingStatus: string
  lastSynced: string
  lastSyncedAt?: string
  publishedAt?: string
  status: string
  auctionSource: string
  description: string
  condition: string
  quantity: string
  inventoryType: string
  startingPrice: string
  currentBid: string
  bidCount: string
  endsIn: string
  endDateTime: string
  costPerUnit: string
  buyersPremium: string
  location: string
  shipmentSize: string
  estWeight: string
  delivery: string
  source: string
  landingPosition: string
  mediaCount: number
}

export interface AdminOrderDocument {
  id: string
  name: string
  uploadedBy: string
  uploadedAt: string
}

export interface AdminOrderTimelineEvent {
  id: string
  label: string
  at: string
  state: 'done' | 'current' | 'pending'
}

export interface AdminOrder {
  id: string
  buyer: string
  lot: string
  total: string
  /** List/detail stage badge: US 3PL | Ship | Customs | Delivered */
  stage: string
  payment: string
  logistics: string
  logisticsFailed?: boolean
  created: string
  updated: string
  createdFull: string
  updatedFull: string
  /** @deprecated use stage — kept for older call sites */
  status: string
  placed: string
  fulfillment: string
  history: AdminHistoryItem[]
  lotId: string
  placementStatus: string
  lotSecuredStatus: string
  placementOutcome?: string
  /** Index into Won→…→Delivered (0–6) */
  stageIndex: number
  tplStatus?: string
  photos?: { id: string; label: string }[]
  imei?: string
  phonecheck?: string
  logisticsStage?: string
  logisticsUpdatedAt?: string
  logisticsUpdatedBy?: string
  tracking?: string
  canAdvanceLogistics?: boolean
  deliveredBanner?: string
  buyerConfirmed?: string
  confirmedBy?: string
  confirmedAt?: string
  deliveryNote?: string
  hasPod?: boolean
  documents: AdminOrderDocument[]
  timeline: AdminOrderTimelineEvent[]
}

export interface AdminShipmentOrderRow {
  id: string
  buyer: string
  lot: string
  logisticsStage: string
  tracking: string
}

export interface AdminShipmentTimelineEvent {
  id: string
  label: string
  at: string
  state: 'done' | 'current' | 'pending'
}

export interface AdminShipment {
  id: string
  suiteId: string
  orderCount: number
  method: string
  /** Air freight column; "—" for sea */
  airFreightStatus: string
  tracking: string
  status: string
  created: string
  updated: string
  createdFull: string
  updatedFull: string
  /** Index into Shipped→Customs→Out for Delivery→Delivered (0–3) */
  stageIndex: number
  currentLocation: string
  lastUpdatedAt: string
  estimatedArrival: string
  timeline: AdminShipmentTimelineEvent[]
  orders: AdminShipmentOrderRow[]
  canUpdate: boolean
  deliveredBanner?: string
  buyerConfirmed?: string
  confirmedBy?: string
  confirmedAt?: string
  deliveryNote?: string
  hasPod?: boolean
  /** Legacy fields kept for older call sites */
  orderId: string
  buyer: string
  carrier: string
  eta: string
  origin: string
  destination: string
  history: AdminHistoryItem[]
}

export interface AdminTransactionHistoryItem {
  title: string
  at: string
  actor: string
  detail?: string
}

export interface AdminTransactionRelated {
  kind: string
  label: string
  to?: string
}

export interface AdminTransaction {
  id: string
  buyer: string
  type: string
  amount: string
  amountTone: 'credit' | 'debit' | 'hold'
  status: string
  direction: 'Credit' | 'Debit' | 'Hold'
  at: string
  timeShort: string
  method: string
  reference: string
  steps: string[]
  stepIndex: number
  provider?: { chain?: string; hash?: string; moonpay?: string }
  related: AdminTransactionRelated[]
  history: AdminTransactionHistoryItem[]
  canRefund?: boolean
}

export interface AdminReferralHistoryItem {
  title: string
  at: string
  detail?: string
}

export interface AdminReferral {
  id: string
  referrer: string
  buyer: string
  code: string
  /** Qualification lifecycle: Pending | Qualified | Rewarded | Reversed */
  qualification: string
  reward: string
  /** Signup date shown in list/detail */
  date: string
  signupDate: string
  qualificationEvent: string
  rewardType: string
  rewardValue: string
  /** Issued | Pending issuance | — | Reversed */
  rewardStatus: string
  issuedAt?: string
  /** Journey stage index 0–3 (code shared → signed up → qualified → issued) */
  journeyStep: number
  history: AdminReferralHistoryItem[]
}

export type AdminReferralQualificationRule = 'KYC + first deposit' | 'First paid order'

export interface AdminReferralConfig {
  enabled: boolean
  rewardAmount: string
  qualificationRule: AdminReferralQualificationRule
}

export interface AdminReferralAuditEntry {
  id: string
  action: string
  referral: string
  admin: string
  at: string
  reason: string
  previousState: string
  newState: string
}

export interface AdminFee {
  id: string
  name: string
  value: string
  appliesTo: string
  lastChanged: string
  changedBy: string
}

export interface AdminFeeConfig {
  buyerServiceFee: string
  buyerServiceApplyOn: string
  overdrive: string
  overdriveDescription: string
  bidHoldDefault: string
  bidHoldMin: number
  bidHoldMax: number
  settlementWindow: string
  bstockMarkup: string
  bstockNote: string
  tierBands: { tier: string; access: string }[]
  freight: { destination: string; rate: string }[]
}

export interface AdminFeeAuditRow {
  id: string
  configuration: string
  previous: string
  next: string
  admin: string
  at: string
  action: string
}

export interface AdminTier {
  id: string
  name: string
  number: 1 | 2 | 3
  description: string
}

export interface AdminTierConfig {
  /** Exclusive upper bound for Tier 1 / lower bound for Tier 2 */
  tier1Max: number
  /** Exclusive upper bound for Tier 2 / lower bound for Tier 3 */
  tier2Max: number
}

export interface AdminTierAuditRow {
  id: string
  action: string
  previous: string
  next: string
  buyer: string
  reason: string
  admin: string
  at: string
}

export interface AdminSyncItem {
  id: string
  lotId: string
  product: string
  source: string
  error: string
  syncStatus: 'Successful' | 'Failed'
  lastAttempt: string
}

export interface AdminSyncJob {
  id: string
  source: string
  /** Scheduled sync | Manual sync */
  syncType: string
  at: string
  started: string
  finished: string
  duration: string
  processed: number
  successful: number
  failed: number
  /** Published | Pending */
  publishStatus: string
  /** Healthy | Warning */
  status: string
  subtitle: string
  items: AdminSyncItem[]
}

export interface AdminSyncSource {
  id: string
  name: string
  description: string
  connected: boolean
  syncWarning: boolean
  lastSuccessfulSync: string
  lastSyncAttempt: string
  syncedListings: number
  failedListings: number
}

export interface AdminSyncHealth {
  totalListingsSynced: number
  successfulSyncs: number
  failedSyncs: number
  lastSuccessfulSyncTime: string
  warningMessage: string
}

export interface AdminAuditEntry {
  id: string
  action: string
  actor: string
  /** Module name shown in list + detail badge */
  module: string
  /** Short record label in the list table (e.g. "Buyer Ada Okonkwo") */
  record: string
  /** Compact change summary for the list (e.g. "Tier 1 → Tier 2") */
  change: string
  reason: string
  at: string
  /** Previous value in the detail compare card */
  previous: string
  /** New value in the detail compare card */
  next: string
  internalNote?: string
  /** Linked entity label in detail (e.g. "Buyer — Ada Okonkwo") */
  relatedLabel: string
  /** Route for "Open related record" */
  relatedTo?: string
  /** @deprecated kept for older fixtures / notes */
  target?: string
  ip?: string
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

export type AnalyticsYFormat = 'number' | 'money' | 'days'

export interface AnalyticsKpi {
  label: string
  value: string
  hint: string
  hintTone?: 'warning' | 'success' | 'danger' | 'info' | 'muted'
}

export interface AnalyticsTableRow {
  cells: string[]
  badgeAt?: number[]
  dangerAt?: number[]
  successAt?: number[]
  viewKey?: string
}

export interface AnalyticsTable {
  title?: string
  subtitle?: string
  headers: string[]
  grid: string
  rows: AnalyticsTableRow[]
}

export interface AnalyticsFeeBar {
  label: string
  value: string
  amount: number
}

export type AnalyticsChartPanel =
  | {
      kind: 'line'
      title: string
      caption?: string
      points: AdminChartPoint[]
      yFormat?: AnalyticsYFormat
    }
  | {
      kind: 'dual-line'
      title: string
      caption?: string
      legend: [string, string]
      points: { label: string; a: number; b: number }[]
      yFormat?: AnalyticsYFormat
      dashedB?: boolean
      filledDots?: boolean
      bColor?: string
    }
  | {
      kind: 'bar'
      title: string
      caption?: string
      points: AdminChartPoint[]
      full?: boolean
      colors?: string[]
      cutoffAt?: string
      wrapTicks?: boolean
    }
  | { kind: 'donut'; title: string; slices: AdminDonutSlice[] }
  | { kind: 'funnel'; title: string; funnel: AdminFunnelRow[] }
  | { kind: 'table'; table: AnalyticsTable }
  | { kind: 'fees'; title: string; subtitle?: string; items: AnalyticsFeeBar[]; compact?: boolean }
  | { kind: 'stats'; title: string; subtitle?: string; items: { label: string; value: string; tone?: 'danger' | 'success' }[] }

export type AnalyticsBlock =
  | { type: 'split'; left: AnalyticsChartPanel; right: AnalyticsChartPanel }
  | { type: 'full'; panel: AnalyticsChartPanel }

export interface AdminAnalyticsTab {
  id: string
  label: string
  subtitle: string
  filters: 'range' | 'range+tier' | 'revenue'
  kpis: AnalyticsKpi[]
  kpiCount?: 4 | 5
  chrome?: 'bordered' | 'flush'
  blocks: AnalyticsBlock[]
}
