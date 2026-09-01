import { cn } from '@/utils/format'
import type { NotificationCategory } from '@/types'

export type NotificationFilter = 'all' | NotificationCategory

const TABS: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'bid', label: 'Bids' },
  { id: 'auction', label: 'Auctions' },
  { id: 'order', label: 'Orders' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'account', label: 'Account' },
]

export function NotificationFilters({
  value,
  counts,
  onChange,
}: {
  value: NotificationFilter
  counts: Record<NotificationFilter, number>
  onChange: (id: NotificationFilter) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border px-4 py-3">
      {TABS.map((tab) => {
        const selected = value === tab.id
        const count = counts[tab.id]
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition',
              selected ? 'bg-[#f4f4f4] text-[#1a1e26]' : 'text-[#7a7b7c] hover:text-[#1a1e26]',
            )}
          >
            {tab.label}
            {count > 0 ? (
              <span
                className={cn(
                  'inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[11px] leading-4',
                  selected ? 'bg-white text-[#1a1e26]' : 'bg-[#f4f4f4] text-[#7a7b7c]',
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
