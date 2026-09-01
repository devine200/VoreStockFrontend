import { cn } from '@/utils/format'
import type { DisputeStatus } from '@/types'

export const DISPUTE_STATUS_LABEL: Record<DisputeStatus, string> = {
  under_review: 'Under Review',
  awaiting_response: 'Awaiting Response',
  resolved: 'Resolved',
  open: 'Open',
  closed: 'Closed',
}

const TONE: Record<DisputeStatus, string> = {
  under_review: 'bg-[#e8f1fb] text-[#1d4ed8]',
  awaiting_response: 'bg-[#fef8e6] text-[#b45309]',
  resolved: 'bg-dock-soft text-dock',
  open: 'bg-wine-50 text-wine-500',
  closed: 'bg-[#f3f4f6] text-[#4b5563]',
}

export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-[17px]',
        TONE[status],
      )}
    >
      {DISPUTE_STATUS_LABEL[status]}
    </span>
  )
}
