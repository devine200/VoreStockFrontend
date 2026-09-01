import { useMemo, useState } from 'react'
import { NotificationFeed, unreadCounts } from '@/components/notifications/NotificationFeed'
import { NotificationSettings } from '@/components/notifications/NotificationSettings'
import type { NotificationFilter } from '@/components/notifications/NotificationFilters'
import { PageHeader } from '@/components/shared/PageChrome'
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
    <div className="animate-fade-in">
      <PageHeader title="Notifications" subtitle="Alerts across Email, SMS, Push and WhatsApp" />
      <div className="flex flex-col gap-6">
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
