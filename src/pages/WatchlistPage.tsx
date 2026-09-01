import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { icons } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import { Button } from '@/components/shared/Button'
import { EmptyState, PageHeader } from '@/components/shared/PageChrome'
import { Modal } from '@/components/shared/Modal'
import { Field, Input } from '@/components/shared/Field'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addSavedSearch,
  clearWatchlist,
  removeSavedSearch,
  toggleWatch,
} from '@/store/slices/watchlistSlice'
import { showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn, formatMoney } from '@/utils/format'
import { useCountdown } from '@/hooks/useCountdown'
import type { Lot } from '@/types'

type SortKey = 'ending' | 'price-asc' | 'price-desc' | 'name'

function lotCode(lot: Lot) {
  const n = Number(lot.id.replace(/\D/g, '')) || 0
  return `LOT-${4700 + n}`
}

function shortCountdown(endsAt: string) {
  const ms = new Date(endsAt).getTime() - Date.now()
  if (ms <= 0) return { label: 'Ended', urgent: false, totalMinutes: 0 }
  const totalMinutes = Math.floor(ms / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  const label =
    days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${Math.max(1, minutes)}m`
  return { label, urgent: totalMinutes > 0 && totalMinutes < 60, totalMinutes }
}

function shippingEstimate(lot: Lot) {
  return Math.max(120, Math.round(lot.currentBid * 0.275))
}

function WatchRow({ lot, rowRef }: { lot: Lot; rowRef?: (el: HTMLDivElement | null) => void }) {
  const dispatch = useAppDispatch()
  const tick = useCountdown(lot.endsAt)
  const { label, urgent } = shortCountdown(lot.endsAt)
  void tick
  const shipping = shippingEstimate(lot)
  const landed = lot.currentBid + shipping

  return (
    <div
      ref={rowRef}
      id={`watch-${lot.id}`}
      className="grid grid-cols-1 items-center gap-4 border-b border-[#ebebec] px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_120px_140px]"
    >
      <div className="flex min-w-0 gap-3">
        <img src={lot.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0">
          <Link
            to={`/lots/${lot.slug}`}
            className="block truncate text-[14px] font-semibold text-[#480516] hover:underline"
          >
            {lot.title}
          </Link>
          <p className="mt-0.5 truncate text-[12px] text-[#9ca3af]">
            {lotCode(lot)} · {lot.category} · {lot.brand ?? 'Seller'} · {lot.bidCount} bids
          </p>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-[#f3f4f6] px-2 py-0.5 text-[11px] text-[#4b5563]">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3.5 8.5 6.5 11.5 12.5 4.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {lot.condition}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#9ca3af]">Current bid</p>
          <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-[#1a1e26]">
            {formatMoney(lot.currentBid)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#9ca3af]">Landed cost</p>
          <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-[#1a1e26]">{formatMoney(landed)}</p>
          <p className="text-[11px] text-[#9ca3af]">+{formatMoney(shipping)} shipping</p>
        </div>
      </div>

      <div className="flex lg:justify-center">
        {urgent ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff383c] px-2.5 py-1 text-[12px] font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {label}
          </span>
        ) : (
          <span className="text-[13px] text-[#7a7b7c]">{label}</span>
        )}
      </div>

      <div className="flex items-center gap-2 lg:justify-end">
        <Link to={`/lots/${lot.slug}`}>
          <Button size="sm" className="min-w-[72px]">
            Bid
          </Button>
        </Link>
        <button
          type="button"
          aria-label="Remove from watchlist"
          onClick={() => {
            dispatch(toggleWatch(lot.id))
            dispatch(showToast('Removed from watchlist'))
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#f2bc1b] transition hover:bg-[#fff8e6]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function WatchlistPage() {
  const dispatch = useAppDispatch()
  const ids = useAppSelector((s) => s.watchlist.ids)
  const searches = useAppSelector((s) => s.watchlist.searches ?? [])
  const allLots = useAppSelector((s) => s.auctions.lots)
  const [tab, setTab] = useState<'watchlist' | 'searches'>('watchlist')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('ending')
  const [createOpen, setCreateOpen] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const urgentRowRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const lots = useMemo(() => {
    const watched = allLots.filter((l) => ids.includes(l.id))
    const q = query.trim().toLowerCase()
    let list = q
      ? watched.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            lotCode(l).toLowerCase().includes(q) ||
            l.category.toLowerCase().includes(q) ||
            (l.brand ?? '').toLowerCase().includes(q),
        )
      : watched

    list = [...list].sort((a, b) => {
      if (sort === 'ending') return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
      if (sort === 'price-asc') return a.currentBid - b.currentBid
      if (sort === 'price-desc') return b.currentBid - a.currentBid
      return a.title.localeCompare(b.title)
    })
    return list
  }, [allLots, ids, query, sort])

  const urgentLots = useMemo(
    () => lots.filter((l) => shortCountdown(l.endsAt).urgent),
    [lots],
  )

  const newResultsTotal = searches.reduce((sum, s) => sum + s.newResults, 0)

  const stats = [
    {
      label: 'Watched Lots',
      value: String(ids.length),
      foot: 'across all categories',
      valueClass: 'text-[#1a1e26]',
    },
    {
      label: 'Closing Urgently',
      value: String(urgentLots.length),
      foot: 'within the next hour',
      valueClass: 'text-[#ff383c]',
    },
    {
      label: 'Saved Searches',
      value: String(searches.length),
      foot: 'with email alerts',
      valueClass: 'text-[#1a1e26]',
    },
    {
      label: 'New Results',
      value: String(newResultsTotal),
      foot: 'across all searches',
      valueClass: 'text-[#480516]',
    },
  ]

  const scrollToUrgent = () => {
    const first = urgentLots[0]
    if (!first) return
    urgentRowRefs.current[first.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Watchlist & Searches"
        subtitle="Track lots you're interested in and monitor your saved searches"
        actions={
          <Button
            onClick={() => {
              setTab('searches')
              setCreateOpen(true)
            }}
          >
            <Icon src={icons.search} size={14} className="[&_img]:brightness-0 [&_img]:invert" />
            New Saved Search
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#ebebec] bg-white px-5 py-4">
            <p className="text-[13px] text-[#7a7b7c]">{card.label}</p>
            <p className={cn('mt-1 text-[28px] font-semibold tabular-nums leading-none', card.valueClass)}>
              {card.value}
            </p>
            <p className="mt-2 text-[12px] text-[#9ca3af]">{card.foot}</p>
          </div>
        ))}
      </div>

      {urgentLots.length > 0 && tab === 'watchlist' ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[#f5c2c0] bg-[#fdebec] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[14px] font-medium text-[#c62828]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff383c]" />
            {urgentLots.length} watched lot{urgentLots.length === 1 ? '' : 's'} closing within the hour — act
            now
          </p>
          <button
            type="button"
            onClick={scrollToUrgent}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-[#ff383c] px-4 text-[13px] font-medium text-white hover:opacity-90"
          >
            View now
          </button>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-[#ebebec] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#ebebec] px-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            {(
              [
                { id: 'watchlist' as const, label: `Watchlist ${ids.length}` },
                { id: 'searches' as const, label: `Saved Searches ${searches.length}` },
              ]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative -mb-px px-3 py-3 text-[14px] font-medium transition',
                  tab === t.id ? 'text-[#480516]' : 'text-[#7a7b7c] hover:text-[#1a1e26]',
                )}
              >
                {t.label}
                {tab === t.id ? (
                  <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-[#480516]" />
                ) : null}
              </button>
            ))}
          </div>

          {tab === 'watchlist' ? (
            <div className="flex flex-wrap items-center gap-2 pb-2 sm:pb-0">
              <div className="relative">
                <Icon
                  src={icons.search}
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by name..."
                  className="h-9 w-[180px] rounded-lg border border-[#ebebec] bg-white pl-8 pr-3 text-[13px] outline-none focus:border-[#480516] sm:w-[220px]"
                />
              </div>
              <label className="relative inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#ebebec] px-3 text-[13px] text-[#1a1e26]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M3 6h18M6 12h12M10 18h4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[#7a7b7c]">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="cursor-pointer bg-transparent font-medium outline-none"
                >
                  <option value="ending">Ending Soon</option>
                  <option value="price-asc">Price: Low–High</option>
                  <option value="price-desc">Price: High–Low</option>
                  <option value="name">Name</option>
                </select>
              </label>
            </div>
          ) : null}
        </div>

        {tab === 'watchlist' ? (
          <>
            <div className="hidden border-b border-[#ebebec] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[#9ca3af] lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_120px_140px]">
              <span>Lot</span>
              <span>Pricing</span>
              <span className="text-center">Closes</span>
              <span className="text-right">Actions</span>
            </div>

            {lots.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Watchlist is empty"
                  body="Star a lot from Home or Detail to save it here."
                />
              </div>
            ) : (
              <div>
                {lots.map((lot) => (
                  <WatchRow
                    key={lot.id}
                    lot={lot}
                    rowRef={(el) => {
                      urgentRowRefs.current[lot.id] = el
                    }}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-[#ebebec] px-4 py-3">
              <p className="text-[12px] text-[#9ca3af]">
                {lots.length} lot{lots.length === 1 ? '' : 's'} watched
              </p>
              {ids.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearWatchlist())
                    dispatch(showToast('Watchlist cleared'))
                  }}
                  className="text-[13px] font-medium text-[#ff383c] hover:underline"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            {searches.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No saved searches"
                  body="Create a saved search to get alerts when matching lots go live."
                />
              </div>
            ) : (
              <div>
                {searches.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col gap-3 border-b border-[#ebebec] px-4 py-4 last:border-b-0 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-[#1a1e26]">{s.name}</p>
                      <p className="mt-0.5 text-[12px] text-[#9ca3af]">
                        {s.query} · {s.category}
                        {s.emailAlerts ? ' · Email alerts on' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {s.newResults > 0 ? (
                        <span className="rounded-full bg-[#f9f5f6] px-2.5 py-1 text-[12px] font-medium text-[#480516]">
                          {s.newResults} new
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#9ca3af]">No new results</span>
                      )}
                      <Link to={`/categories/all`}>
                        <Button size="sm" variant="secondary">
                          View results
                        </Button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(removeSavedSearch(s.id))
                          dispatch(showToast('Saved search removed'))
                        }}
                        className="text-[13px] text-[#7a7b7c] hover:text-[#ff383c]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-[#ebebec] px-4 py-3 text-[12px] text-[#9ca3af]">
              {searches.length} saved search{searches.length === 1 ? '' : 'es'}
            </div>
          </>
        )}
      </section>

      {createOpen ? (
        <Modal
          title="New Saved Search"
          onClose={() => setCreateOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!searchName.trim() || !searchQuery.trim()) return
                  dispatch(
                    addSavedSearch({
                      name: searchName.trim(),
                      query: searchQuery.trim(),
                    }),
                  )
                  setCreateOpen(false)
                  setSearchName('')
                  setSearchQuery('')
                  dispatch(
                    showSuccess({
                      title: 'Saved Search Created',
                      body: 'We’ll notify you when new lots match this search.',
                      actionLabel: 'Done',
                    }),
                  )
                }}
              >
                Save search
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-left">
            <Field label="Name">
              <Input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g. Heavy equipment · US"
              />
            </Field>
            <Field label="Keywords">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="excavator OR tractor"
              />
            </Field>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
