import type { NotificationCategory } from '@/types'

const WRAP: Record<NotificationCategory, string> = {
  bid: 'bg-[#fde8ec] text-[#c42b4a]',
  auction: 'bg-[#f3ebe4] text-[#8a5a3c]',
  order: 'bg-[#e8f1fb] text-[#1d4ed8]',
  wallet: 'bg-[#e8f6ee] text-[#1f7a45]',
  account: 'bg-[#f4eee8] text-[#7a5340]',
}

function BidIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 3 4 14h7l-1 7 10-12h-7l0-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AuctionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 14 18 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6.5 12.5 10 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14.5 5.5 18 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5 19h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function OrderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h15l-1.4 8.2A2 2 0 0 1 17.6 18H9.2a2 2 0 0 1-2-1.7L6 8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M6 8 5 4H3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="20.5" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16.5" cy="14.5" r="1.1" fill="currentColor" />
    </svg>
  )
}

function AccountIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3.5h7.5L19 8v12.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M14.5 3.5V8H19" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 13h6M9 16.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

const ICONS = {
  bid: BidIcon,
  auction: AuctionIcon,
  order: OrderIcon,
  wallet: WalletIcon,
  account: AccountIcon,
} as const

export function NotificationIcon({ type }: { type: NotificationCategory }) {
  const Glyph = ICONS[type]
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${WRAP[type]}`}
    >
      <Glyph />
    </span>
  )
}
