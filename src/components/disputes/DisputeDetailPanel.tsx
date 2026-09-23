import { useEffect, useRef } from 'react'
import { DisputeActivity } from '@/components/disputes/DisputeActivity'
import { DisputeComposer } from '@/components/disputes/DisputeComposer'
import { DisputeStatusBadge } from '@/components/disputes/DisputeStatusBadge'
import { DisputeStepper } from '@/components/disputes/DisputeStepper'
import { EmptyState } from '@/components/shared/PageChrome'
import { Icon } from '@/components/shared/Icon'
import { icons } from '@/assets'
import { cn, formatMoney } from '@/utils/format'
import type { Dispute, Lot } from '@/types'

function shortDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

export function DisputeDetailPanel({
  dispute,
  lot,
  onClose,
}: {
  dispute: Dispute
  lot?: Lot
  onClose?: () => void
}) {
  const endRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef(dispute.events.length)

  useEffect(() => {
    prevCount.current = dispute.events.length
  }, [dispute.id])

  useEffect(() => {
    if (dispute.events.length > prevCount.current) {
      endRef.current?.scrollIntoView({ block: 'nearest' })
    }
    prevCount.current = dispute.events.length
  }, [dispute.events.length])

  const metrics = [
    { label: 'Amount in dispute', value: formatMoney(dispute.amount).replace(/\.00$/, '') },
    { label: 'Opened', value: shortDate(dispute.openedAt) },
    { label: 'Last updated', value: shortDate(dispute.updatedAt) },
  ]

  return (
    <section
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white',
        onClose ? 'h-full' : 'h-full rounded-2xl border border-[#ebebec]',
      )}
    >
      <div className="shrink-0 border-b border-[#ebebec] px-4 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-[#7a7b7c]">
              {dispute.id} · {dispute.orderId}
            </p>
            <h2 className="mt-1 text-[16px] font-semibold leading-6 text-[#1a1e26]">
              {lot?.title ?? dispute.lotId}
            </h2>
            <p className="mt-1 text-[13px] text-[#7a7b7c]">Reason: {dispute.reason}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <DisputeStatusBadge status={dispute.status} />
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
        <div className="mt-5 overflow-x-auto">
          <DisputeStepper completedSteps={dispute.completedSteps} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 border-b border-[#ebebec] lg:hidden">
          {metrics.slice(0, 2).map((item, i) => (
            <div
              key={item.label}
              className={cn('min-w-0 px-4 py-3', i === 0 ? 'border-r border-[#ebebec] bg-[#f8f8f9]' : '')}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#7a7b7c]">{item.label}</p>
              <p className="mt-1 text-[18px] font-semibold tabular-nums text-[#1a1e26]">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="border-b border-[#ebebec] px-4 py-3 lg:hidden">
          <div className="rounded-xl bg-[#f8f8f9] px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#7a7b7c]">{metrics[2].label}</p>
            <p className="mt-1 text-[18px] font-semibold tabular-nums text-[#1a1e26]">{metrics[2].value}</p>
          </div>
        </div>

        <div className="hidden grid-cols-3 border-b border-[#ebebec] lg:grid">
          {metrics.map((item) => (
            <div key={item.label} className="px-6 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">{item.label}</p>
              <p className="mt-1 text-[16px] font-semibold text-[#1a1e26]">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="px-4 py-5 sm:px-6">
          <DisputeActivity events={dispute.events} />
          <div ref={endRef} />
        </div>
      </div>

      <DisputeComposer dispute={dispute} />
    </section>
  )
}

export function DisputeDetailEmpty() {
  return (
    <EmptyState title="Select a dispute" body="Choose a case from the list to see its status and activity." />
  )
}
