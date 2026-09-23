import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DisputeDetailEmpty, DisputeDetailPanel } from '@/components/disputes/DisputeDetailPanel'
import { DisputesSidebar } from '@/components/disputes/DisputesSidebar'
import { OpenDisputeForm } from '@/components/disputes/OpenDisputeForm'
import { getLot } from '@/api/fixtures'
import { useAppSelector } from '@/store/hooks'

export function DisputesPage() {
  const disputes = useAppSelector((s) => s.disputes.items)
  const [selectedId, setSelectedId] = useState<string | null>(disputes[0]?.id ?? null)
  const [sheetOpen, setSheetOpen] = useState(false)
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

  const selectDispute = (id: string) => {
    setSelectedId(id)
    if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches) {
      setSheetOpen(true)
    }
  }

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">Disputes</h1>
        <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">Transaction and order dispute management</p>
      </div>

      <OpenDisputeForm />

      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start">
        <DisputesSidebar
          disputes={disputes}
          lotsById={getLot}
          selectedId={selectedId}
          openCount={openCount}
          onSelect={selectDispute}
        />
        <div className="hidden min-w-0 flex-1 lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-8rem)]">
          {selected ? (
            <DisputeDetailPanel dispute={selected} lot={getLot(selected.lotId)} />
          ) : (
            <DisputeDetailEmpty />
          )}
        </div>
      </div>

      {sheetOpen && selected
        ? createPortal(
            <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal aria-label="Dispute details">
              <button
                type="button"
                className="absolute inset-0 bg-[#1a1e26]/50"
                aria-label="Close dispute details"
                onClick={() => setSheetOpen(false)}
              />
              <aside className="absolute inset-x-0 bottom-0 flex max-h-[min(92dvh,820px)] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(26,30,38,0.2)]">
                <div className="flex justify-center pt-2.5" aria-hidden>
                  <span className="h-1 w-10 rounded-full bg-[#d7d7d9]" />
                </div>
                <DisputeDetailPanel
                  dispute={selected}
                  lot={getLot(selected.lotId)}
                  onClose={() => setSheetOpen(false)}
                />
              </aside>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
