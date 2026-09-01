import { TicketStatusBadge } from '@/components/support/TicketStatusBadge'
import { relativeTime } from '@/components/support/relativeTime'
import { cn } from '@/utils/format'
import type { SupportTicket } from '@/types'

export function TicketsSidebar({
  tickets,
  selectedId,
  openCount,
  onSelect,
  onNewTicket,
}: {
  tickets: SupportTicket[]
  selectedId: string | null
  openCount: number
  onSelect: (id: string) => void
  onNewTicket: () => void
}) {
  return (
    <aside className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-white lg:w-[508px] lg:shrink-0">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-[14px] font-semibold text-[#1a1e26]">Your tickets</h2>
        {openCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-wine-500 text-[11px] font-medium text-white">
            {openCount}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 px-3 pb-2">
        {tickets.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-[#9ca3af]">No tickets yet.</p>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelect(ticket.id)}
              className={cn(
                'flex w-full items-start justify-between gap-3 rounded-xl px-[19px] py-[17px] text-left transition',
                selectedId === ticket.id
                  ? 'border border-wine-500 bg-wine-50'
                  : 'border border-transparent hover:bg-[#fafafa]',
              )}
            >
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold leading-5 text-[#1a1e26] line-clamp-2">
                  {ticket.subject}
                </span>
                <span className="mt-1 block text-[12px] text-[#7a7b7c]">
                  {ticket.id} · {relativeTime(ticket.updatedAt)}
                </span>
              </span>
              <TicketStatusBadge status={ticket.status} />
            </button>
          ))
        )}
      </div>
      <div className="border-t border-border px-4 py-4">
        <button
          type="button"
          onClick={onNewTicket}
          className="w-full text-center text-[13px] font-medium text-wine-500 hover:underline"
        >
          + Open a new ticket
        </button>
      </div>
    </aside>
  )
}
