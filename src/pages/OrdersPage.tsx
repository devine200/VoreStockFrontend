import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getLot } from '@/api/fixtures'
import { OrderDetailEmpty, OrderDetailPanel } from '@/components/orders/OrderDetailPanel'
import { OrdersSidebar } from '@/components/orders/OrdersSidebar'
import { EmptyState, PageHeader } from '@/components/shared/PageChrome'
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

  const selected = filtered.find((o) => o.id === selectedId) ?? null

  const selectOrder = (id: string) => {
    setSelectedId(id)
    setSearchParams(id ? { order: id } : {}, { replace: true })
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Orders & Tracking" subtitle="Lifecycle and shipment timeline" />
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" body="Settle a won bid to create your first order." />
      ) : (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
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
          {selected ? (
            <OrderDetailPanel order={selected} lot={getLot(selected.lotId)} />
          ) : (
            <div className="min-w-0 flex-1">
              <OrderDetailEmpty />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
