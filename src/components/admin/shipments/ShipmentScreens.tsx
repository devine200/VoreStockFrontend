import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKv,
  AdminSearch,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminDetailShell,
  AdminListShell,
  AdminNotFound,
  AdminStageTracker,
  AdminTablePanel,
  StatusCell,
  matchesQuery,
} from '@/components/admin/screens'
import { Icon } from '@/components/shared/Icon'
import { adminIcons } from '@/assets/admin'
import { cn } from '@/utils/format'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateShipment } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminShipment, AdminShipmentTimelineEvent } from '@/types/admin'

const SHIPMENT_STAGES = ['Shipped', 'Customs', 'Out for Delivery', 'Delivered'] as const

const STATUS_OPTIONS = ['In Transit', 'Customs Clearance', 'Out for Delivery', 'Delivered'] as const

function StageTracker({ currentIndex, allDone }: { currentIndex: number; allDone?: boolean }) {
  return <AdminStageTracker stages={SHIPMENT_STAGES} currentIndex={currentIndex} complete={allDone} />
}

function ShipmentTimeline({ items }: { items: AdminShipmentTimelineEvent[] }) {
  return (
    <AdminCard title="Shipment timeline" className="h-full">
      <ol className="mt-1 space-y-0">
        {items.map((ev, i) => {
          const done = ev.state === 'done'
          const current = ev.state === 'current'
          return (
            <li key={ev.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'mt-0.5 size-2 shrink-0 rounded-full',
                    (done || current) && 'bg-emerald-500',
                    ev.state === 'pending' && 'bg-slate-300',
                  )}
                />
                {i < items.length - 1 ? <span className="w-px flex-1 bg-slate-200" /> : null}
              </div>
              <div className={cn('pb-4', i === items.length - 1 && 'pb-0')}>
                <p className={cn('text-[13px] font-medium', done || current ? 'text-slate-800' : 'text-slate-400')}>
                  {ev.label}
                </p>
                <p className="mt-0.5 text-[12px] text-slate-400">{ev.at}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </AdminCard>
  )
}

function Banner({ tone, children }: { tone: 'success' | 'danger' | 'info'; children: ReactNode }) {
  const styles = {
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    danger: 'border-red-100 bg-red-50 text-red-700',
    info: 'border-blue-100 bg-blue-50 text-blue-700',
  }[tone]
  return (
    <p className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-[13px] leading-5 ${styles}`}>
      <span
        className={cn(
          'mt-0.5 inline-flex size-[15px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
          tone === 'success' ? 'bg-emerald-500 text-white' : 'border border-current',
        )}
      >
        {tone === 'success' ? '✓' : 'i'}
      </span>
      <span>{children}</span>
    </p>
  )
}

function OrdersInShipment({ orders }: { orders: AdminShipment['orders'] }) {
  const navigate = useNavigate()
  return (
    <div>
      <div className="mb-3">
        <p className="text-[15px] font-semibold text-slate-800">Orders in shipment</p>
        <p className="mt-0.5 text-[12px] text-slate-500">Orders and lots included in this Aquantuo batch.</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="hidden lg:block">
          <div
            className="grid gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[10px] font-medium uppercase tracking-wide text-slate-400"
            style={{ gridTemplateColumns: '0.85fr 1.1fr 1.4fr 1fr 1fr 56px' }}
          >
            {['Order ID', 'Buyer', 'Lot / Product', 'Logistics stage', 'Tracking', ''].map((h) => (
              <span key={h || 'action'}>{h}</span>
            ))}
          </div>
          {orders.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => navigate(`/admin/orders/${o.id}`)}
              className="grid w-full gap-2 border-b border-slate-100 px-4 py-3.5 text-left text-[13px] last:border-b-0 hover:bg-slate-50"
              style={{ gridTemplateColumns: '0.85fr 1.1fr 1.4fr 1fr 1fr 56px' }}
            >
              <span className="font-medium text-[#480516]">{o.id}</span>
              <span className="text-slate-800">{o.buyer}</span>
              <span className="text-[12.5px] text-slate-700">{o.lot}</span>
              <span>
                <StatusCell status={o.logisticsStage} />
              </span>
              <span className="text-[12.5px] text-slate-600">{o.tracking}</span>
              <span className="text-right font-medium text-[#480516]">Open</span>
            </button>
          ))}
        </div>
        <div className="divide-y divide-slate-100 lg:hidden">
          {orders.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => navigate(`/admin/orders/${o.id}`)}
              className="block w-full px-4 py-3.5 text-left hover:bg-slate-50"
            >
              <p className="font-medium text-[#480516]">{o.id}</p>
              <p className="mt-0.5 text-[12.5px] text-slate-600">
                {o.buyer} · {o.lot}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <StatusCell status={o.logisticsStage} />
                <span className="text-[13px] font-medium text-[#480516]">Open</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function advanceTimeline(items: AdminShipmentTimelineEvent[], toLabel: string): AdminShipmentTimelineEvent[] {
  const idx = items.findIndex((t) => t.label === toLabel || t.label.startsWith(toLabel.split(' ')[0]!))
  if (idx < 0) return items
  const now = 'Just now'
  return items.map((t, i) => {
    if (i < idx) return { ...t, state: 'done' as const, at: t.at === '—' ? now : t.at }
    if (i === idx) return { ...t, state: 'current' as const, at: t.at === '—' || t.state === 'pending' ? now : t.at }
    return { ...t, state: 'pending' as const }
  })
}

function statusToStageIndex(status: string): number {
  if (status === 'Delivered') return 3
  if (status === 'Out for Delivery') return 2
  if (status === 'Customs Clearance') return 1
  return 0
}

function statusToTimelineLabel(status: string): string {
  if (status === 'Customs Clearance') return 'Customs'
  if (status === 'In Transit') return 'Shipped'
  return status
}

function logisticsLabel(status: string): string {
  if (status === 'Customs Clearance') return 'Customs'
  if (status === 'In Transit') return 'In Transit'
  return status
}

function defaultNewStatus(status?: string) {
  if (status === 'In Transit') return 'Customs Clearance'
  if (status === 'Customs Clearance') return 'Out for Delivery'
  return 'Delivered'
}

function defaultNote(status?: string) {
  if (status === 'In Transit') return 'Departed Lagos hub, en route to customs'
  if (status === 'Customs Clearance') return 'Cleared Lagos customs, dispatched to last-mile courier'
  return ''
}

export function ShipmentsList() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.shipments)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [method, setMethod] = useState('All')
  const [sort, setSort] = useState('Last updated')
  const filtered = useMemo(() => {
    const list = rows.filter((r) => {
      if (!matchesQuery(`${r.id} ${r.suiteId} ${r.tracking} ${r.orders.map((o) => o.id).join(' ')}`, query)) return false
      if (status !== 'All' && r.status !== status) return false
      if (method !== 'All' && r.method !== method) return false
      return true
    })
    if (sort === 'Oldest first') return [...list].reverse()
    return list
  }, [rows, query, status, method, sort])

  return (
    <AdminListShell title="Shipments" subtitle="Manage Aquantuo shipping batches, air freight, and tracking.">
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch
              className="w-full sm:w-[300px]"
              value={query}
              onChange={setQuery}
              placeholder="Search by Shipment, Suite, Order, or AWB"
            />
            <AdminFilter
              label="Status"
              value={status}
              onChange={setStatus}
              options={['All', 'In Transit', 'Customs Clearance', 'Delivered']}
            />
            <AdminFilter
              label="Method"
              value={method}
              onChange={setMethod}
              options={['All', 'Air freight', 'Sea freight']}
            />
          </>
        }
        secondaryToolbar={
          <>
            <AdminFilter label="Date" value="All time" onChange={() => undefined} options={['All time']} />
            <AdminFilter
              label="Sort"
              value={sort}
              onChange={setSort}
              options={['Last updated', 'Oldest first']}
            />
          </>
        }
      >
        <AdminDataTable
          embedded
          tall
          pageSize={8}
          noun="shipments"
          rows={filtered}
          grid="0.9fr 0.9fr 0.6fr 0.9fr 1.15fr 1fr 1.15fr 0.7fr 0.7fr 56px"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/shipments/${r.id}`)}
          columns={[
            {
              header: 'Batch ID',
              render: (r) => <span className="font-medium text-[#480516]">{r.id}</span>,
            },
            { header: 'Suite ID', render: (r) => <span className="text-[13px] text-slate-700">{r.suiteId}</span> },
            { header: 'Orders', render: (r) => <span className="text-[13px] text-slate-800">{r.orderCount}</span> },
            { header: 'Method', render: (r) => <span className="text-[12.5px] text-slate-700">{r.method}</span> },
            {
              header: 'Air freight status',
              render: (r) =>
                r.airFreightStatus === '—' ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  <StatusCell status={r.airFreightStatus} />
                ),
            },
            {
              header: 'Tracking / AWB',
              render: (r) => <span className="text-[12.5px] text-slate-700">{r.tracking}</span>,
            },
            { header: 'Current status', render: (r) => <StatusCell status={r.status} /> },
            {
              header: 'Created',
              render: (r) => <span className="text-[12.5px] text-slate-500">{r.created}</span>,
            },
            {
              header: 'Updated',
              render: (r) => <span className="text-[12.5px] text-slate-500">{r.updated}</span>,
            },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function ShipmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.shipments.find((r) => r.id === id))
  const [newStatus, setNewStatus] = useState(defaultNewStatus(item?.status))
  const [tracking, setTracking] = useState(item?.tracking ?? '')
  const [note, setNote] = useState(defaultNote(item?.status))

  useEffect(() => {
    if (!item) return
    setNewStatus(defaultNewStatus(item.status))
    setTracking(item.tracking)
    setNote(defaultNote(item.status))
  }, [item])

  if (!item) return <AdminNotFound label="Back to shipments" to="/admin/shipments" />

  const delivered = item.status === 'Delivered'

  const onUpdate = () => {
    const nextIndex = statusToStageIndex(newStatus)
    const timelineLabel = statusToTimelineLabel(newStatus)
    const isDelivered = newStatus === 'Delivered'
    dispatch(
      updateShipment({
        id: item.id,
        patch: {
          status: newStatus,
          airFreightStatus: item.method === 'Sea freight' ? '—' : newStatus,
          tracking: tracking.trim() || item.tracking,
          stageIndex: nextIndex,
          lastUpdatedAt: 'Just now',
          canUpdate: !isDelivered,
          ...(isDelivered
            ? {
                deliveredBanner: 'Shipment marked delivered & complete just now by Ops Admin.',
                buyerConfirmed: 'Yes',
                confirmedBy: 'Ops Admin',
                confirmedAt: 'Just now',
                deliveryNote: note.trim() || item.deliveryNote,
                hasPod: true,
                currentLocation: 'Delivered',
              }
            : newStatus === 'Customs Clearance'
              ? { currentLocation: 'Lagos customs facility' }
              : newStatus === 'Out for Delivery'
                ? { currentLocation: 'Last-mile courier' }
                : {}),
        },
        timeline: isDelivered
          ? item.timeline.map((t) => ({
              ...t,
              state: 'done' as const,
              at: t.at === '—' ? 'Just now' : t.at,
            }))
          : advanceTimeline(item.timeline, timelineLabel),
        ordersLogistics: logisticsLabel(newStatus),
        historyTitle: `Shipment updated → ${newStatus}`,
      }),
    )
    dispatch(showToast('Shipment updated'))
  }

  return (
    <AdminDetailShell
      backLabel="Back to Shipments"
      onBack={() => navigate('/admin/shipments')}
      title={item.id}
      badge={item.status}
      subtitle={`Suite ${item.suiteId} · ${item.method} · ${item.orderCount} orders in batch`}
    >
      <StageTracker currentIndex={item.stageIndex} allDone={delivered} />

      {delivered && item.deliveredBanner ? <Banner tone="success">{item.deliveredBanner}</Banner> : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        {delivered ? (
          <AdminCard title="Delivery confirmation" className="space-y-3">
            <AdminKv label="Buyer confirmed receipt" value={<AdminBadge kind="success" status="Yes" />} />
            <AdminKv label="Confirmed by" value={item.confirmedBy ?? '—'} />
            <AdminKv label="Confirmation date/time" value={item.confirmedAt ?? '—'} />
            <AdminKv label="Delivery note" value={item.deliveryNote ?? '—'} />
            {item.hasPod ? (
              <div className="pt-1">
                <p className="mb-2 text-[12px] text-slate-500">Proof of delivery</p>
                <div className="flex h-[67px] w-[145px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                  <Icon src={adminIcons.file} size={28} />
                </div>
              </div>
            ) : null}
          </AdminCard>
        ) : (
          <AdminCard title="Tracking information" className="space-y-3">
            <AdminKv label="Tracking / AWB" value={item.tracking} tone="strong" />
            <AdminKv label="Current location" value={item.currentLocation} />
            <AdminKv label="Shipment stage" badge={item.status} />
            <AdminKv label="Last updated" value={item.lastUpdatedAt} />
            <AdminKv label="Estimated arrival" value={item.estimatedArrival} />
          </AdminCard>
        )}
        <ShipmentTimeline items={item.timeline} />
      </div>

      <OrdersInShipment orders={item.orders} />

      {item.canUpdate ? (
        <AdminCard title="Update shipment">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[13px]">
              <span className="font-medium text-slate-600">Current stage</span>
              <input
                value={item.status}
                readOnly
                className="h-[34px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-700 outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px]">
              <span className="font-medium text-slate-600">New status</span>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="h-[34px] rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-maroon-400"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium text-slate-600">Tracking #</span>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder={item.tracking}
              className="h-[34px] rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-maroon-400"
            />
          </label>
          <label className="mt-3 flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium text-slate-600">Note</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an update note"
              className="h-[34px] rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-maroon-400"
            />
          </label>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 text-[13px] font-medium text-[#480516] hover:underline"
          >
            <Icon src={adminIcons.file} size={14} />
            Upload POD / customs document
          </button>
          <div className="mt-4 flex justify-end">
            <AdminButton onClick={onUpdate}>Update Status</AdminButton>
          </div>
        </AdminCard>
      ) : null}
    </AdminDetailShell>
  )
}
