import { useEffect, useRef, useState } from 'react'
import { NewTicketForm } from '@/components/support/NewTicketForm'
import { TicketThread, TicketThreadEmpty } from '@/components/support/TicketThread'
import { TicketsSidebar } from '@/components/support/TicketsSidebar'
import { Button } from '@/components/shared/Button'
import { PageHeader } from '@/components/shared/PageChrome'
import { useAppSelector } from '@/store/hooks'

function scrollToNewTicket() {
  document.getElementById('new-ticket')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function SupportPage() {
  const tickets = useAppSelector((s) => s.tickets.items)
  const [selectedId, setSelectedId] = useState<string | null>(tickets[0]?.id ?? null)
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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Support"
        subtitle="Tickets and conversations with our team"
        actions={
          <Button type="button" className="h-10 px-5" onClick={scrollToNewTicket}>
            + New ticket
          </Button>
        }
      />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <TicketsSidebar
          tickets={tickets}
          selectedId={selectedId}
          openCount={openCount}
          onSelect={setSelectedId}
          onNewTicket={scrollToNewTicket}
        />
        {selected ? (
          <TicketThread ticket={selected} />
        ) : (
          <div className="min-w-0 flex-1">
            <TicketThreadEmpty />
          </div>
        )}
      </div>
      <div className="mt-6">
        <NewTicketForm />
      </div>
    </div>
  )
}
