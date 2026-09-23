import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminBack,
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
  AdminListShell,
  AdminNotFound,
  AdminTablePanel,
  FieldInput,
  StatusCell,
  matchesQuery,
} from '@/components/admin/screens'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { saveLotEdits } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminLot } from '@/types/admin'
import { cn } from '@/utils/format'

const CATEGORIES = ['All', 'Phones', 'Laptops', 'TVs', 'Consoles', 'Electronics'] as const
const TIERS = ['All', 'T1', 'T2', 'T3'] as const
const LISTING_STATUSES = ['All', 'Active', 'Unpublished'] as const
const SYNC_STATUSES = ['All', 'Synced', 'Sync error'] as const
const LANDING_POSITIONS = ['Recommended', 'Featured', 'Hidden'] as const
const CONDITIONS = [
  'Customer Returns · Used – Good',
  'Customer Returns · Used – Fair',
  'New',
  'Mixed',
] as const
const INVENTORY_TYPES = ['Unspecified', 'Manifested', 'Blind'] as const
const PREMIUMS = ['Included', 'Extra'] as const

function MediaPlaceholder() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-300">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
      <path d="M4 16l4.5-4.5L12 15l3-3 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MediaThumbs({ count, editing }: { count: number; editing?: boolean }) {
  const n = Math.max(1, Math.min(count, 6))
  return (
    <div className="flex flex-wrap gap-2.5">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={cn('relative w-[min(100%,10rem)] sm:w-40', editing && 'sm:w-[150px]')}>
          <div
            className={cn(
              'flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 sm:aspect-auto',
              editing ? 'sm:h-28' : 'sm:h-[120px]',
            )}
          >
            <MediaPlaceholder />
            {editing ? (
              <button
                type="button"
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm sm:size-5"
                aria-label="Remove image"
              >
                ×
              </button>
            ) : null}
          </div>
          {editing ? (
            <button type="button" className="mt-1 text-[12px] font-medium text-slate-500 hover:text-slate-800">
              Replace
            </button>
          ) : null}
        </div>
      ))}
      {editing ? (
        <button
          type="button"
          className="flex h-28 w-full max-w-[150px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white text-[12px] font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700"
        >
          <span className="text-lg leading-none">+</span>
          Add image
        </button>
      ) : null}
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
  hint,
  className,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
  hint?: string
  className?: string
}) {
  return (
    <label className={cn('flex flex-col gap-1.5 text-[13px]', className)}>
      <span className="font-medium text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13.5px] text-slate-800 outline-none focus:border-[#a7878f]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {hint ? <span className="text-[12px] text-slate-400">{hint}</span> : null}
    </label>
  )
}

function CardHead({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <p className="shrink-0 text-[13.5px] font-semibold text-slate-800">{title}</p>
      <span className="h-px flex-1 bg-slate-100" />
    </div>
  )
}

export function LotsList() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.lots)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [tier, setTier] = useState('All')
  const [listingStatus, setListingStatus] = useState('All')
  const [syncStatus, setSyncStatus] = useState('All')

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          matchesQuery(`${r.title} ${r.id} ${r.bStockSource} ${r.category}`, query) &&
          (category === 'All' || r.category === category) &&
          (tier === 'All' || r.tier === tier) &&
          (listingStatus === 'All' || r.listingStatus === listingStatus) &&
          (syncStatus === 'All' || r.syncStatus === syncStatus),
      ),
    [rows, query, category, tier, listingStatus, syncStatus],
  )

  return (
    <AdminListShell title="Lots" subtitle="Synced B-Stock listings and their tier band.">
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch
              className="w-full sm:w-[270px]"
              value={query}
              onChange={setQuery}
              placeholder="Search by product name or Lot ID"
            />
            <AdminFilter label="Category" value={category} onChange={setCategory} options={[...CATEGORIES]} />
            <AdminFilter label="Tier" value={tier} onChange={setTier} options={[...TIERS]} />
            <AdminFilter
              label="Listing status"
              value={listingStatus}
              onChange={setListingStatus}
              options={[...LISTING_STATUSES]}
            />
          </>
        }
        secondaryToolbar={
          <>
            <AdminFilter label="Sync status" value={syncStatus} onChange={setSyncStatus} options={[...SYNC_STATUSES]} />
            <AdminFilter label="Last synced" value="All time" onChange={() => undefined} options={['All time']} />
            <AdminFilter
              value="Sort: Recently synced"
              onChange={() => undefined}
              options={['Sort: Recently synced']}
            />
          </>
        }
      >
        <AdminDataTable
          embedded
          tall
          rows={filtered}
          pageSize={8}
          noun="listings"
          grid="1.6fr 0.7fr 1fr 0.75fr 0.65fr 0.45fr 0.9fr 0.95fr 0.75fr 52px"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/lots/${r.id}`)}
          columns={[
            { header: 'Lot', render: (r) => <span className="line-clamp-2 font-medium text-slate-800">{r.title}</span> },
            { header: 'Lot ID', render: (r) => <span className="font-medium text-[#480516]">{r.id}</span> },
            { header: 'B-Stock source', render: (r) => r.bStockSource },
            { header: 'Category', render: (r) => r.category },
            { header: 'Price', render: (r) => r.price },
            { header: 'Tier', render: (r) => r.tier },
            { header: 'Sync status', render: (r) => <StatusCell status={r.syncStatus} /> },
            { header: 'Listing status', render: (r) => <StatusCell status={r.listingStatus} /> },
            {
              header: 'Last synced',
              render: (r) => (
                <span className={r.syncStatus === 'Sync error' ? 'text-red-600' : 'text-slate-600'}>{r.lastSynced}</span>
              ),
            },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

type LotDraft = Omit<AdminLot, 'id' | 'mediaCount'> & { mediaCount: number }

function toDraft(item: AdminLot): LotDraft {
  const { id: _id, ...rest } = item
  return { ...rest }
}

function LotKvGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-x-10 gap-y-2.5 sm:grid-cols-2">{children}</div>
}

export function LotDetail({ item }: { item: AdminLot }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<LotDraft>(() => toDraft(item))
  const [discardOpen, setDiscardOpen] = useState(false)
  const [discardAction, setDiscardAction] = useState<'leave' | 'cancel'>('leave')

  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(toDraft(item))

  const patch = <K extends keyof LotDraft>(key: K, value: LotDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const leave = () => {
    if (dirty) {
      setDiscardAction('leave')
      setDiscardOpen(true)
    } else navigate('/admin/lots')
  }

  const save = () => {
    dispatch(saveLotEdits({ id: item.id, ...draft }))
    dispatch(showToast('Lot saved'))
    setEditing(false)
  }

  const cancelEdit = () => {
    if (dirty) {
      setDiscardAction('cancel')
      setDiscardOpen(true)
    } else {
      setDraft(toDraft(item))
      setEditing(false)
    }
  }

  const confirmDiscard = () => {
    setDiscardOpen(false)
    setDraft(toDraft(item))
    setEditing(false)
    if (discardAction === 'leave') navigate('/admin/lots')
  }

  const live = editing ? { ...item, ...draft } : item

  return (
    <div className="flex w-full max-w-full flex-col gap-4 animate-fade-in sm:gap-5">
      <AdminBack label="Back to Products & lots" onClick={leave} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-slate-900">{live.title}</h1>
            <AdminBadge status={live.syncStatus} />
          </div>
          <p className="mt-1 text-[13.5px] text-slate-500">
            Lot {live.id} · {live.category} · Synced from {live.source}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <AdminButton variant="outline" onClick={cancelEdit}>
                Cancel
              </AdminButton>
              <AdminButton onClick={save}>Save changes</AdminButton>
            </>
          ) : (
            <AdminButton
              onClick={() => {
                setDraft(toDraft(item))
                setEditing(true)
              }}
            >
              Edit Lot
            </AdminButton>
          )}
        </div>
      </div>

      {editing ? (
        <>
          <AdminCard>
            <CardHead title="Landing page position" />
            <SelectField
              label="Position"
              value={draft.landingPosition}
              options={LANDING_POSITIONS}
              onChange={(v) => patch('landingPosition', v)}
              className="max-w-[330px]"
            />
          </AdminCard>

          <AdminCard>
            <CardHead title="Lot overview" />
            <div className="grid gap-2.5 sm:gap-3 md:grid-cols-3">
              <FieldInput label="Lot title" value={draft.title} onChange={(v) => patch('title', v)} />
              <SelectField
                label="Category"
                value={draft.category}
                options={CATEGORIES.filter((c) => c !== 'All')}
                onChange={(v) => patch('category', v)}
              />
              <FieldInput label="Subcategory" value={draft.subcategory} onChange={(v) => patch('subcategory', v)} />
              <SelectField
                label="Auction"
                value={draft.auctionSource.split(' · ')[0] || 'Spot Auction'}
                options={['Spot Auction', 'Timed Auction']}
                onChange={(v) => patch('auctionSource', `${v} · ${draft.source}`)}
              />
              <FieldInput label="Source" value={draft.source} onChange={(v) => patch('source', v)} />
              <label className="flex flex-col gap-1.5 text-[13px]">
                <span className="font-medium text-slate-600">Lot ID</span>
                <input
                  value={item.id}
                  disabled
                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13.5px] text-slate-500"
                />
                <span className="text-[12px] text-slate-400">System-assigned</span>
              </label>
            </div>
          </AdminCard>

          <AdminCard>
            <CardHead title="Lot information" />
            <label className="mb-4 flex flex-col gap-1.5 text-[13px]">
              <span className="font-medium text-slate-600">Description</span>
              <textarea
                value={draft.description}
                onChange={(e) => patch('description', e.target.value)}
                className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13.5px] outline-none focus:border-[#a7878f]"
              />
            </label>
            <div className="grid gap-2.5 sm:gap-3 md:grid-cols-3">
              <SelectField
                label="Condition"
                value={draft.condition}
                options={CONDITIONS}
                onChange={(v) => patch('condition', v)}
              />
              <FieldInput label="Quantity" value={draft.quantity} onChange={(v) => patch('quantity', v)} />
              <SelectField
                label="Inventory type"
                value={draft.inventoryType}
                options={INVENTORY_TYPES}
                onChange={(v) => patch('inventoryType', v)}
              />
            </div>
          </AdminCard>

          <AdminCard>
            <CardHead title="Pricing & bidding" />
            <div className="grid gap-2.5 sm:gap-3 md:grid-cols-3">
              <FieldInput
                label="Est. starting price (US$)"
                value={draft.startingPrice.replace(/^US\$/, '')}
                onChange={(v) => patch('startingPrice', v.startsWith('US$') ? v : `US$${v}`)}
              />
              <FieldInput
                label="Current bid (US$)"
                value={draft.currentBid.replace(/^US\$/, '').split(' ')[0] ?? ''}
                onChange={(v) =>
                  patch('currentBid', `US$${v.replace(/^US\$/, '')} (${draft.bidCount} bids)`)
                }
              />
              <FieldInput
                label="Cost per unit (US$)"
                value={draft.costPerUnit.replace(/^US\$/, '')}
                onChange={(v) => patch('costPerUnit', v.startsWith('US$') ? v : `US$${v}`)}
              />
              <FieldInput label="Auction ends in (hours)" value={draft.endsIn} onChange={(v) => patch('endsIn', v)} />
              <FieldInput
                label="Auction end date/time"
                value={draft.endDateTime}
                onChange={(v) => patch('endDateTime', v)}
              />
              <SelectField
                label="Buyer's premium"
                value={draft.buyersPremium}
                options={PREMIUMS}
                onChange={(v) => patch('buyersPremium', v)}
              />
            </div>
            <p className="mt-3 text-[12.5px] text-slate-500">
              Updating this recalculates the live countdown shown to buyers.
            </p>
          </AdminCard>

          <AdminCard>
            <CardHead title="Media" />
            <MediaThumbs count={draft.mediaCount} editing />
            <p className="mt-3 text-[12.5px] text-slate-500">
              Drag to reorder. Replacing an image updates the buyer-facing gallery on next publish.
            </p>
          </AdminCard>

          <AdminCard>
            <CardHead title="Shipping & location" />
            <div className="grid gap-2.5 sm:gap-3 md:grid-cols-3">
              <FieldInput label="Location" value={draft.location} onChange={(v) => patch('location', v)} />
              <FieldInput label="Shipment size" value={draft.shipmentSize} onChange={(v) => patch('shipmentSize', v)} />
              <FieldInput
                label="Est. weight (lbs)"
                value={draft.estWeight.replace(/^~/, '').replace(/ lbs$/, '')}
                onChange={(v) => patch('estWeight', `~${v} lbs`)}
              />
            </div>
            <div className="mt-4">
              <FieldInput label="Delivery" value={draft.delivery} onChange={(v) => patch('delivery', v)} />
            </div>
          </AdminCard>

          <AdminCard>
            <CardHead title="Sync information" />
            <div className="grid gap-2.5 sm:gap-3 md:grid-cols-2">
              <FieldInput label="Source" value={draft.source} onChange={(v) => patch('source', v)} />
              <SelectField
                label="Sync status"
                value={draft.syncStatus}
                options={['Synced', 'Sync error']}
                onChange={(v) => patch('syncStatus', v)}
              />
              <label className="flex flex-col gap-1.5 text-[13px]">
                <span className="font-medium text-slate-600">Last synced</span>
                <input
                  value={draft.lastSyncedAt ?? draft.lastSynced}
                  disabled
                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13.5px] text-slate-500"
                />
                <span className="text-[12px] text-slate-400">System-derived</span>
              </label>
              <label className="flex flex-col gap-1.5 text-[13px]">
                <span className="font-medium text-slate-600">Published</span>
                <input
                  value={draft.publishedAt ?? '—'}
                  disabled
                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13.5px] text-slate-500"
                />
                <span className="text-[12px] text-slate-400">System-derived</span>
              </label>
            </div>
          </AdminCard>
        </>
      ) : (
        <>
          <AdminCard>
            <CardHead title="Lot overview" />
            <LotKvGrid>
              <AdminKv label="Lot title" value={live.title} />
              <AdminKv label="Category" value={live.category} />
              <AdminKv label="Lot ID" value={live.id} />
              <AdminKv label="Subcategory" value={live.subcategory} />
              <AdminKv
                label="Status"
                value={<span className="font-medium text-emerald-700">{live.status}</span>}
              />
              <AdminKv label="Auction / source" value={live.auctionSource} />
            </LotKvGrid>
          </AdminCard>

          <div className="grid gap-3 xl:grid-cols-2 xl:gap-4">
            <AdminCard>
              <CardHead title="Lot information" />
              <p className="mb-4 text-[13px] leading-5 text-slate-600">{live.description}</p>
              <div className="space-y-2.5">
                <AdminKv label="Condition" value={live.condition} />
                <AdminKv label="Quantity" value={live.quantity} />
                <AdminKv label="Inventory type" value={live.inventoryType} />
              </div>
            </AdminCard>
            <AdminCard>
              <CardHead title="Pricing & bidding" />
              <div className="space-y-2.5">
                <AdminKv label="Est. starting price" value={live.startingPrice} />
                <AdminKv
                  label="Current bid"
                  value={<span className="font-medium text-emerald-700">{live.currentBid}</span>}
                />
                <AdminKv
                  label="Auction ends in"
                  value={<span className="font-medium text-amber-600">{live.endsIn}</span>}
                />
                <AdminKv label="Auction end date/time" value={live.endDateTime} />
                <AdminKv label="Cost per unit" value={live.costPerUnit} />
                <AdminKv label="Buyer's premium" value={live.buyersPremium} />
              </div>
            </AdminCard>
          </div>

          <AdminCard>
            <CardHead title="Media" />
            <MediaThumbs count={live.mediaCount} />
            <p className="mt-3 text-[12.5px] text-slate-500">
              {live.mediaCount} images synced from B-Stock. Use Edit to reorder, replace, or remove images.
            </p>
          </AdminCard>

          <div className="grid gap-3 xl:grid-cols-2 xl:gap-4">
            <AdminCard>
              <CardHead title="Shipping & location" />
              <div className="space-y-2.5">
                <AdminKv label="Location" value={live.location} />
                <AdminKv label="Shipment size" value={live.shipmentSize} />
                <AdminKv label="Est. weight" value={live.estWeight} />
                <AdminKv label="Delivery" value={live.delivery} />
              </div>
            </AdminCard>
            <AdminCard>
              <CardHead title="Sync information" />
              <div className="space-y-2.5">
                <AdminKv label="Source" value={live.source} />
                <AdminKv
                  label="Sync status"
                  value={
                    <span
                      className={cn(
                        'font-medium',
                        live.syncStatus === 'Synced' ? 'text-emerald-700' : 'text-red-600',
                      )}
                    >
                      {live.syncStatus}
                    </span>
                  }
                />
                <AdminKv label="Last synced" value={live.lastSyncedAt ?? live.lastSynced} />
                <AdminKv label="Published" value={live.publishedAt ?? '—'} />
              </div>
            </AdminCard>
          </div>
        </>
      )}

      {discardOpen ? (
        <AdminModal
          title="Discard unsaved changes?"
          subtitle="You've made changes to Lot overview that haven't been saved. If you leave now, they'll be lost."
          onClose={() => setDiscardOpen(false)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setDiscardOpen(false)}>
                Keep editing
              </AdminButton>
              <AdminButton
                onClick={confirmDiscard}
              >
                Discard changes
              </AdminButton>
            </>
          }
        >
          <div className="flex justify-center py-1">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-[22px] text-amber-600">
              !
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  )
}

export function LotDetailPage() {
  const { id } = useParams()
  const item = useAppSelector((s) => s.admin.lots.find((r) => r.id === id))
  if (!item) return <AdminNotFound label="Back to lots" to="/admin/lots" />
  return <LotDetail item={item} />
}
