import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { getLot } from '@/api/fixtures'
import { OrderDetailEmpty, OrderDetailPanel } from '@/components/orders/OrderDetailPanel'
import { OrdersSidebar } from '@/components/orders/OrdersSidebar'
import { EmptyState } from '@/components/shared/PageChrome'
import { useAppSelector } from '@/store/hooks'
import type { OrderStatus } from '@/types'

export function OrdersPage() {
  const orders = useAppSelector((s) => s.orders.items)
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('order') ?? orders[0]?.id ?? null,
  )
  const [sheetOpen, setSheetOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((order) => {
      if (filter !== 'all' && order.status !== filter) return false
      if (!q) return true
      const lot = getLot(order.lotId)
      return (
        order.id.toLowerCase().includes(q) ||
        lot?.title.toLowerCase().includes(q) ||
        (order.seller ?? '').toLowerCase().includes(q)
      )
    })
  }, [orders, query, filter])

  useEffect(() => {
    if (!filtered.length) {
      if (selectedId !== null) setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some((o) => o.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

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

  const selected = filtered.find((o) => o.id === selectedId) ?? null

  const selectOrder = (id: string) => {
    setSelectedId(id)
    setSearchParams(id ? { order: id } : {}, { replace: true })
    if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches) {
      setSheetOpen(true)
    }
  }

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">
          Orders & Tracking
        </h1>
        <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">Lifecycle and shipment timeline</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" body="Settle a won bid to create your first order." />
      ) : (
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start">
          <OrdersSidebar
            orders={filtered}
            lotsById={getLot}
            selectedId={selectedId}
            query={query}
            filter={filter}
            onQuery={setQuery}
            onFilter={setFilter}
            onSelect={selectOrder}
          />
          <div className="hidden min-w-0 flex-1 lg:block">
            {selected ? (
              <OrderDetailPanel order={selected} lot={getLot(selected.lotId)} />
            ) : (
              <OrderDetailEmpty />
            )}
          </div>
        </div>
      )}

      {sheetOpen && selected
        ? createPortal(
            <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal aria-label="Order details">
              <button
                type="button"
                className="absolute inset-0 bg-[#1a1e26]/50"
                aria-label="Close order details"
                onClick={() => setSheetOpen(false)}
              />
              <aside className="absolute inset-x-0 bottom-0 flex max-h-[min(92dvh,820px)] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(26,30,38,0.2)]">
                <div className="flex justify-center pt-2.5" aria-hidden>
                  <span className="h-1 w-10 rounded-full bg-[#d7d7d9]" />
                </div>
                <OrderDetailPanel
                  order={selected}
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
