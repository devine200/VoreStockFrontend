import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NewTicketForm } from '@/components/support/NewTicketForm'
import { TicketThread, TicketThreadEmpty } from '@/components/support/TicketThread'
import { TicketsSidebar } from '@/components/support/TicketsSidebar'
import { Button } from '@/components/shared/Button'
import { useAppSelector } from '@/store/hooks'

function scrollToNewTicket() {
  document.getElementById('new-ticket')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function SupportPage() {
  const tickets = useAppSelector((s) => s.tickets.items)
  const [selectedId, setSelectedId] = useState<string | null>(tickets[0]?.id ?? null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const prevCount = useRef(tickets.length)
  const openCount = tickets.filter((t) => t.status !== 'resolved').length
  const selected = tickets.find((t) => t.id === selectedId) ?? null

  useEffect(() => {
    if (tickets.length > prevCount.current && tickets[0]) {
      setSelectedId(tickets[0].id)
    }
    prevCount.current = tickets.length
  }, [tickets])

  useEffect(() => {
    if (!tickets.length) {
      if (selectedId !== null) setSelectedId(null)
      return
    }
    if (!selectedId || !tickets.some((t) => t.id === selectedId)) {
      setSelectedId(tickets[0].id)
    }
  }, [tickets, selectedId])

  useEffect(() => {
    if (!sheetOpen) return
    document.body.style.overflow = 'hidden'
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) setSheetOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('resize', onResize)
    }
  }, [sheetOpen])

  const selectTicket = (id: string) => {
    setSelectedId(id)
    if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches) {
      setSheetOpen(true)
    }
  }

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">Support</h1>
          <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">Tickets and conversations with our team</p>
        </div>
        <Button
          type="button"
          className="h-10 w-fit px-5 text-[14px] font-semibold !bg-[#480516]"
          onClick={scrollToNewTicket}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M6.5 2.4v8.2M2.4 6.5h8.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          New ticket
        </Button>
      </div>

      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start">
        <TicketsSidebar
          tickets={tickets}
          selectedId={selectedId}
          openCount={openCount}
          onSelect={selectTicket}
          onNewTicket={scrollToNewTicket}
        />
        <div className="hidden min-w-0 flex-1 lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-8rem)]">
          {selected ? <TicketThread ticket={selected} /> : <TicketThreadEmpty />}
        </div>
      </div>

      <NewTicketForm />

      {sheetOpen && selected
        ? createPortal(
            <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal aria-label="Ticket conversation">
              <button
                type="button"
                className="absolute inset-0 bg-[#1a1e26]/50"
                aria-label="Close ticket"
                onClick={() => setSheetOpen(false)}
              />
              <aside className="absolute inset-x-0 bottom-0 flex max-h-[min(92dvh,820px)] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(26,30,38,0.2)]">
                <div className="flex justify-center pt-2.5" aria-hidden>
                  <span className="h-1 w-10 rounded-full bg-[#d7d7d9]" />
                </div>
                <TicketThread ticket={selected} onClose={() => setSheetOpen(false)} />
              </aside>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
