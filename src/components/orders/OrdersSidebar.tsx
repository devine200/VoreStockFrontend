import { icons } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { cn, formatMoney } from '@/utils/format'
import type { Lot, Order, OrderStatus } from '@/types'

export const ORDER_FILTERS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in_transit', label: 'In Transit' },
  { id: 'awaiting_payment', label: 'Awaiting Payment' },
  { id: 'customs', label: 'Customs' },
  { id: 'delivered', label: 'Delivered' },
]

export function OrderListCard({
  order,
  lot,
  selected,
  onSelect,
}: {
  order: Order
  lot?: Lot
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-3.5 text-left transition sm:gap-4 sm:px-[19px] sm:py-[17px]',
        selected
          ? 'border border-[#480516] bg-[#fdfbfb]'
          : 'border border-[#ebebec] hover:bg-[#fafafa]',
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f8f8f9]">
        {lot ? (
          <img src={lot.image} alt="" className="size-9 object-cover" />
        ) : (
          <span className="size-9 rounded bg-[#f5f5f6]" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0 text-[14px] font-semibold leading-5 text-[#1a1e26] line-clamp-2">
            {lot?.title ?? order.lotId}
          </span>
          <span className="shrink-0 sm:hidden">
            <OrderStatusBadge status={order.status} />
          </span>
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12px] leading-[17px] text-[#7a7b7c] sm:text-[13px]">
          <span>{order.id}</span>
          <span aria-hidden>·</span>
          <span>{formatMoney(order.amount).replace(/\.00$/, '')}</span>
        </span>
      </span>
      <span className="hidden shrink-0 sm:inline-flex">
        <OrderStatusBadge status={order.status} />
      </span>
    </button>
  )
}

export function OrdersSidebar({
  orders,
  lotsById,
  selectedId,
  query,
  filter,
  onQuery,
  onFilter,
  onSelect,
}: {
  orders: Order[]
  lotsById: (id: string) => Lot | undefined
  selectedId: string | null
  query: string
  filter: 'all' | OrderStatus
  onQuery: (value: string) => void
  onFilter: (id: 'all' | OrderStatus) => void
  onSelect: (id: string) => void
}) {
  return (
    <aside className="flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ebebec] bg-white lg:w-[411px] lg:shrink-0">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">All orders</h2>
          <span className="text-[12px] text-[#9ca3af]">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>
        <div className="relative mt-4">
          <Icon
            src={icons.search}
            size={12}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
          />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search orders…"
            className="h-[34px] w-full rounded-full border border-[#ebebec] bg-[#f8f8f9] pl-8 pr-3 text-[12px] text-[#1a1e26] outline-none placeholder:text-[#9ca3af] focus:border-[#dacdd0] focus:bg-white"
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto px-4 py-3 scrollbar-none">
        {ORDER_FILTERS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onFilter(chip.id)}
            className={cn(
              'h-[25px] shrink-0 rounded-full px-2.5 text-[12px] font-medium whitespace-nowrap',
              filter === chip.id
                ? 'bg-[#f9f5f6] text-[#480516]'
                : 'text-[#7a7b7c] hover:bg-[#f5f5f6]',
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {orders.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-[#9ca3af]">No orders match this filter.</p>
        ) : (
          orders.map((order) => (
            <OrderListCard
              key={order.id}
              order={order}
              lot={lotsById(order.lotId)}
              selected={order.id === selectedId}
              onSelect={() => onSelect(order.id)}
            />
          ))
        )}
      </div>
    </aside>
  )
}
