import { FormEvent, useState } from 'react'
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Field'
import { EmptyState } from '@/components/shared/PageChrome'
import { useAppDispatch } from '@/store/hooks'
import { replyToTicket } from '@/store/slices/accountSlices'
import { cn } from '@/utils/format'
import type { SupportTicket } from '@/types'

export function TicketThread({ ticket }: { ticket: SupportTicket }) {
  const dispatch = useAppDispatch()
  const [reply, setReply] = useState('')

  const onSend = (e: FormEvent) => {
    e.preventDefault()
    const body = reply.trim()
    if (!body) return
    dispatch(replyToTicket({ id: ticket.id, body }))
    setReply('')
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold leading-5 text-[#1a1e26]">{ticket.subject}</h2>
          <p className="mt-1 text-[13px] text-[#7a7b7c]">
            {ticket.id} · {ticket.category}
          </p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="flex-1 space-y-5 px-6 py-5">
        {ticket.messages.map((message, i) => {
          const mine = message.from === 'you'
          return (
            <div key={`${message.at}-${i}`} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'max-w-[90%] rounded-2xl px-4 py-3 text-[14px] leading-6 text-[#1a1e26]',
                  mine ? 'bg-[#f5f5f6]' : 'bg-[#ececed]',
                )}
              >
                {message.body}
              </div>
              <p className="mt-1.5 text-[12px] text-[#9ca3af]">
                {mine ? 'You' : 'Support agent'} · {message.at}
              </p>
            </div>
          )
        })}
      </div>

      {ticket.status === 'resolved' ? (
        <p className="border-t border-border px-6 py-4 text-[13px] text-[#9ca3af]">This ticket is resolved.</p>
      ) : (
        <form onSubmit={onSend} className="border-t border-border px-6 py-4">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply…"
            className="min-h-[86px] bg-[#fafafa]"
          />
          <Button type="submit" className="mt-3 h-10 px-5" disabled={!reply.trim()}>
            Send reply
          </Button>
        </form>
      )}
    </section>
  )
}

export function TicketThreadEmpty() {
  return <EmptyState title="Select a ticket" body="Choose a ticket from the list to view the conversation." />
}
