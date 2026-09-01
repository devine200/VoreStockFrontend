import { Link } from 'react-router-dom'
import { NotificationIcon } from '@/components/notifications/NotificationIcon'
import { notificationTime } from '@/components/notifications/notificationTime'
import { cn } from '@/utils/format'
import type { NotificationItem } from '@/types'

export function NotificationRow({
  item,
  onOpen,
}: {
  item: NotificationItem
  onOpen: (id: string) => void
}) {
  return (
    <div
      className={cn(
        'relative flex cursor-pointer items-start gap-4 px-5 py-4',
        !item.read && 'bg-[#fdfbfb]',
      )}
      onClick={() => onOpen(item.id)}
    >
      {!item.read ? <span className="absolute inset-y-0 left-0 w-[3px] bg-wine-500" /> : null}
      <NotificationIcon type={item.type} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold leading-5 text-[#1a1e26]">{item.title}</span>
          {!item.read ? (
            <span className="inline-flex items-center rounded bg-[#fdebec] px-1.5 py-0.5 text-[11px] font-medium leading-none text-[#c62828]">
              New
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[13px] leading-5 text-[#7a7b7c]">{item.body}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px] leading-[17px] text-[#9ca3af]">
          <span>{notificationTime(item.createdAt)}</span>
          {item.actionLabel && item.actionTo ? (
            <>
              <span aria-hidden>·</span>
              <Link
                to={item.actionTo}
                onClick={() => onOpen(item.id)}
                className="font-medium text-wine-500 hover:underline"
              >
                {item.actionLabel}
              </Link>
            </>
          ) : null}
        </div>
      </div>
      {!item.read ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-wine-500" /> : null}
    </div>
  )
}
