import { cn } from '@/utils/format'
import type { TicketStatus } from '@/types'

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  awaiting_you: 'Awaiting You',
  open: 'Open',
  resolved: 'Resolved',
}

const TONE: Record<TicketStatus, string> = {
  awaiting_you: 'bg-[#fef8e6] text-[#b45309]',
  open: 'bg-[#e8f1fb] text-[#1d4ed8]',
  resolved: 'bg-dock-soft text-dock',
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-[17px]',
        TONE[status],
      )}
    >
      {TICKET_STATUS_LABEL[status]}
    </span>
  )
}
