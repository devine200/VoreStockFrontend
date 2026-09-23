import { useMemo, useState } from 'react'
import { NotificationFeed, unreadCounts } from '@/components/notifications/NotificationFeed'
import { NotificationSettings } from '@/components/notifications/NotificationSettings'
import type { NotificationFilter } from '@/components/notifications/NotificationFilters'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { markAllRead, markRead, updateNotificationPrefs } from '@/store/slices/accountSlices'
import { showSuccess, showToast } from '@/store/slices/uiSlice'

export function NotificationsPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.notifications.items)
  const prefs = useAppSelector((s) => s.notifications.prefs)
  const [filter, setFilter] = useState<NotificationFilter>('all')

  const counts = useMemo(() => unreadCounts(items), [items])
  const visible = filter === 'all' ? items : items.filter((item) => item.type === filter)

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">
          Notifications
        </h1>
        <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">
          Alerts across Email, SMS, Push and WhatsApp
        </p>
      </div>
      <div className="flex flex-col gap-5">
        <NotificationFeed
          items={visible}
          filter={filter}
          unreadCount={counts.all}
          filterCounts={counts}
          onFilterChange={setFilter}
          onMarkAllRead={() => dispatch(markAllRead())}
          onOpen={(id) => dispatch(markRead(id))}
          onViewHistory={() => {
            setFilter('all')
            dispatch(showToast("You're viewing all notifications"))
          }}
        />
        <NotificationSettings
          prefs={prefs}
          onSave={(next) => {
            dispatch(updateNotificationPrefs(next))
            dispatch(
              showSuccess({
                title: 'Preferences saved',
                body: 'Your notification preferences were updated.',
                actionLabel: 'Done',
              }),
            )
          }}
        />
      </div>
    </div>
  )
}
