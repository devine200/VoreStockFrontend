import { NotificationFilters, type NotificationFilter } from '@/components/notifications/NotificationFilters'
import { NotificationRow } from '@/components/notifications/NotificationRow'
import {
  notificationGroup,
  type NotificationGroup,
} from '@/components/notifications/notificationTime'
import type { NotificationCategory, NotificationItem } from '@/types'

const GROUP_LABEL: Record<NotificationGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  earlier: 'Earlier',
}

const GROUP_ORDER: NotificationGroup[] = ['today', 'yesterday', 'earlier']

export function NotificationFeed({
  items,
  filter,
  unreadCount,
  filterCounts,
  onFilterChange,
  onMarkAllRead,
  onOpen,
  onViewHistory,
}: {
  items: NotificationItem[]
  filter: NotificationFilter
  unreadCount: number
  filterCounts: Record<NotificationFilter, number>
  onFilterChange: (id: NotificationFilter) => void
  onMarkAllRead: () => void
  onOpen: (id: string) => void
  onViewHistory: () => void
}) {
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((item) => notificationGroup(item.createdAt) === group),
  })).filter((section) => section.items.length > 0)

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold text-[#1a1e26]">Recent</h2>
          {unreadCount > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-wine-500 text-[11px] font-medium text-white">
              {unreadCount}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-wine-500 hover:underline disabled:pointer-events-none disabled:opacity-40"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2 6.2 4.6 8.8 10 3.2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Mark all as read
        </button>
      </div>
      <NotificationFilters value={filter} counts={filterCounts} onChange={onFilterChange} />
      <div>
        {grouped.length === 0 ? (
          <p className="px-5 py-12 text-center text-[13px] text-[#9ca3af]">No notifications in this category.</p>
        ) : (
          grouped.map((section) => (
            <div key={section.group}>
              <div className="flex items-center gap-3 px-5 py-2">
                <span className="text-[11px] font-medium tracking-[0.08em] text-[#9ca3af] uppercase">
                  {GROUP_LABEL[section.group]}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              {section.items.map((item) => (
                <NotificationRow key={item.id} item={item} onOpen={onOpen} />
              ))}
            </div>
          ))
        )}
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
        <p className="text-[12px] text-[#9ca3af]">
          {items.length} {items.length === 1 ? 'notification' : 'notifications'}
        </p>
        <button
          type="button"
          onClick={onViewHistory}
          className="text-[13px] font-medium text-wine-500 hover:underline"
        >
          View all history →
        </button>
      </div>
    </section>
  )
}

export function unreadCounts(items: NotificationItem[]): Record<NotificationFilter, number> {
  const byType = items.reduce(
    (acc, item) => {
      if (!item.read) acc[item.type] += 1
      return acc
    },
    { bid: 0, auction: 0, order: 0, wallet: 0, account: 0 } as Record<NotificationCategory, number>,
  )
  return {
    all: items.filter((item) => !item.read).length,
    ...byType,
  }
}
