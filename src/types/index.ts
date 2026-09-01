export type UserRole = 'user' | 'admin'

export type BidStatus = 'active' | 'won' | 'lost' | 'leading' | 'outbid'

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered' | 'expired'

export type OrderStatus =
  | 'awaiting_payment'
  | 'in_progress'
  | 'in_transit'
  | 'customs'
  | 'delivered'
  | 'cancelled'

export type SuccessModalPayload = {
  title: string
  body: string
  actionLabel?: string
  actionTo?: string
}

export type ModalType =
  | 'accept-offer'
  | 'decline-offer'
  | 'counter-offer'
  | 'settle-balance'
  | 'success'
  | null

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  company?: string
  phone?: string
  tier: number
  kycStatus: 'verified' | 'pending' | 'unverified'
  kybStatus: 'verified' | 'pending' | 'unverified'
  avatarInitials: string
}

export interface Lot {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  categorySlug: string
  image: string
  location: string
  condition: string
  currentBid: number
  bidCount: number
  msrp: number
  units: number
  endsAt: string
  status: 'live' | 'ended' | 'upcoming'
  dockVerified: boolean
  buyerPremiumPct: number
  description: string
  brand?: string
  tags: string[]
}

export interface Bid {
  id: string
  lotId: string
  amount: number
  status: BidStatus
  placedAt: string
  maxBid?: number
  /** When a won bid must be settled */
  settlementDueAt?: string
  /** Final winning amount when status is lost */
  winningBid?: number
}

export interface Offer {
  id: string
  lotId: string
  direction: 'received' | 'sent'
  amount: number
  listPrice: number
  status: OfferStatus
  counterparty: string
  createdAt: string
  expiresAt: string
  note?: string
}

export interface OrderStep {
  label: string
  done: boolean
  current?: boolean
  at?: string
}

export interface Order {
  id: string
  lotId: string
  status: OrderStatus
  amount: number
  placedAt: string
  eta?: string
  seller?: string
  progress: number
  checkpointDone?: number
  checkpointTotal?: number
  steps: OrderStep[]
}

export interface WalletTx {
  id: string
  type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'fee' | 'refund'
  amount: number
  asset: string
  status: 'completed' | 'pending'
  date: string
  label: string
  detail?: string
}

export type NotificationCategory = 'bid' | 'auction' | 'order' | 'wallet' | 'account'

export interface NotificationItem {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
  type: NotificationCategory
  actionLabel?: string
  actionTo?: string
}

export interface NotificationPrefs {
  outbidAlerts: boolean
  auctionEndingSoon: boolean
  paymentDue: boolean
  shipmentUpdates: boolean
  walletActivity: boolean
}

export interface DisputeEvent {
  actor: 'you' | 'system' | 'cs'
  title: string
  at: string
  body: string
}

export type DisputeStatus = 'under_review' | 'awaiting_response' | 'resolved' | 'open' | 'closed'

export interface Dispute {
  id: string
  orderId: string
  lotId: string
  status: DisputeStatus
  reason: string
  details?: string
  amount: number
  openedAt: string
  updatedAt: string
  completedSteps: number
  events: DisputeEvent[]
}

export interface ContractParty {
  name: string
  role: 'Buyer' | 'Seller'
  initials: string
  signed: boolean
  signedAt?: string
}

export interface ContractDocument {
  name: string
  size: string
}

export interface ContractActivity {
  label: string
  at: string
}

export interface Contract {
  id: string
  contractNumber: string
  orderId: string
  lotId: string
  title: string
  status: 'awaiting_signature' | 'active' | 'completed' | 'draft'
  counterparty: string
  updatedAt: string
  contractDate: string
  effectiveDate: string
  expirationDate: string
  parties: ContractParty[]
  terms: string[]
  documents: ContractDocument[]
  activity: ContractActivity[]
}

export type TicketStatus = 'awaiting_you' | 'open' | 'resolved'

export interface TicketMessage {
  from: 'you' | 'agent'
  body: string
  at: string
}

export interface SupportTicket {
  id: string
  subject: string
  category: string
  status: TicketStatus
  updatedAt: string
  messages: TicketMessage[]
}

export type ReferralStatus = 'reward_earned' | 'pending_verification'

export interface ReferralContact {
  id: string
  name: string
  company: string
  initials: string
  email: string
  invitedAt: string
  status: ReferralStatus
  reward: number | null
}

export interface ReferralReward {
  id: string
  name: string
  company: string
  date: string
  amount: number
}
