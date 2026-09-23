import { NotificationFilters, type NotificationFilter } from '@/components/notifications/NotificationFilters'
import { NotificationRow } from '@/components/notifications/NotificationRow'
import { Icon } from '@/components/shared/Icon'
import markReadIcon from '@/assets/icons/mark-read.svg'
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
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#dacdd0] bg-[#f9f5f6] text-[13px] font-medium text-[#480516] hover:bg-[#f4ecee] disabled:pointer-events-none disabled:opacity-40 sm:order-2 sm:h-auto sm:w-auto sm:border-0 sm:bg-transparent sm:px-0 sm:hover:bg-transparent sm:hover:underline"
        >
          <Icon src={markReadIcon} size={12} />
          Mark all as read
        </button>
        <div className="flex items-center gap-2 sm:order-1">
          <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Recent</h2>
          {unreadCount > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-[#480516] text-[11px] font-medium text-white">
              {unreadCount}
            </span>
          ) : null}
        </div>
      </div>
      <NotificationFilters value={filter} counts={filterCounts} onChange={onFilterChange} />
      <div>
        {grouped.length === 0 ? (
          <p className="px-5 py-12 text-center text-[13px] text-[#9ca3af]">No notifications in this category.</p>
        ) : (
          grouped.map((section) => (
            <div key={section.group}>
              <div className="flex items-center gap-3 px-4 py-2 sm:px-5">
                <span className="text-[11px] font-medium tracking-[0.08em] text-[#9ca3af] uppercase">
                  {GROUP_LABEL[section.group]}
                </span>
                <span className="h-px flex-1 bg-[#ebebec]" />
              </div>
              {section.items.map((item) => (
                <NotificationRow key={item.id} item={item} onOpen={onOpen} />
              ))}
            </div>
          ))
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#ebebec] px-4 py-3.5 sm:px-5">
        <p className="text-[12px] text-[#9ca3af]">
          {items.length} {items.length === 1 ? 'notification' : 'notifications'}
        </p>
        <button
          type="button"
          onClick={onViewHistory}
          className="text-[13px] font-medium text-[#480516] hover:underline"
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
