import { useEffect, useRef, useState } from 'react'
import { DisputeDetailEmpty, DisputeDetailPanel } from '@/components/disputes/DisputeDetailPanel'
import { DisputesSidebar } from '@/components/disputes/DisputesSidebar'
import { OpenDisputeForm } from '@/components/disputes/OpenDisputeForm'
import { PageHeader } from '@/components/shared/PageChrome'
import { getLot } from '@/api/fixtures'
import { useAppSelector } from '@/store/hooks'

export function DisputesPage() {
  const disputes = useAppSelector((s) => s.disputes.items)
  const [selectedId, setSelectedId] = useState<string | null>(disputes[0]?.id ?? null)
  const prevCount = useRef(disputes.length)
  const openCount = disputes.filter((d) => d.status !== 'resolved' && d.status !== 'closed').length
  const selected = disputes.find((d) => d.id === selectedId) ?? null

  useEffect(() => {
    if (disputes.length > prevCount.current && disputes[0]) {
      setSelectedId(disputes[0].id)
    }
    prevCount.current = disputes.length
  }, [disputes])

  useEffect(() => {
    if (!disputes.length) {
      if (selectedId !== null) setSelectedId(null)
      return
    }
    if (!selectedId || !disputes.some((d) => d.id === selectedId)) {
      setSelectedId(disputes[0].id)
    }
  }, [disputes, selectedId])

  return (
    <div className="animate-fade-in">
      <PageHeader title="Disputes" subtitle="Transaction and order dispute management" />
      <OpenDisputeForm />
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <DisputesSidebar
          disputes={disputes}
          lotsById={getLot}
          selectedId={selectedId}
          openCount={openCount}
          onSelect={setSelectedId}
        />
        {selected ? (
          <DisputeDetailPanel dispute={selected} lot={getLot(selected.lotId)} />
        ) : (
          <div className="min-w-0 flex-1">
            <DisputeDetailEmpty />
          </div>
        )}
      </div>
    </div>
  )
}
