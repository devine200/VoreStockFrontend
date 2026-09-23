import { DisputeStatusBadge } from '@/components/disputes/DisputeStatusBadge'
import { cn } from '@/utils/format'
import type { Dispute, Lot } from '@/types'

export function DisputeListCard({
  dispute,
  lot,
  selected,
  onSelect,
}: {
  dispute: Dispute
  lot?: Lot
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full min-w-0 items-start gap-3 rounded-xl px-3 py-3.5 text-left transition sm:px-[19px] sm:py-[17px]',
        selected
          ? 'border border-[#480516] bg-[#fdfbfb]'
          : 'border border-transparent hover:bg-[#fafafa]',
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f8f8f9]">
        {lot ? (
          <img src={lot.image} alt="" className="size-8 object-cover" />
        ) : (
          <span className="size-8 rounded bg-[#f5f5f6]" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0 text-[14px] font-semibold leading-5 text-[#1a1e26] line-clamp-2">
            {lot?.title ?? dispute.lotId}
          </span>
          <span className="shrink-0">
            <DisputeStatusBadge status={dispute.status} />
          </span>
        </span>
        <span className="mt-0.5 block text-[12px] leading-5 text-[#7a7b7c] sm:text-[13px]">
          {dispute.id} · {dispute.reason}
        </span>
      </span>
    </button>
  )
}

export function DisputesSidebar({
  disputes,
  lotsById,
  selectedId,
  openCount,
  onSelect,
}: {
  disputes: Dispute[]
  lotsById: (id: string) => Lot | undefined
  selectedId: string | null
  openCount: number
  onSelect: (id: string) => void
}) {
  return (
    <aside className="flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ebebec] bg-white lg:w-[558px] lg:max-w-[558px] lg:shrink-0">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">Your disputes</h2>
        {openCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-[#480516] text-[11px] font-medium text-white">
            {openCount}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 px-2 pb-3">
        {disputes.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-[#9ca3af]">No disputes yet.</p>
        ) : (
          disputes.map((dispute) => (
            <DisputeListCard
              key={dispute.id}
              dispute={dispute}
              lot={lotsById(dispute.lotId)}
              selected={dispute.id === selectedId}
              onSelect={() => onSelect(dispute.id)}
            />
          ))
        )}
      </div>
    </aside>
  )
}
