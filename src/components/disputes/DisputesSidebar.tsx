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
        'flex w-full items-start gap-3 rounded-xl px-[19px] py-[17px] text-left transition',
        selected ? 'border border-wine-500 bg-wine-50' : 'border border-transparent hover:bg-[#fafafa]',
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
        {lot ? (
          <img src={lot.image} alt="" className="size-8 object-cover" />
        ) : (
          <span className="size-8 rounded bg-surface" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold leading-5 text-[#1a1e26] line-clamp-2">
          {lot?.title ?? dispute.lotId}
        </span>
        <span className="mt-0.5 block text-[13px] leading-5 text-[#7a7b7c]">
          {dispute.id} · {dispute.reason}
        </span>
      </span>
      <DisputeStatusBadge status={dispute.status} />
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
    <aside className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-white lg:w-[558px] lg:shrink-0">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-[14px] font-semibold text-[#1a1e26]">Your disputes</h2>
        {openCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-wine-500 text-[11px] font-medium text-white">
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
