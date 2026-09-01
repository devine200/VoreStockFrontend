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
        'flex w-full items-center gap-4 rounded-xl px-[19px] py-[17px] text-left transition',
        selected ? 'border border-wine-500 bg-wine-50' : 'border border-transparent hover:bg-[#fafafa]',
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
        {lot ? (
          <img src={lot.image} alt="" className="size-9 object-cover" />
        ) : (
          <span className="size-9 rounded bg-surface" />
        )}
      </span>
        <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold leading-5 text-[#1a1e26] line-clamp-2">
          {lot?.title ?? order.lotId}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#7a7b7c]">
          <span>{order.id}</span>
          <span aria-hidden>·</span>
          <span>{formatMoney(order.amount).replace(/\.00$/, '')}</span>
        </span>
      </span>
      <OrderStatusBadge status={order.status} />
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
    <aside className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-white lg:w-[411px] lg:shrink-0">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#1a1e26]">All orders</h2>
          <span className="text-[12px] text-[#9ca3af]">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>
        <div className="relative mt-4">
          <Icon
            src={icons.search}
            size={12}
            className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 opacity-40"
          />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search orders…"
            className="h-[46px] w-full rounded-xl border border-border bg-white pl-9 pr-3 text-[13px] text-[#1a1e26] outline-none placeholder:text-[#9ca3af] focus:border-wine-400"
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto px-4 py-3">
        {ORDER_FILTERS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onFilter(chip.id)}
            className={cn(
              'h-[25px] shrink-0 rounded-full px-2.5 text-[12px] font-medium whitespace-nowrap',
              filter === chip.id
                ? 'bg-[#1a1e26] text-white'
                : 'text-[#7a7b7c] hover:bg-[#f5f5f6]',
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
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
