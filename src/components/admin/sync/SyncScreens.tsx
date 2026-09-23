import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminIcons } from '@/assets/admin'
import {
  AdminBack,
  AdminBadge,
  AdminButton,
  AdminFieldRow,
  AdminFilter,
  AdminModal,
  AdminPagination,
  AdminRow,
  AdminSearch,
  AdminTable,
  usePaged,
} from '@/components/admin/ui'
import { AdminListShell, AdminNotFound, StatusCell, matchesQuery } from '@/components/admin/screens'
import { Icon } from '@/components/shared/Icon'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { publishSync, retrySyncItem } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminSyncItem, AdminSyncJob } from '@/types/admin'
import { cn } from '@/utils/format'

function SyncKv({
  label,
  value,
  valueClass,
}: {
  label: string
  value: ReactNode
  valueClass?: string
}) {
  return (
    <AdminFieldRow
      label={label}
      value={<span className={cn(valueClass)}>{value}</span>}
    />
  )
}

function WarnBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[34px] w-full items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 sm:items-center">
      <Icon src={adminIcons.syncWarnDot} className="mt-1.5 size-1.5 shrink-0 sm:mt-0" />
      <p className="min-w-0 text-[11.5px] leading-normal text-amber-700">{children}</p>
    </div>
  )
}

function PublishBadge({ status }: { status: string }) {
  return <AdminBadge status={status} kind={status === 'Pending' ? 'warning' : undefined} />
}

function fmt(n: number) {
  return n.toLocaleString('en-US')
}

function RetryItemModal({
  item,
  onClose,
  onConfirm,
}: {
  item: AdminSyncItem
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <AdminModal bare maxWidth={420} onClose={onClose} showClose={false}>
      <div className="flex w-full flex-col items-center gap-4 rounded-[14px] px-7 py-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-blue-50">
          <Icon src={adminIcons.syncRetry} className="size-[22px]" />
        </div>
        <h2 className="text-center text-[16px] font-semibold text-slate-900">Retry sync for this listing?</h2>
        <p className="max-w-[360px] text-center text-[12.5px] leading-normal text-slate-500">
          BidBridge will attempt to sync “{item.product}” ({item.lotId}) from {item.source} again.
        </p>
        <div className="flex gap-2.5">
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton onClick={onConfirm}>Retry sync</AdminButton>
        </div>
      </div>
    </AdminModal>
  )
}

function SyncingModal({ item }: { item: AdminSyncItem }) {
  return (
    <AdminModal bare maxWidth={420} onClose={() => undefined} showClose={false}>
      <div className="flex w-full flex-col items-center gap-4 rounded-[14px] px-7 py-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#f4f0f1]">
          <Icon src={adminIcons.syncSyncing} className="size-[22px] animate-spin" />
        </div>
        <h2 className="text-center text-[16px] font-semibold text-slate-900">Syncing…</h2>
        <p className="max-w-[360px] text-center text-[12.5px] leading-normal text-slate-500">
          Retrying sync for “{item.product}” ({item.lotId}). This may take a moment.
        </p>
      </div>
    </AdminModal>
  )
}

function PublishModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <AdminModal bare maxWidth={440} onClose={onClose} showClose={false}>
      <div className="flex w-full flex-col items-center gap-4 rounded-[14px] px-7 py-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#f4f0f1]">
          <Icon src={adminIcons.syncPublish} className="size-[22px]" />
        </div>
        <h2 className="text-center text-[16px] font-semibold text-slate-900">Publish this Sync?</h2>
        <p className="max-w-[360px] text-center text-[12.5px] leading-normal text-slate-500">
          All synced lot will become visible to buyers immediately and can receive bids.
        </p>
        <div className="flex w-full gap-2.5">
          <AdminButton variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton className="flex-1" onClick={onConfirm}>
            Publish Sync
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  )
}

function SyncItemsTable({
  items,
  syncId,
  onRetry,
}: {
  items: AdminSyncItem[]
  syncId: string
  onRetry: (item: AdminSyncItem) => void
}) {
  const navigate = useNavigate()
  const paging = usePaged(items, 8)
  const grid = '1.45fr 0.7fr 0.7fr 1fr 1fr 1.15fr 1.05fr'

  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white">
      <div className="flex flex-col gap-2.5 bg-slate-50 p-3 xl:hidden">
        {paging.slice.map((item) => (
          <div
            key={item.id}
            className="flex min-h-[72px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-[14px] font-semibold leading-snug text-slate-900">{item.product}</p>
                <StatusCell status={item.syncStatus} />
              </div>
              <p className="mt-1.5 truncate text-[12.5px] text-slate-500">
                {item.lotId} · {item.source}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] font-medium text-[#531424]">
                <button type="button" className="min-h-9" onClick={() => navigate(`/admin/lots/${item.lotId}`)}>
                  View lot
                </button>
                {item.syncStatus === 'Failed' ? (
                  <button type="button" className="min-h-9" onClick={() => onRetry(item)}>
                    Retry sync
                  </button>
                ) : (
                  <button type="button" className="min-h-9" onClick={() => navigate(`/admin/lots/${item.lotId}`)}>
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden xl:block">
        <AdminTable
          embedded
          pad="lg"
          headerHeight="sm"
          grid={grid}
          headers={['Lot', 'Lot ID', 'Source', 'Error', 'Sync status', 'Last attempt', 'Action']}
        >
          {paging.slice.map((item) => (
            <AdminRow
              key={item.id}
              tall
              pad="lg"
              className="h-[52px]"
              grid={grid}
              columns={[
                <span key="p" className="line-clamp-2 text-[12px] text-slate-800">
                  {item.product}
                </span>,
                item.lotId,
                item.source,
                item.error,
                <StatusCell key="st" status={item.syncStatus} />,
                item.lastAttempt,
                <span key="acts" className="flex items-center gap-3 text-[11px] font-medium text-[#531424]">
                  <button type="button" className="hover:underline" onClick={() => navigate(`/admin/lots/${item.lotId}`)}>
                    View lot
                  </button>
                  {item.syncStatus === 'Failed' ? (
                    <button type="button" className="hover:underline" onClick={() => onRetry(item)}>
                      Retry sync
                    </button>
                  ) : (
                    <button type="button" className="hover:underline" onClick={() => navigate(`/admin/lots/${item.lotId}`)}>
                      Edit
                    </button>
                  )}
                </span>,
              ]}
            />
          ))}
        </AdminTable>
      </div>
      <AdminPagination
        page={paging.page}
        pages={paging.pages}
        total={paging.total}
        onPage={paging.setPage}
        noun="items"
      />
      <span className="sr-only">{syncId}</span>
    </div>
  )
}

export function SyncDashboard() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.syncs)
  const health = useAppSelector((s) => s.admin.syncHealth)
  const source = useAppSelector((s) => s.admin.syncSource)
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('All sources')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [date, setDate] = useState('Last 7 days')
  const [sort, setSort] = useState('Newest first')

  const filtered = useMemo(() => {
    let list = rows.filter(
      (r) =>
        matchesQuery(`${r.id} ${r.source} ${r.syncType}`, query) &&
        (sourceFilter === 'All sources' || r.source === sourceFilter) &&
        (statusFilter === 'All statuses' || r.status === statusFilter),
    )
    if (sort === 'Oldest first') list = [...list].reverse()
    return list
  }, [rows, query, sourceFilter, statusFilter, sort])

  const paging = usePaged(filtered, 5)
  const grid = '1.15fr 0.75fr 0.95fr 0.7fr 0.7fr 0.55fr 0.9fr 0.8fr 52px'

  return (
    <AdminListShell
      title="Sync / Sources"
      subtitle="Monitor B-Stock catalog synchronization and source health."
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-[15.5px] font-semibold text-slate-900">Sync health</p>
          <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total listings synced', value: fmt(health.totalListingsSynced) },
              { label: 'Successful syncs', value: fmt(health.successfulSyncs), className: 'text-emerald-700' },
              { label: 'Failed syncs', value: fmt(health.failedSyncs), className: 'text-red-600' },
              { label: 'Last successful sync', value: health.lastSuccessfulSyncTime },
            ].map((tile) => (
              <div key={tile.label} className="flex h-[82px] flex-col justify-between rounded-[10px] bg-slate-50 px-3.5 py-3">
                <p className="text-[10.5px] text-slate-500">{tile.label}</p>
                <p className={cn('text-[19px] font-semibold text-slate-900', tile.className)}>{tile.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3.5">
            <WarnBanner>{health.warningMessage}</WarnBanner>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[16.67px] bg-[#f4f0f1] text-[16.8px] font-semibold text-[#531424]">
              B
            </div>
            <div className="min-w-0">
              <p className="text-[15.5px] font-semibold text-slate-900">{source.name}</p>
              <p className="text-[11.5px] text-slate-500">{source.description}</p>
            </div>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2">
            {source.connected ? <AdminBadge status="Connected" /> : <AdminBadge status="Disconnected" kind="danger" />}
            {source.syncWarning ? <AdminBadge status="Sync warning" /> : null}
          </div>
          <div className="my-[14px] h-px bg-slate-100" />
          <div className="flex flex-col gap-[14px]">
            <SyncKv label="Last successful sync" value={source.lastSuccessfulSync} />
            <SyncKv label="Last sync attempt" value={source.lastSyncAttempt} />
            <SyncKv label="Synced listings" value={fmt(source.syncedListings)} valueClass="text-emerald-700" />
            <SyncKv label="Failed listings" value={fmt(source.failedListings)} valueClass="text-red-600" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[15px] font-semibold text-slate-900">Sync activity</p>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-2.5 [&>label]:w-full xl:[&>label]:w-auto">
          <AdminSearch
            className="h-9 w-full shrink-0 xl:w-[479px]"
            value={query}
            onChange={setQuery}
            placeholder="Search Lot ID or product"
          />
          <div className="flex min-w-0 flex-1 flex-wrap gap-3.5 xl:flex-nowrap [&>label]:min-w-0 [&>label]:flex-1">
            <AdminFilter
              label="Source"
              value={sourceFilter}
              onChange={setSourceFilter}
              options={['All sources', 'B-Stock']}
            />
            <AdminFilter
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={['All statuses', 'Healthy', 'Warning']}
            />
            <AdminFilter
              label="Date"
              value={date}
              onChange={setDate}
              options={['Last 7 days', 'Last 30 days', 'All time']}
            />
            <AdminFilter
              value={`Sort: ${sort}`}
              onChange={(v) => setSort(v.replace(/^Sort:\s*/, ''))}
              options={['Sort: Newest first', 'Sort: Oldest first']}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100 xl:hidden">
            {paging.slice.map((r) => (
              <button
                key={r.id}
                type="button"
                className="block w-full space-y-2 px-4 py-3.5 text-left hover:bg-slate-50"
                onClick={() => navigate(`/admin/sync/${r.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800">{r.at}</p>
                    <p className="text-[12px] text-slate-500">
                      {r.source} · {r.syncType}
                    </p>
                  </div>
                  <StatusCell status={r.status} />
                </div>
                <p className="text-[12px] font-medium text-[#531424]">View</p>
              </button>
            ))}
          </div>
          <div className="hidden xl:block">
            <AdminTable
              embedded
              pad="lg"
              headerHeight="sm"
              grid={grid}
              headers={[
                'Date/time',
                'Source',
                'Sync type',
                'Processed',
                'Successful',
                'Failed',
                'Publish status',
                'Status',
                'Action',
              ]}
            >
              {paging.slice.map((r) => (
                <AdminRow
                  key={r.id}
                  tall
                  pad="lg"
                  grid={grid}
                  onClick={() => navigate(`/admin/sync/${r.id}`)}
                  columns={[
                    r.at,
                    r.source,
                    r.syncType,
                    fmt(r.processed),
                    fmt(r.successful),
                    fmt(r.failed),
                    <PublishBadge key="pub" status={r.publishStatus} />,
                    <StatusCell key="st" status={r.status} />,
                    <span key="act" className="text-[12px] font-medium text-[#531424]">
                      View
                    </span>,
                  ]}
                />
              ))}
            </AdminTable>
          </div>
        </div>
        <AdminPagination
          bare
          large
          page={paging.page}
          pages={paging.pages}
          total={24}
          onPage={paging.setPage}
          prevLabel="Previous"
          nextLabel="Next"
          summary={`Showing ${paging.slice.length} of 24 sync runs`}
        />
      </div>
    </AdminListShell>
  )
}

export function SyncDetail({ item }: { item: AdminSyncJob }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [publishOpen, setPublishOpen] = useState(false)
  const [retryItem, setRetryItem] = useState<AdminSyncItem | null>(null)
  const [syncingItem, setSyncingItem] = useState<AdminSyncItem | null>(null)

  useEffect(() => {
    if (!syncingItem) return
    const t = window.setTimeout(() => {
      dispatch(retrySyncItem({ syncId: item.id, itemId: syncingItem.id }))
      dispatch(showToast('Listing sync retried'))
      setSyncingItem(null)
    }, 1200)
    return () => window.clearTimeout(t)
  }, [syncingItem, dispatch, item.id])

  return (
    <div className="flex w-full max-w-full flex-col gap-4 animate-fade-in sm:gap-5">
      <AdminBack label="Back to Sync activity" onClick={() => navigate('/admin/sync')} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold leading-normal text-slate-900">Sync detail — {item.id}</h1>
          <p className="mt-1 text-[13.5px] text-slate-500">{item.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <AdminBadge status={item.status} />
          {item.publishStatus === 'Pending' ? (
            <AdminButton onClick={() => setPublishOpen(true)}>Publish</AdminButton>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-3">
          <SyncKv label="Source" value={item.source} />
          <SyncKv label="Sync ID" value={item.id} />
          <SyncKv label="Start time" value={item.started} />
          <SyncKv label="End time" value={item.finished} />
          <SyncKv label="Duration" value={item.duration} />
          <SyncKv label="Listings processed" value={fmt(item.processed)} />
          <SyncKv label="Successful listings" value={fmt(item.successful)} valueClass="text-emerald-700" />
          <SyncKv label="Failed listings" value={fmt(item.failed)} valueClass="text-red-600" />
        </div>
        {item.failed > 0 ? (
          <>
            <div className="my-3 h-px bg-slate-100" />
            <WarnBanner>
              {item.failed} listings failed to sync in this run. See failed items below.
            </WarnBanner>
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-[10px]">
        <p className="text-[15px] font-semibold text-slate-900">Items in this sync</p>
        <SyncItemsTable
          items={item.items}
          syncId={item.id}
          onRetry={(row) => setRetryItem(row)}
        />
      </div>

      {publishOpen ? (
        <PublishModal
          onClose={() => setPublishOpen(false)}
          onConfirm={() => {
            dispatch(publishSync({ id: item.id }))
            dispatch(showToast('Sync published'))
            setPublishOpen(false)
          }}
        />
      ) : null}
      {retryItem ? (
        <RetryItemModal
          item={retryItem}
          onClose={() => setRetryItem(null)}
          onConfirm={() => {
            setSyncingItem(retryItem)
            setRetryItem(null)
          }}
        />
      ) : null}
      {syncingItem ? <SyncingModal item={syncingItem} /> : null}
    </div>
  )
}

export function SyncDetailGate({ id }: { id?: string }) {
  const item = useAppSelector((s) => s.admin.syncs.find((r) => r.id === id))
  if (!item) return <AdminNotFound label="Back to Sync activity" to="/admin/sync" />
  return <SyncDetail item={item} />
}
