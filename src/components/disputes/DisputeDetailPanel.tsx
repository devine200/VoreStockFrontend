import { DisputeActivity } from '@/components/disputes/DisputeActivity'
import { DisputeStatusBadge } from '@/components/disputes/DisputeStatusBadge'
import { DisputeStepper } from '@/components/disputes/DisputeStepper'
import { EmptyState } from '@/components/shared/PageChrome'
import { formatMoney } from '@/utils/format'
import type { Dispute, Lot } from '@/types'

function shortDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

export function DisputeDetailPanel({ dispute, lot }: { dispute: Dispute; lot?: Lot }) {
  return (
    <section className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-white">
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] text-[#7a7b7c]">
              {dispute.id} · {dispute.orderId}
            </p>
            <h2 className="mt-1 text-[16px] font-semibold leading-6 text-[#1a1e26]">
              {lot?.title ?? dispute.lotId}
            </h2>
            <p className="mt-1 text-[13px] text-[#7a7b7c]">Reason: {dispute.reason}</p>
          </div>
          <DisputeStatusBadge status={dispute.status} />
        </div>
        <div className="mt-5">
          <DisputeStepper completedSteps={dispute.completedSteps} />
        </div>
      </div>

      <div className="grid grid-cols-1 border-b border-border sm:grid-cols-3">
        {[
          { label: 'Amount in dispute', value: formatMoney(dispute.amount).replace(/\.00$/, '') },
          { label: 'Opened', value: shortDate(dispute.openedAt) },
          { label: 'Last updated', value: shortDate(dispute.updatedAt) },
        ].map((item) => (
          <div key={item.label} className="px-6 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">{item.label}</p>
            <p className="mt-1 text-[16px] font-semibold text-[#1a1e26]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="px-6 py-5">
        <DisputeActivity events={dispute.events} />
      </div>
    </section>
  )
}

export function DisputeDetailEmpty() {
  return (
    <EmptyState title="Select a dispute" body="Choose a case from the list to see its status and activity." />
  )
}
