import { cn } from '@/utils/format'
import type { OrderStatus } from '@/types'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: 'Awaiting Payment',
  in_progress: 'In Progress',
  in_transit: 'In Transit',
  customs: 'Customs',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const TONE: Record<OrderStatus, string> = {
  in_transit: 'bg-[#e6f7f5] text-[#0f766e]',
  awaiting_payment: 'bg-[#fef8e6] text-[#b45309]',
  delivered: 'bg-dock-soft text-dock',
  customs: 'bg-[#f3e8ff] text-[#7e22ce]',
  in_progress: 'bg-wine-50 text-wine-500',
  cancelled: 'bg-[#f3f4f6] text-[#4b5563]',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-[17px]',
        TONE[status],
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  )
}
