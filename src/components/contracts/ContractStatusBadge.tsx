import { cn } from '@/utils/format'
import type { Contract } from '@/types'

export function statusLabel(status: Contract['status']) {
  switch (status) {
    case 'awaiting_signature':
      return 'Pending Signature'
    case 'active':
      return 'Active'
    case 'completed':
      return 'Completed'
    case 'draft':
      return 'Draft'
    default:
      return status
  }
}

function statusTone(status: Contract['status']) {
  switch (status) {
    case 'active':
      return 'bg-[#e8f6ee] text-[#0a6e38]'
    case 'awaiting_signature':
      return 'bg-[#fff6e5] text-[#b45309]'
    case 'completed':
      return 'bg-[#e8f1fb] text-[#1d4ed8]'
    case 'draft':
      return 'bg-[#f3f4f6] text-[#6b7280]'
    default:
      return 'bg-[#f3f4f6] text-[#6b7280]'
  }
}

export function ContractStatusBadge({ status }: { status: Contract['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-medium leading-[17px]',
        statusTone(status),
      )}
    >
      {statusLabel(status)}
    </span>
  )
}
