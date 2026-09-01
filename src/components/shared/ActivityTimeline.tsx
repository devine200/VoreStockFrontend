import { cn } from '@/utils/format'

export type TimelineVariant = 'done' | 'current' | 'pending' | 'failed'

export interface TimelineItem {
  title: string
  at?: string
  detail?: string
  status?: string
  variant?: TimelineVariant
}

type StatusKind = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

function statusKind(status: string): StatusKind {
  const s = status.toLowerCase()
  if (/(approved|verified|completed|rewarded|qualified|live|delivered|credited|active|published|winning)/.test(s)) {
    return 'success'
  }
  if (/(pending|approaching|hold|upcoming|in transit|customs|progress|awaiting)/.test(s)) {
    return 'warning'
  }
  if (/(reject|fail|default|urgent|overdue|suspend|deactivat|blacklist|breach|outbid)/.test(s)) {
    return 'danger'
  }
  if (/(processing|resubmission|locked|tier|restricted|info)/.test(s)) {
    return 'info'
  }
  return 'neutral'
}

const badgeStyles: Record<StatusKind, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  danger: 'bg-red-50 border-red-200 text-red-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  neutral: 'bg-slate-100 border-slate-200 text-slate-600',
}

function TimelineStatusBadge({ status }: { status: string }) {
  const kind = statusKind(status)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border px-2 py-0.5 text-[12px] font-medium leading-normal whitespace-nowrap',
        badgeStyles[kind],
      )}
    >
      {status}
    </span>
  )
}

function inferVariant(item: TimelineItem, index: number, total: number): TimelineVariant {
  if (item.variant) return item.variant

  const isLast = index === total - 1
  const kind = item.status ? statusKind(item.status) : 'neutral'

  if (kind === 'danger') return 'failed'
  if (isLast && (kind === 'warning' || /pending|hold|awaiting|progress/i.test(item.status ?? ''))) {
    return 'current'
  }
  if (kind === 'success' || kind === 'info') return 'done'
  if (isLast) return 'current'
  return 'pending'
}

const dotStyles: Record<TimelineVariant, string> = {
  done: 'bg-emerald-600',
  current: 'bg-amber-500',
  pending: 'bg-slate-300',
  failed: 'bg-red-500',
}

function TimelineDot({ variant, showConnector }: { variant: TimelineVariant; showConnector: boolean }) {
  return (
    <div
      className={cn(
        'flex w-[9px] shrink-0 flex-col items-center',
        showConnector ? 'self-stretch pb-3' : 'h-[9px]',
      )}
      aria-hidden
    >
      <span className={cn('size-[9px] rounded-full', dotStyles[variant])} />
      {showConnector ? <span className="mt-1 w-[1.5px] flex-1 min-h-[34px] rounded-full bg-slate-200" /> : null}
    </div>
  )
}

export function ActivityTimeline({
  title,
  items,
  showBadges = true,
  embedded = false,
  className,
}: {
  title?: string
  items: TimelineItem[]
  showBadges?: boolean
  embedded?: boolean
  className?: string
}) {
  const content = (
    <div className={cn('flex flex-col gap-3', className)}>
      {title ? <p className="text-[13.5px] font-semibold text-slate-800">{title}</p> : null}
      <ol className="flex flex-col gap-3">
        {items.map((item, index) => {
          const variant = inferVariant(item, index, items.length)
          const isLast = index === items.length - 1
          const showConnector = !isLast

          return (
            <li key={`${item.title}-${index}`} className="flex gap-3">
              <TimelineDot variant={variant} showConnector={showConnector} />
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <p className="text-[13px] font-medium leading-normal text-slate-800">{item.title}</p>
                  {showBadges && item.status ? <TimelineStatusBadge status={item.status} /> : null}
                </div>
                {item.at ? <p className="mt-0.5 text-[11.5px] leading-normal text-slate-400">{item.at}</p> : null}
                {item.detail ? <p className="mt-1 text-[12px] leading-normal text-slate-500">{item.detail}</p> : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )

  if (embedded) return content

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      {content}
    </div>
  )
}
