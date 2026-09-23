import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKv,
  AdminModal,
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
import { updateOrder } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminOrder, AdminOrderTimelineEvent } from '@/types/admin'

const ORDER_STAGES = ['Won', 'Paid', 'Lot Secured', 'US 3PL', 'Ship', 'Customs', 'Delivered'] as const

const LOGISTICS_OPTIONS = [
  'Awaiting 3PL verification',
  'In transit (Aquantuo air)',
  'Customs clearance',
  'Out for delivery',
  'Delivered',
]

function StageTracker({ currentIndex }: { currentIndex: number }) {
  return <AdminStageTracker stages={ORDER_STAGES} currentIndex={currentIndex} />
}

function OrderTimeline({ items }: { items: AdminOrderTimelineEvent[] }) {
  return (
    <AdminCard title="Order timeline" className="h-fit">
      <p className="mb-3 text-[12px] text-slate-500">Visible to the buyer on their tracking page.</p>
      <ol className="space-y-0">
        {items.map((ev, i) => {
          const done = ev.state === 'done'
          const current = ev.state === 'current'
          return (
            <li key={ev.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'mt-0.5 size-2.5 shrink-0 rounded-full',
                    done && 'bg-emerald-500',
                    current &&
                      (ev.at === 'Pending' || ev.at === 'In progress' || ev.at === 'Failed'
                        ? 'bg-slate-300'
                        : 'bg-sky-500'),
                    ev.state === 'pending' && 'bg-slate-300',
                  )}
                />
                {i < items.length - 1 ? <span className="w-px flex-1 bg-slate-200" /> : null}
              </div>
              <div className={cn('pb-4', i === items.length - 1 && 'pb-0')}>
                <p
                  className={cn(
                    'text-[13px] font-medium',
                    done || current ? 'text-slate-800' : 'text-slate-400',
                  )}
                >
                  {ev.label}
                </p>
                <p
                  className={cn(
                    'mt-0.5 text-[12px]',
                    ev.at === 'Pending' || ev.at === 'In progress'
                      ? 'text-amber-600'
                      : ev.at === 'Failed'
                        ? 'text-red-600'
                        : 'text-slate-400',
                  )}
                >
                  {ev.at}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </AdminCard>
  )
}

function DocumentsPanel({ docs }: { docs: AdminOrder['documents'] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <p className="text-[13.5px] font-semibold text-slate-800">Documents</p>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#480516] hover:underline"
        >
          <Icon src={adminIcons.exportCsv} size={14} />
          Upload attachment
        </button>
      </div>
      <div className="divide-y divide-slate-100 px-5 pb-2 pt-2">
        {docs.map((doc) => (
          <div key={doc.id} className="flex items-center gap-3 py-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <Icon src={adminIcons.file} size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-slate-800">{doc.name}</p>
              <p className="text-[11.5px] text-slate-500">
                Uploaded by {doc.uploadedBy} · {doc.uploadedAt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PhotoPlaceholders({ photos }: { photos: { id: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {photos.map((p) => (
        <div
          key={p.id}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50"
        >
          <Icon src={adminIcons.filePreview} size={22} />
          <span className="px-1 text-center text-[11px] text-slate-500">{p.label}</span>
        </div>
      ))}
    </div>
  )
}

function FieldInput({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium leading-[normal] text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className="h-[34px] w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] leading-[normal] text-slate-700 outline-none read-only:bg-slate-50"
      />
    </label>
  )
}

function Banner({
  tone,
  icon,
  children,
}: {
  tone: 'success' | 'danger' | 'info'
  icon?: boolean
  children: ReactNode
}) {
  const styles = {
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    danger: 'border-red-100 bg-red-50 text-red-700',
    info: 'border-blue-100 bg-blue-50 text-blue-700',
  }[tone]
  return (
    <p className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] leading-5 ${styles}`}>
      {icon ? <Icon src={adminIcons.check} size={16} className="mt-0.5 shrink-0" /> : null}
      <span>{children}</span>
    </p>
  )
}

function advanceTimeline(items: AdminOrderTimelineEvent[], toLabel: string): AdminOrderTimelineEvent[] {
  const idx = items.findIndex((t) => t.label === toLabel || t.label.startsWith(toLabel))
  if (idx < 0) return items
  return items.map((t, i) => {
    if (i < idx) return { ...t, state: 'done' as const, at: t.at === 'Pending' || t.at === '—' ? t.at : t.at }
    if (i === idx) return { ...t, state: 'current' as const }
    return { ...t, state: 'pending' as const }
  })
}

export function OrdersList() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.orders)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [stage, setStage] = useState('All')
  const [sort, setSort] = useState('Last updated')
  const filtered = useMemo(() => {
    const list = rows.filter((r) => {
      if (!matchesQuery(`${r.id} ${r.buyer} ${r.lot}`, query)) return false
      if (status !== 'All' && r.payment !== status && r.stage !== status) return false
      if (stage !== 'All' && r.stage !== stage) return false
      return true
    })
    if (sort === 'Oldest first') return [...list].reverse()
    return list
  }, [rows, query, status, stage, sort])

  return (
    <AdminListShell
      title="Orders"
      subtitle="Move an order through procurement to delivery."
      toolbar={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 [&>label]:w-full sm:[&>label]:w-auto">
            <AdminSearch
              className="w-full sm:w-[280px] sm:flex-none"
              value={query}
              onChange={setQuery}
              placeholder="Search by Order ID, buyer, or lot"
            />
            <AdminFilter
              label="Status"
              value={status}
              onChange={setStatus}
              options={['All', 'Paid', 'Delivered']}
            />
            <AdminFilter
              label="Stage"
              value={stage}
              onChange={setStage}
              options={['All', 'US 3PL', 'Ship', 'Customs', 'Delivered']}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 [&>label]:w-full sm:[&>label]:w-auto">
            <AdminFilter label="Date" value="All time" onChange={() => undefined} options={['All time']} />
            <AdminFilter
              label="Sort"
              value={sort}
              onChange={setSort}
              options={['Last updated', 'Oldest first']}
            />
          </div>
        </div>
      }
    >
      <AdminTablePanel>
        <AdminDataTable
          embedded
          pageSize={8}
          noun="orders"
          rows={filtered}
          grid="0.85fr 1.1fr 1.35fr 0.7fr 0.8fr 0.65fr 1.35fr 0.7fr 0.7fr 48px"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/orders/${r.id}`)}
          columns={[
            {
              header: 'Order ID',
              mobile: 'title',
              render: (r) => <span className="font-medium text-[#480516]">{r.id}</span>,
            },
            { header: 'Buyer', mobile: 'meta', render: (r) => <span className="text-[13px] text-slate-800">{r.buyer}</span> },
            { header: 'Lot / Product', mobile: 'meta', render: (r) => <span className="text-[12.5px] text-slate-700">{r.lot}</span> },
            {
              header: 'Amount',
              mobile: 'value',
              render: (r) => <span className="font-medium text-slate-900">{r.total}</span>,
            },
            { header: 'Stage', mobile: 'status', render: (r) => <StatusCell status={r.stage} /> },
            { header: 'Payment', mobile: 'hide', render: (r) => <StatusCell status={r.payment} /> },
            {
              header: 'Logistics status',
              mobile: 'hide',
              render: (r) => (
                <span className={cn('text-[12.5px]', r.logisticsFailed ? 'font-medium text-red-600' : 'text-slate-700')}>
                  {r.logistics}
                </span>
              ),
            },
            {
              header: 'Created',
              mobile: 'hide',
              render: (r) => <span className="text-[12.5px] text-slate-500">{r.created}</span>,
            },
            {
              header: 'Updated',
              mobile: 'hide',
              render: (r) => <span className="text-[12.5px] text-slate-500">{r.updated}</span>,
            },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.orders.find((r) => r.id === id))
  const [modal, setModal] = useState<'verify' | null>(null)
  const [imei, setImei] = useState(item?.imei ?? '')
  const [newStatus, setNewStatus] = useState(
    item?.id === 'ORD-655' ? 'Customs clearance' : 'Customs clearance',
  )
  const [tracking, setTracking] = useState(item?.id === 'ORD-655' ? 'AWB-883921' : item?.tracking ?? '')
  const [note, setNote] = useState(item?.id === 'ORD-655' ? 'Cleared Lagos customs' : '')

  if (!item) return <AdminNotFound label="Back to orders" to="/admin/orders" />

  const atTpl = item.stage === 'US 3PL'
  const atLogistics = item.stage === 'Ship' || item.stage === 'Customs'
  const delivered = item.stage === 'Delivered'
  const tplFailed = item.logisticsFailed || item.tplStatus === 'Verification failed'
  const tplPending = atTpl && !tplFailed && item.tplStatus !== 'Verified'

  const markVerified = () => {
    dispatch(
      updateOrder({
        id: item.id,
        patch: {
          stage: 'Ship',
          status: 'Ship',
          stageIndex: 4,
          tplStatus: 'Verified',
          phonecheck: 'Passed',
          logistics: 'In transit (Aquantuo air)',
          logisticsFailed: false,
          logisticsStage: 'In transit (Aquantuo air)',
          canAdvanceLogistics: true,
          imei: imei || item.imei,
        },
        timeline: advanceTimeline(
          item.timeline.map((t) =>
            t.label === 'US 3PL Verified' ? { ...t, at: 'Just now', state: 'done' as const } : t,
          ),
          'Shipped',
        ),
        historyTitle: 'Verified at US 3PL',
      }),
    )
    dispatch(showToast('Verified at US 3PL'))
    setModal(null)
  }

  const updateLogistics = () => {
    const nextStage = newStatus === 'Delivered' ? 'Delivered' : newStatus === 'Customs clearance' ? 'Customs' : 'Ship'
    const nextIndex = nextStage === 'Delivered' ? 6 : nextStage === 'Customs' ? 5 : 4
    dispatch(
      updateOrder({
        id: item.id,
        patch: {
          stage: nextStage,
          status: nextStage,
          stageIndex: nextIndex,
          logistics: newStatus,
          logisticsStage: newStatus,
          logisticsUpdatedAt: 'Just now',
          logisticsUpdatedBy: 'Ops Admin',
          tracking: tracking.trim() || item.tracking,
          canAdvanceLogistics: nextStage !== 'Delivered',
          ...(nextStage === 'Delivered'
            ? {
                deliveredBanner: 'Order marked delivered & complete just now by Ops Admin.',
                buyerConfirmed: 'Yes',
                confirmedBy: 'Ops Admin',
                confirmedAt: 'Just now',
                deliveryNote: note.trim() || item.deliveryNote,
                hasPod: true,
              }
            : {}),
        },
        timeline: advanceTimeline(
          item.timeline,
          nextStage === 'Delivered' ? 'Delivered' : nextStage === 'Customs' ? 'Customs' : 'Shipped',
        ),
        historyTitle: `Logistics updated → ${newStatus}`,
      }),
    )
    dispatch(showToast('Logistics status updated'))
    setNote('')
  }

  return (
    <AdminDetailShell
      backLabel="Back to Orders"
      onBack={() => navigate('/admin/orders')}
      title={item.id}
      badges={[item.payment, item.stage]}
      subtitle={`${item.buyer} · ${item.lot} · ${item.total}`}
      actions={
        tplFailed ? (
          <AdminButton
            variant="dangerOutline"
            onClick={() => {
              dispatch(showToast('Escalated to support'))
              navigate('/admin/support')
            }}
          >
            Escalate to Support
          </AdminButton>
        ) : undefined
      }
    >
      <p className="-mt-2 text-[12.5px] text-slate-500">
        Created {item.createdFull} · Last updated {item.updatedFull}
      </p>

      {tplFailed ? (
        <Banner tone="danger">US 3PL verification failed. Review intake photos and escalate if needed.</Banner>
      ) : null}

      <StageTracker currentIndex={item.stageIndex} />

      {delivered && item.deliveredBanner ? (
        <Banner tone="success" icon>
          {item.deliveredBanner}
        </Banner>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px] lg:gap-4">
        <div className="flex flex-col gap-4">
          {delivered ? (
            <AdminCard title="Delivery confirmation" className="space-y-3">
              <AdminKv label="Buyer confirmed receipt" badge={item.buyerConfirmed ?? 'Yes'} />
              <AdminKv label="Confirmed by" value={item.confirmedBy ?? '—'} />
              <AdminKv label="Confirmation date/time" value={item.confirmedAt ?? '—'} />
              <AdminKv label="Delivery note" value={item.deliveryNote ?? '—'} />
              {item.hasPod ? (
                <div className="flex items-start justify-between gap-3 text-[13px]">
                  <span className="text-slate-500">Proof of delivery</span>
                  <div className="flex size-16 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                    <Icon src={adminIcons.filePreview} size={28} />
                  </div>
                </div>
              ) : null}
            </AdminCard>
          ) : null}

          <AdminCard title="Procurement information" className="space-y-3">
            <AdminKv label="B-Stock lot" value={item.lotId} tone="strong" />
            <AdminKv label="Placement status" badge={item.placementStatus} />
            <AdminKv label="Lot secured status" badge={item.lotSecuredStatus} />
            {item.placementOutcome && !delivered ? (
              <AdminKv label="Placement outcome" value={item.placementOutcome} />
            ) : null}
          </AdminCard>

          {atTpl ? (
            <AdminCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13.5px] font-semibold text-slate-800">US 3PL verification</p>
                <AdminBadge status={item.tplStatus ?? 'Pending Verification'} />
              </div>
              <div>
                <p className="mb-2 text-[12px] text-slate-500">Aquantuo intake photos</p>
                {item.photos ? <PhotoPlaceholders photos={item.photos} /> : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldInput
                  label="IMEI"
                  value={imei || item.imei || ''}
                  onChange={setImei}
                  readOnly={!tplPending}
                />
                <FieldInput label="Phonecheck" value={item.phonecheck ?? 'Not yet run'} readOnly />
              </div>
              {tplPending ? (
                <div className="flex flex-wrap gap-2">
                  <AdminButton
                    variant="outline"
                    onClick={() => {
                      dispatch(
                        updateOrder({
                          id: item.id,
                          patch: { phonecheck: 'Passed' },
                          historyTitle: 'Phonecheck completed',
                        }),
                      )
                      dispatch(showToast('Phonecheck completed'))
                    }}
                  >
                    Run Phonecheck
                  </AdminButton>
                  <AdminButton onClick={() => setModal('verify')}>Mark Verified</AdminButton>
                </div>
              ) : null}
            </AdminCard>
          ) : null}

          {atLogistics ? (
            <>
              <AdminCard title="Logistics status" className="space-y-3">
                <AdminKv label="Current logistics stage" value={item.logisticsStage ?? item.logistics} />
                <AdminKv label="Last updated" value={item.logisticsUpdatedAt ?? '—'} />
                <AdminKv label="Updated by" value={item.logisticsUpdatedBy ?? '—'} />
                <AdminKv label="Tracking #" value={item.tracking ?? '—'} tone="strong" />
              </AdminCard>

              {item.canAdvanceLogistics ? (
                <AdminCard title="Advance logistics status" className="space-y-3">
                  <label className="flex flex-col gap-1.5 text-[13px]">
                    <span className="font-medium text-slate-600">Current stage</span>
                    <select
                      value={item.logisticsStage ?? item.logistics}
                      disabled
                      className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-800 outline-none"
                    >
                      {LOGISTICS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-[13px]">
                    <span className="font-medium text-slate-600">New status</span>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-maroon-400"
                    >
                      {LOGISTICS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-[13px]">
                    <span className="font-medium text-slate-600">Tracking #</span>
                    <input
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      placeholder={item.tracking ?? 'AWB-…'}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-maroon-400"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-[13px]">
                    <span className="font-medium text-slate-600">Note</span>
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Cleared Lagos customs"
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-maroon-400"
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#480516] hover:underline"
                  >
                    <Icon src={adminIcons.exportCsv} size={14} />
                    Upload POD / customs document
                  </button>
                  <div className="flex justify-end pt-1">
                    <AdminButton onClick={updateLogistics}>Update Status</AdminButton>
                  </div>
                </AdminCard>
              ) : null}
            </>
          ) : null}

          <DocumentsPanel docs={item.documents} />
        </div>

        <OrderTimeline items={item.timeline} />
      </div>

      {modal === 'verify' ? (
        <AdminModal
          title="Mark Verified at US 3PL"
          subtitle="Confirms the device passed Phonecheck and matches the listing. The order will continue to shipping."
          maxWidth={440}
          onClose={() => setModal(null)}
          icon={<Icon src={adminIcons.check} size={18} />}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton onClick={markVerified}>Mark Verified at US 3PL</AdminButton>
            </>
          }
        >
          <div className="space-y-2.5 rounded-xl bg-slate-50 px-4 py-3 text-[13px]">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Order ID</span>
              <span className="font-medium text-slate-800">{item.id}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">IMEI</span>
              <span className="font-medium text-slate-800">{imei || item.imei || '—'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Phonecheck Result</span>
              <span className="font-medium text-slate-800">
                {item.phonecheck === 'Passed' ? 'Passed' : 'Pending'}
              </span>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </AdminDetailShell>
  )
}
