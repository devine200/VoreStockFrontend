import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { EmptyState } from '@/components/shared/PageChrome'
import type { Lot, Order } from '@/types'

function formatPlaced(iso: string) {
  return `Placed ${new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))}`
}

export function OrderDetailPanel({ order, lot }: { order: Order; lot?: Lot }) {
  const done = order.checkpointDone ?? order.steps.filter((s) => s.done).length
  const total = order.checkpointTotal ?? order.steps.length
  const eta = order.eta ? `ETA ${order.eta}` : null
  const seller = order.seller ?? lot?.brand

  return (
    <section className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-white">
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[18px] font-semibold leading-6 text-[#1a1e26]">
              {lot?.title ?? order.lotId}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-[#7a7b7c]">
              <span>{order.id}</span>
              <span aria-hidden>·</span>
              <span>{formatPlaced(order.placedAt)}</span>
              {eta ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{eta}</span>
                </>
              ) : null}
            </p>
            {seller ? <p className="mt-1 text-[13px] text-[#7a7b7c]">Seller: {seller}</p> : null}
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[13px] text-[#7a7b7c]">
            <span>
              {done} of {total} steps complete
            </span>
            <span>{order.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-wine-500 transition-all"
              style={{ width: `${order.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="border-b border-border px-6 py-3">
        <Link
          to="/support"
          className="inline-flex h-[34px] items-center rounded-lg border border-border px-4 text-[13px] font-medium text-[#46494f] hover:bg-[#fafafa]"
        >
          Contact support
        </Link>
      </div>

      <div className="px-6 py-5">
        <OrderTimeline steps={order.steps} />
      </div>
    </section>
  )
}

export function OrderDetailEmpty() {
  return <EmptyState title="Select an order" body="Choose an order from the list to see its shipment timeline." />
}
