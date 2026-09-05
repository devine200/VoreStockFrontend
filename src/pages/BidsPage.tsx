import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LOTS, getLot } from '@/api/fixtures'
import { Icon } from '@/components/shared/Icon'
import { Button } from '@/components/shared/Button'
import { EmptyState, PageHeader } from '@/components/shared/PageChrome'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { openModal, showToast } from '@/store/slices/uiSlice'
import { cn, formatMoney } from '@/utils/format'
import { useCountdown } from '@/hooks/useCountdown'
import type { Bid, Lot } from '@/types'
import searchFieldIcon from '@/assets/icons/search-field.svg'
import filterIcon from '@/assets/icons/filter.svg'

const PAGE_SIZE = 4

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
    days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  return { label, urgent: totalMinutes < 60, totalMinutes }
}

function formatSettlementClock(c: ReturnType<typeof useCountdown>) {
  if (c.expired) return 'Past due'
  const h = c.days * 24 + c.hours
  return `${h}h : ${String(c.minutes).padStart(2, '0')}m : ${String(c.seconds).padStart(2, '0')}s`
}

function formatClosed(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: 'success' | 'danger' | 'neutral'
}) {
  const tones = {
    success: 'bg-[#e8f6ee] text-[#1f7a45]',
    danger: 'bg-[#fdebec] text-[#c62828]',
    neutral: 'bg-[#f3f4f6] text-[#4b5563]',
  }
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {label}
    </span>
  )
}

function BidsStats({ bids }: { bids: Bid[] }) {
  const active = bids.filter((b) => b.status === 'leading' || b.status === 'outbid' || b.status === 'active')
  const leading = active.filter((b) => b.status === 'leading').length
  const outbid = active.filter((b) => b.status === 'outbid').length
  const won = bids.filter((b) => b.status === 'won').length
  const totalPlaced = 184
  const winRate = Math.round((68 / totalPlaced) * 100)
  const committed = active.reduce((sum, b) => sum + (b.maxBid ?? b.amount), 0)

  const cards = [
    {
      label: 'Active Bids',
      value: String(active.length),
      foot: `${leading} leading · ${outbid} outbid`,
      valueClass: 'text-[#1a1e26]',
    },
    {
      label: 'Total Bids Placed',
      value: String(totalPlaced),
      foot: 'across all auctions',
      valueClass: 'text-[#1a1e26]',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      foot: `${won > 0 ? 68 : 0} won of ${totalPlaced} placed`,
      valueClass: 'text-[#1f7a45]',
    },
    {
      label: 'Committed',
      value: formatMoney(committed || 44380),
      foot: 'across active bids',
      valueClass: 'text-[#480516]',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-[#ebebec] bg-white px-5 py-4"
        >
          <p className="text-[13px] text-[#7a7b7c]">{card.label}</p>
          <p className={cn('mt-1 text-[28px] font-semibold tabular-nums leading-none', card.valueClass)}>
            {card.value}
          </p>
          <p className="mt-2 text-[12px] text-[#9ca3af]">{card.foot}</p>
        </div>
      ))}
    </div>
  )
}

function EndingSoonCard({ lot }: { lot: Lot }) {
  const tick = useCountdown(lot.endsAt)
  const { label, urgent } = shortCountdown(lot.endsAt)
  void tick

  return (
    <Link
      to={`/lots/${lot.slug}`}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white p-3 transition hover:shadow-sm',
        urgent ? 'border-[#f5c2c0]' : 'border-[#ebebec]',
      )}
    >
      <img src={lot.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[#1a1e26]">{lot.title}</p>
        <p className="mt-0.5 truncate text-[12px] text-[#7a7b7c]">
          {formatMoney(lot.currentBid)} · {lot.bidCount} bids · {lotCode(lot)}
        </p>
      </div>
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium',
          urgent ? 'bg-[#fdebec] text-[#c62828]' : 'bg-[#f3f4f6] text-[#6b7280]',
        )}
      >
        {urgent ? <span className="h-1.5 w-1.5 rounded-full bg-[#c62828]" /> : null}
        {label}
      </span>
    </Link>
  )
}

function EndingSoonSection() {
  const endingSoon = useMemo(
    () =>
      [...LOTS]
        .filter((l) => l.status === 'live')
        .sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime())
        .slice(0, 4),
    [],
  )

  return (
    <section className="rounded-xl border border-[#ebebec] bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#1a1e26]">
          Ending soon
          <span className="h-2 w-2 rounded-full bg-[#ff383c]" />
        </h2>
        <p className="text-[12px] text-[#9ca3af]">{endingSoon.length} auctions closing shortly</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {endingSoon.map((lot) => (
          <EndingSoonCard key={lot.id} lot={lot} />
        ))}
      </div>
    </section>
  )
}

function ActiveBidRow({ bid }: { bid: Bid }) {
  const lot = getLot(bid.lotId)
  const countdown = useCountdown(lot?.endsAt ?? new Date().toISOString())
  if (!lot) return null

  const leading = bid.status === 'leading'
  const max = bid.maxBid ?? bid.amount
  const progress = Math.min(100, Math.round((lot.currentBid / max) * 100))
  const delta = lot.currentBid - bid.amount
  const urgent = !countdown.expired && countdown.days === 0 && countdown.hours === 0

  return (
    <div className="grid grid-cols-1 items-center gap-4 border-b border-[#ebebec] px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_140px_140px]">
      <div className="flex min-w-0 gap-3">
        <img src={lot.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <Link to={`/lots/${lot.slug}`} className="block truncate text-[14px] font-medium text-[#1a1e26] hover:text-[#480516]">
            {lot.title}
          </Link>
          <p className="mt-0.5 text-[12px] text-[#9ca3af]">
            {lotCode(lot)} · {lot.category} · {lot.bidCount} bids
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#f3f4f6]">
              <div
                className={cn('h-full rounded-full', leading ? 'bg-[#2e9b57]' : 'bg-[#e53935]')}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-[#7a7b7c]">
              {formatMoney(lot.currentBid)} / {formatMoney(max)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Your bid</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[#1a1e26]">{formatMoney(bid.amount)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Current</p>
          <p
            className={cn(
              'mt-0.5 text-[13px] font-semibold tabular-nums',
              leading ? 'text-[#1f7a45]' : 'text-[#c62828]',
            )}
          >
            {formatMoney(lot.currentBid)}
          </p>
          {!leading && delta > 0 ? (
            <p className="text-[11px] text-[#c62828]">+{formatMoney(delta)} above</p>
          ) : null}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Max</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[#1a1e26]">{formatMoney(max)}</p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-1.5 lg:items-center">
        <StatusPill label={leading ? 'Leading' : 'Outbid'} tone={leading ? 'success' : 'danger'} />
        <p
          className={cn(
            'flex items-center gap-1.5 text-[12px]',
            urgent ? 'text-[#c62828]' : 'text-[#7a7b7c]',
          )}
        >
          {urgent ? <span className="h-1.5 w-1.5 rounded-full bg-[#c62828]" /> : null}
          {countdown.label}
        </p>
      </div>

      <div className="flex justify-start lg:justify-end">
        <Link to={`/lots/${lot.slug}`}>
          <Button size="sm" className="min-w-[110px]">
            Open lot
          </Button>
        </Link>
      </div>
    </div>
  )
}

function WonBidRow({ bid }: { bid: Bid }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const lot = getLot(bid.lotId)
  const dueAt = bid.settlementDueAt ?? lot?.endsAt ?? new Date().toISOString()
  const due = useCountdown(dueAt)
  const dueLabel = formatSettlementClock(due)
  if (!lot) return null

  const msrpPct = lot.msrp ? Math.round((bid.amount / lot.msrp) * 100) : 0

  return (
    <div className="flex flex-col gap-4 border-b border-[#ebebec] px-4 py-4 last:border-b-0 xl:flex-row xl:items-center">
      <div className="flex min-w-0 flex-1 gap-3">
        <img src={lot.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-[#1a1e26]">{lot.title}</p>
          <p className="mt-0.5 text-[12px] text-[#9ca3af]">
            {lotCode(lot)} · {lot.category} · Closed {formatClosed(lot.endsAt)}
          </p>
          <div className="mt-2">
            <StatusPill label="Won" tone="success" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:w-[420px]">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Final bid</p>
          <p className="mt-0.5 text-[14px] font-semibold tabular-nums text-[#1a1e26]">{formatMoney(bid.amount)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">MSRP</p>
          <p className="mt-0.5 text-[14px] tabular-nums text-[#7a7b7c]">{formatMoney(lot.msrp)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">% of MSRP</p>
          <p className="mt-0.5 text-[14px] font-semibold tabular-nums text-[#1f7a45]">{msrpPct}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Remaining settlement due</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[#c62828]">{dueLabel}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 xl:ml-auto">
        <Button
          size="sm"
          onClick={() =>
            dispatch(
              openModal({
                type: 'settle-balance',
                payload: {
                  bidId: bid.id,
                  lotId: lot.id,
                  amount: bid.amount,
                  settlementDueAt: dueAt,
                },
              }),
            )
          }
        >
          Settle Balance
        </Button>
        <Button size="sm" variant="soft" onClick={() => navigate('/orders')}>
          View Order
        </Button>
      </div>
    </div>
  )
}

function LostBidRow({ bid }: { bid: Bid }) {
  const lot = getLot(bid.lotId)
  if (!lot) return null

  const max = bid.maxBid ?? bid.amount
  const winning = bid.winningBid ?? lot.currentBid
  const missed = Math.max(0, winning - max)

  return (
    <div className="flex flex-col gap-4 border-b border-[#ebebec] px-4 py-4 last:border-b-0 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 gap-3">
        <img src={lot.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-[#1a1e26]">{lot.title}</p>
          <p className="mt-0.5 text-[12px] text-[#9ca3af]">
            {lotCode(lot)} · Closed {formatClosed(lot.endsAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 lg:w-[320px]">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Your max bid</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[#1a1e26]">{formatMoney(max)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Winning bid</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[#c62828]">{formatMoney(winning)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Missed by</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-[#1a1e26]">+{formatMoney(missed)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:ml-auto">
        <StatusPill label="Lost" tone="danger" />
        <Link to={`/categories/${lot.categorySlug}`}>
          <Button size="sm" variant="secondary">
            Find similar
          </Button>
        </Link>
      </div>
    </div>
  )
}

export function BidsPage() {
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'active'
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const bids = useAppSelector((s) => s.bids.items)

  const counts = useMemo(
    () => ({
      active: bids.filter((b) => b.status === 'active' || b.status === 'leading' || b.status === 'outbid').length,
      won: bids.filter((b) => b.status === 'won').length,
      lost: bids.filter((b) => b.status === 'lost').length,
    }),
    [bids],
  )

  const filtered = useMemo(() => {
    const list =
      tab === 'won'
        ? bids.filter((b) => b.status === 'won')
        : tab === 'lost'
          ? bids.filter((b) => b.status === 'lost')
          : bids.filter((b) => b.status === 'active' || b.status === 'leading' || b.status === 'outbid')

    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((b) => {
      const lot = getLot(b.lotId)
      if (!lot) return false
      return (
        lot.title.toLowerCase().includes(q) ||
        lotCode(lot).toLowerCase().includes(q) ||
        lot.category.toLowerCase().includes(q)
      )
    })
  }, [bids, tab, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, pageCount)
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  const setTab = (id: string) => {
    setParams({ tab: id })
    setPage(1)
  }

  const footerLabel =
    tab === 'won'
      ? `Showing ${filtered.length} won auctions`
      : tab === 'lost'
        ? `Showing ${filtered.length} lost bids`
        : `Showing ${filtered.length} active bids`

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Bids & Auctions" subtitle="Manual and automatic bidding activity" />

      <BidsStats bids={bids} />
      <EndingSoonSection />

      <section className="overflow-hidden rounded-xl border border-[#ebebec] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#ebebec] px-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            {(
              [
                { id: 'active', label: 'Active', count: counts.active },
                { id: 'won', label: 'Won', count: counts.won },
                { id: 'lost', label: 'Lost', count: counts.lost },
              ] as const
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
                {t.label} ({t.count})
                {tab === t.id ? (
                  <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-[#480516]" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 inline-flex -translate-y-1/2 overflow-hidden"
                style={{ width: 15, height: 13 }}
              >
                <img src={searchFieldIcon} alt="" className="block size-full max-w-none" />
              </span>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search lots…"
                className="h-[34px] w-[180px] rounded-lg border border-[#ebebec] bg-[#f5f5f6] pl-8 pr-3 text-[12px] outline-none focus:border-[#480516] sm:w-[220px]"
              />
            </div>
            <button
              type="button"
              onClick={() => dispatch(showToast('Filters coming soon'))}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#ebebec] px-3 text-[12px] text-[#46494f] hover:bg-[#f9fafb]"
            >
              <Icon src={filterIcon} size={12} />
              Filter
            </button>
          </div>
        </div>

        {tab === 'active' ? (
          <div className="hidden border-b border-[#ebebec] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[#9ca3af] lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_140px_140px]">
            <span>Lot</span>
            <span>Bids</span>
            <span className="text-center">Status</span>
            <span className="text-right">Actions</span>
          </div>
        ) : null}

        {paged.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Nothing here yet" body="Place a bid on a live lot to see it in Active." />
          </div>
        ) : (
          <div>
            {paged.map((bid) =>
              tab === 'won' ? (
                <WonBidRow key={bid.id} bid={bid} />
              ) : tab === 'lost' ? (
                <LostBidRow key={bid.id} bid={bid} />
              ) : (
                <ActiveBidRow key={bid.id} bid={bid} />
              ),
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-[#ebebec] px-4 py-3">
          <p className="text-[12px] text-[#9ca3af]">{footerLabel}</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.max(pageCount, 3) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                disabled={n > pageCount}
                onClick={() => setPage(n)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition',
                  n === pageSafe
                    ? 'bg-[#480516] text-white'
                    : n > pageCount
                      ? 'cursor-default text-[#d1d5db]'
                      : 'text-[#7a7b7c] hover:bg-[#f3f4f6]',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
