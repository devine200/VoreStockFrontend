import { FormEvent, useEffect, useRef, useState } from 'react'
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Field'
import { EmptyState } from '@/components/shared/PageChrome'
import { Icon } from '@/components/shared/Icon'
import { icons } from '@/assets'
import { useAppDispatch } from '@/store/hooks'
import { replyToTicket } from '@/store/slices/accountSlices'
import { showToast } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'
import type { SupportTicket } from '@/types'

export function TicketThread({
  ticket,
  onClose,
}: {
  ticket: SupportTicket
  onClose?: () => void
}) {
  const dispatch = useAppDispatch()
  const fileRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [reply, setReply] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const prevCount = useRef(ticket.messages.length)

  useEffect(() => {
    setReply('')
    setFiles([])
    prevCount.current = ticket.messages.length
  }, [ticket.id])

  useEffect(() => {
    if (ticket.messages.length > prevCount.current) {
      endRef.current?.scrollIntoView({ block: 'nearest' })
    }
    prevCount.current = ticket.messages.length
  }, [ticket.messages.length])

  const onSend = (e: FormEvent) => {
    e.preventDefault()
    const body = reply.trim()
    if (!body && files.length === 0) return
    dispatch(replyToTicket({ id: ticket.id, body, files }))
    dispatch(showToast(files.length ? 'Reply sent with attachments' : 'Reply sent'))
    setReply('')
    setFiles([])
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <section
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white',
        onClose ? 'h-full' : 'h-full rounded-2xl border border-[#ebebec]',
      )}
    >
      <div className="shrink-0 border-b border-[#ebebec] px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-[16px] font-semibold leading-5 text-[#1a1e26]">{ticket.subject}</h2>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden sm:inline-flex">
              <TicketStatusBadge status={ticket.status} />
            </span>
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
        <p className="mt-1 text-[13px] leading-[17px] text-[#7a7b7c]">
          {ticket.id} · {ticket.category}
        </p>
        <div className="mt-2 sm:hidden">
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
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
                {message.attachments?.length ? (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {message.attachments.map((name) => (
                      <li
                        key={name}
                        className="inline-flex max-w-full items-center gap-1 rounded-lg bg-white/80 px-2 py-1 text-[11px] text-[#46494f]"
                      >
                        <Icon src={icons.fileText} size={12} />
                        <span className="min-w-0 truncate">{name}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <p className="mt-1.5 text-[12px] leading-[15px] text-[#9ca3af]">
                {mine ? 'You' : 'Support agent'} · {message.at}
              </p>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {ticket.status === 'resolved' ? (
        <p className="shrink-0 border-t border-[#ebebec] px-5 py-4 text-[13px] text-[#9ca3af] sm:px-6">
          This ticket is resolved. The conversation is closed.
        </p>
      ) : (
        <form onSubmit={onSend} className="shrink-0 border-t border-[#ebebec] px-5 py-4 sm:px-6">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply…"
            className="min-h-[86px] rounded-xl bg-[#fafafa] px-[17px] py-[13px] text-[14px]"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            className="sr-only"
            onChange={(e) => {
              const next = Array.from(e.target.files ?? []).map((f) => f.name)
              setFiles((prev) => [...prev, ...next].slice(0, 8))
            }}
          />
          {files.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {files.map((name, i) => (
                <li
                  key={`${name}-${i}`}
                  className="inline-flex max-w-full items-center gap-1 rounded-lg bg-[#f8f8f9] py-1 pl-2 pr-1 text-[11px] text-[#46494f]"
                >
                  <Icon src={icons.fileText} size={12} />
                  <span className="min-w-0 truncate">{name}</span>
                  <button
                    type="button"
                    className="flex size-5 items-center justify-center rounded text-[#9ca3af] hover:text-[#1a1e26]"
                    aria-label={`Remove ${name}`}
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <Icon src={icons.close} size={10} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="submit"
              className="h-10 w-full px-5 text-[14px] font-semibold !bg-[#480516] sm:w-auto"
              disabled={!reply.trim() && files.length === 0}
            >
              Send reply
            </Button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#ebebec] px-4 text-[14px] font-medium text-[#46494f] hover:bg-[#fafafa]"
            >
              <Icon src={icons.fileText} size={14} />
              Attach files
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export function TicketThreadEmpty() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center rounded-2xl border border-[#ebebec] bg-white">
      <EmptyState title="Select a ticket" body="Choose a ticket from the list to view the conversation." />
    </div>
  )
}
