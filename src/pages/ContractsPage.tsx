import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ContractDetailEmpty, ContractDetailPanel } from '@/components/contracts/ContractDetailPanel'
import { ContractsSidebar } from '@/components/contracts/ContractsSidebar'
import { EmptyState } from '@/components/shared/PageChrome'
import { useAppSelector } from '@/store/hooks'

export function ContractsPage() {
  const contracts = useAppSelector((s) => s.contracts.items)
  const [selectedId, setSelectedId] = useState<string | null>(contracts[0]?.id ?? null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const awaiting = useMemo(
    () => contracts.filter((c) => c.status === 'awaiting_signature').length,
    [contracts],
  )

  useEffect(() => {
    if (!contracts.length) {
      if (selectedId !== null) setSelectedId(null)
      return
    }
    if (!selectedId || !contracts.some((c) => c.id === selectedId)) {
      setSelectedId(contracts[0].id)
    }
  }, [contracts, selectedId])

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

  const selected = contracts.find((c) => c.id === selectedId) ?? null

  const selectContract = (id: string) => {
    setSelectedId(id)
    if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches) {
      setSheetOpen(true)
    }
  }

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">Contracts</h1>
          <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">
            Agreements connected to your purchases and transactions
          </p>
        </div>
        {awaiting > 0 ? (
          <span className="inline-flex h-[34px] w-fit items-center gap-2 rounded-full bg-[#fff6e5] px-3 text-[13px] font-medium text-[#8a6116]">
            <span className="h-2 w-2 rounded-full bg-[#b45309]" />
            {awaiting} contract{awaiting === 1 ? '' : 's'} awaiting signature
          </span>
        ) : null}
      </div>

      {contracts.length === 0 ? (
        <EmptyState title="No contracts" body="Contracts appear here after you win and settle a lot." />
      ) : (
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start">
          <ContractsSidebar contracts={contracts} selectedId={selectedId} onSelect={selectContract} />
          <div className="hidden min-w-0 flex-1 lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-8rem)]">
            {selected ? <ContractDetailPanel contract={selected} /> : <ContractDetailEmpty />}
          </div>
        </div>
      )}

      {sheetOpen && selected
        ? createPortal(
            <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal aria-label="Contract details">
              <button
                type="button"
                className="absolute inset-0 bg-[#1a1e26]/50"
                aria-label="Close contract details"
                onClick={() => setSheetOpen(false)}
              />
              <aside className="absolute inset-x-0 bottom-0 flex max-h-[min(92dvh,820px)] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(26,30,38,0.2)]">
                <div className="flex justify-center pt-2.5" aria-hidden>
                  <span className="h-1 w-10 rounded-full bg-[#d7d7d9]" />
                </div>
                <ContractDetailPanel contract={selected} onClose={() => setSheetOpen(false)} />
              </aside>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
