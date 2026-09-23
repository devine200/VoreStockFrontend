import { Link } from 'react-router-dom'
import { icons } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { EmptyState } from '@/components/shared/PageChrome'
import { useAppDispatch } from '@/store/hooks'
import { showToast } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'
import type { Lot, Order } from '@/types'

const INTAKE_LABELS = ['Front', 'Back', 'Serial Label', 'Packaging'] as const

function formatPlaced(iso: string) {
  return `Placed ${new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))}`
}

function PhotoPlaceholder() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="3.5" y="6" width="21" height="16" rx="2.5" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="10" cy="12.5" r="2" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M6.5 19.5 11 15l3.5 3.5 3-3 4 4" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function OrderDetailPanel({
  order,
  lot,
  onClose,
}: {
  order: Order
  lot?: Lot
  onClose?: () => void
}) {
  const dispatch = useAppDispatch()
  const done = order.checkpointDone ?? order.steps.filter((s) => s.done).length
  const total = order.checkpointTotal ?? order.steps.length
  const eta = order.eta ? `ETA ${order.eta}` : null
  const seller = order.seller ?? lot?.brand

  return (
    <section className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white', onClose ? 'h-full' : 'rounded-2xl border border-[#ebebec]')}>
      <div className="shrink-0 border-b border-[#ebebec] px-4 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold leading-6 tracking-[-0.2px] text-[#1a1e26] sm:text-[18px]">
              {lot?.title ?? order.lotId}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[12px] leading-4 text-[#7a7b7c]">
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
            {seller ? <p className="mt-1 text-[12px] leading-4 text-[#7a7b7c]">Seller: {seller}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full border border-[#ebebec] text-[#7a7b7c] lg:hidden"
                aria-label="Close"
              >
                <Icon src={icons.close} size={16} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[11px] leading-[16.5px]">
            <span className="text-[#7a7b7c]">
              {done} of {total} steps complete
            </span>
            <span className="font-medium text-[#480516]">{order.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#f5f5f6]">
            <div
              className="h-full rounded-full bg-[#480516] transition-all"
              style={{ width: `${order.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className={cn(onClose ? 'min-h-0 flex-1 overflow-y-auto' : '')}>
        <div className="px-4 py-5 sm:px-6">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
            <p className="text-[13.5px] font-semibold text-[#1a1e26]">Intake Photos</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {INTAKE_LABELS.map((label) => (
                <div key={label} className="min-w-0">
                  <div className="flex h-[90px] items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
                    <PhotoPlaceholder />
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-[#475569]">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 truncate text-[14px] font-medium text-[#1a1e26]">
                {order.imei ? `IMEI: ${order.imei}` : 'Intake pack'}
              </p>
              <button
                type="button"
                onClick={() => dispatch(showToast('Intake photos download started'))}
                className="inline-flex h-[34px] shrink-0 items-center justify-center rounded-xl bg-[#480516] px-4 text-[14px] font-semibold text-white hover:bg-[#5a0a1c]"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        <div className="border-y border-[#ebebec] px-4 py-3 sm:px-6">
          <Link
            to="/support"
            className="inline-flex h-[34px] items-center rounded-xl border border-[#ebebec] bg-white px-4 text-[13px] font-medium text-[#46494f] hover:bg-[#fafafa]"
          >
            Contact support
          </Link>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <OrderTimeline steps={order.steps} />
        </div>
      </div>
    </section>
  )
}

export function OrderDetailEmpty() {
  return <EmptyState title="Select an order" body="Choose an order from the list to see its shipment timeline." />
}
