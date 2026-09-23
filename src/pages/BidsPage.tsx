import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LOTS, getLot } from '@/api/fixtures'
import { Icon } from '@/components/shared/Icon'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/PageChrome'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { openModal } from '@/store/slices/uiSlice'
import { cn, formatMoney } from '@/utils/format'
import { useCountdown } from '@/hooks/useCountdown'
import type { Bid, Lot } from '@/types'
import searchFieldIcon from '@/assets/icons/search-field.svg'
import filterIcon from '@/assets/icons/filter.svg'

const PAGE_SIZE = 6

type BidFilter = 'all' | 'leading' | 'outbid'

const FILTERS: { id: BidFilter; label: string }[] = [
  { id: 'all', label: 'All bids' },
  { id: 'leading', label: 'Leading' },
  { id: 'outbid', label: 'Outbid' },
]

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

function FilterControl({
  value,
  onChange,
  disabled,
}: {
  value: BidFilter
  onChange: (id: BidFilter) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = FILTERS.find((o) => o.id === value)?.label ?? 'Filter'

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#ebebec] px-3 text-[12px] text-[#46494f] transition',
          value !== 'all' ? 'bg-[#f8f3f4] text-[#480516]' : 'bg-white hover:bg-[#f9fafb]',
          disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
        )}
      >
        <Icon src={filterIcon} size={12} />
        <span className="max-w-[88px] truncate sm:max-w-none">{value === 'all' ? 'Filter' : current}</span>
      </button>
      {open && !disabled ? (
        <div className="absolute right-0 z-20 mt-1 min-w-[168px] overflow-hidden rounded-xl border border-[#ebebec] bg-white py-1 shadow-[0px_8px_24px_rgba(26,30,38,0.12)]">
          {FILTERS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center px-3.5 py-2 text-left text-[13px] transition',
                value === opt.id ? 'bg-[#f8f3f4] font-medium text-[#480516]' : 'text-[#46494f] hover:bg-[#f9fafb]',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: 'leading' | 'outbid' | 'buffer' | 'won' | 'lost'
}) {
  const tones = {
    leading: 'bg-[#e6f4ed] px-2.5 py-1 font-semibold tracking-[0.3px] text-[#0a6e38]',
    outbid: 'bg-[#fff1f1] px-2.5 py-1 font-semibold tracking-[0.3px] text-[#e03030]',
    buffer: 'bg-[#fffbeb] px-2 py-0.5 font-medium text-[#b45309]',
    won: 'bg-[#e6f4ed] px-2.5 py-1 font-semibold tracking-[0.3px] text-[#0a6e38]',
    lost: 'bg-[#f3f3f4] px-2.5 py-1 font-semibold tracking-[0.3px] text-[#9d9ea2]',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full text-[12px]', tones[tone])}>
      {label}
    </span>
  )
}

function TimeBadge({ label, urgent, amber }: { label: string; urgent: boolean; amber?: boolean }) {
  if (!urgent) {
    return (
      <span className="inline-flex items-center rounded-full bg-[#f3f3f4] px-2.5 py-1 text-[12px] font-semibold text-[#7a7b7c]">
        {label}
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold',
        amber ? 'bg-[#fffbeb] text-[#b45309]' : 'bg-[#fff1f1] text-[#e03030]',
      )}
    >
      <span className={cn('size-1.5 rounded-full opacity-50', amber ? 'bg-[#b45309]' : 'bg-[#e03030]')} />
      {label}
    </span>
  )
}

function LotThumb({ src }: { src: string }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ebebec] bg-[#f5f5f6]">
      <img src={src} alt="" className="size-9 object-contain" />
    </span>
  )
}

function Metric({
  label,
  value,
  valueClass = 'font-semibold text-[#1a1e26]',
  note,
}: {
  label: string
  value: string
  valueClass?: string
  note?: string
}) {
  return (
    <div className="min-w-0 text-right">
      <p className="text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#9d9ea2]">{label}</p>
      <p className={cn('text-[14px] leading-5 tabular-nums', valueClass)}>{value}</p>
      {note ? <p className="text-[10px] leading-[15px] text-[#e03030]">{note}</p> : null}
    </div>
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
      valueClass: 'text-[#0a6e38]',
    },
    {
      label: 'Committed',
      value: formatMoney(committed || 44380),
      foot: 'across active bids',
      valueClass: 'text-[#480516]',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex min-w-0 flex-col items-start gap-2 rounded-2xl border border-[#ebebec] bg-white px-4 py-4 sm:px-6 sm:py-5"
        >
          <p className="text-[10px] font-medium uppercase leading-[16.5px] tracking-[1.1px] text-[#9d9ea2] sm:text-[11px]">
            {card.label}
          </p>
          <p className={cn('text-[28px] font-semibold leading-9 tracking-[-1.5px] tabular-nums sm:text-[36px]', card.valueClass)}>
            {card.value}
          </p>
          <p className="text-[12px] leading-4 text-[#9d9ea2]">{card.foot}</p>
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
        'flex min-w-0 items-center gap-4 rounded-2xl border bg-white p-4 transition hover:shadow-sm',
        urgent ? 'border-[#fca5a5]' : 'border-[#ebebec]',
      )}
    >
      <LotThumb src={lot.image} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium leading-5 text-[#1a1e26]">{lot.title}</p>
        <p className="mt-0.5 flex min-w-0 items-center gap-2 truncate text-[12px] leading-4">
          <span className="font-semibold text-[#46494f]">{formatMoney(lot.currentBid)}</span>
          <span className="text-[#9d9ea2]">·</span>
          <span className="text-[#9d9ea2]">{lot.bidCount} bids</span>
          <span className="text-[#9d9ea2]">·</span>
          <span className="font-mono text-[#9d9ea2]">{lotCode(lot)}</span>
        </p>
      </div>
      <TimeBadge label={label} urgent={urgent} />
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
    <section className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
      <div className="flex flex-col gap-1 border-b border-[#ebebec] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold leading-5 text-[#1a1e26]">
          <span className="size-2 rounded-full bg-[#e03030] opacity-50" />
          Ending soon
        </h2>
        <p className="text-[12px] leading-4 text-[#9d9ea2]">{endingSoon.length} auctions closing shortly</p>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2">
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
  const buffer = !leading && lot.currentBid > max
  const tone = leading ? 'leading' : buffer ? 'buffer' : 'outbid'
  const statusLabel = leading ? 'Leading' : buffer ? 'Buffer locked' : 'Outbid'
  const progress = Math.min(100, Math.round((lot.currentBid / Math.max(max, 1)) * 100))
  const delta = lot.currentBid - bid.amount
  const { label, urgent } = shortCountdown(lot.endsAt)
  void countdown

  return (
    <div className="flex flex-col gap-4 border-b border-[#ebebec] px-4 py-4 last:border-b-0 sm:px-5 lg:grid lg:grid-cols-[minmax(0,1.4fr)_220px_96px_150px] lg:items-center lg:gap-5">
      <div className="flex min-w-0 gap-5">
        <LotThumb src={lot.image} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/lots/${lot.slug}`} className="min-w-0 truncate text-[14px] font-medium leading-5 text-[#1a1e26] hover:text-[#480516]">
              {lot.title}
            </Link>
            <span className="shrink-0 lg:hidden">
              <StatusPill label={statusLabel} tone={tone} />
            </span>
          </div>
          <p className="mt-0.5 flex min-w-0 items-center gap-2 truncate text-[12px] leading-4">
            <span className="font-mono text-[#9d9ea2]">{lotCode(lot)}</span>
            <span className="text-[#ebebec]">·</span>
            <span className="truncate text-[#7a7b7c]">{lot.category}</span>
            <span className="text-[#ebebec]">·</span>
            <span className="text-[#9d9ea2]">{lot.bidCount} bids</span>
          </p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-[#ebebec]">
              <div
                className={cn('h-full rounded-full', leading ? 'bg-[#0a6e38]' : 'bg-[#e03030]')}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] leading-[15px] tabular-nums text-[#9d9ea2]">
              {formatMoney(lot.currentBid)} / {formatMoney(max)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 lg:flex lg:items-center lg:justify-end lg:gap-6">
        <Metric label="Your Bid" value={formatMoney(bid.amount)} />
        <Metric
          label="Current"
          value={formatMoney(lot.currentBid)}
          valueClass={cn('font-semibold', leading ? 'text-[#0a6e38]' : 'text-[#e03030]')}
          note={!leading && delta > 0 ? `+${formatMoney(delta)} above` : undefined}
        />
        <Metric label="Max" value={formatMoney(max)} valueClass="font-normal text-[#46494f]" />
      </div>

      <div className="hidden flex-col items-center justify-center gap-1.5 lg:flex">
        <StatusPill label={statusLabel} tone={tone} />
        <TimeBadge label={label} urgent={urgent} amber={buffer} />
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-center">
        <span className="lg:hidden">
          <TimeBadge label={label} urgent={urgent} amber={buffer} />
        </span>
        <Link to={`/lots/${lot.slug}`}>
          <Button size="sm" className="h-8 rounded-xl px-3.5 text-[12px] font-medium">
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
    <div className="flex flex-col gap-4 border-b border-[#ebebec] px-4 py-4 last:border-b-0 sm:px-5 xl:flex-row xl:items-center xl:gap-5">
      <div className="flex min-w-0 flex-1 gap-5">
        <LotThumb src={lot.image} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/lots/${lot.slug}`} className="min-w-0 truncate text-[14px] font-medium leading-5 text-[#1a1e26] hover:text-[#480516]">
              {lot.title}
            </Link>
            <span className="shrink-0 xl:hidden">
              <StatusPill label="Won" tone="won" />
            </span>
          </div>
          <p className="mt-0.5 flex min-w-0 items-center gap-2 truncate text-[12px] leading-4">
            <span className="font-mono text-[#9d9ea2]">{lotCode(lot)}</span>
            <span className="text-[#ebebec]">·</span>
            <span className="truncate text-[#7a7b7c]">{lot.category}</span>
            <span className="text-[#ebebec]">·</span>
            <span className="text-[#9d9ea2]">Closed {formatClosed(lot.endsAt)}</span>
          </p>
        </div>
      </div>

      <span className="hidden shrink-0 xl:inline-flex">
        <StatusPill label="Won" tone="won" />
      </span>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4 xl:flex xl:items-center xl:gap-8">
        <Metric label="Final Bid" value={formatMoney(bid.amount)} />
        <Metric label="MSRP" value={formatMoney(lot.msrp)} valueClass="font-normal text-[#7a7b7c]" />
        <Metric label="% of MSRP" value={`${msrpPct}%`} valueClass="font-semibold text-[#0a6e38]" />
        <Metric label="Remaining Settlement Due" value={dueLabel} valueClass="font-semibold text-[#ea4335]" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 xl:ml-auto xl:flex xl:w-[264px]">
        <Button
          size="sm"
          className="h-10 flex-1 rounded-xl px-3 text-[14px] font-medium"
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
        <Button
          size="sm"
          variant="soft"
          className="h-10 flex-1 rounded-xl px-3 text-[12px] font-medium"
          onClick={() => navigate('/orders')}
        >
          View order
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
    <div className="flex flex-col gap-4 border-b border-[#ebebec] px-4 py-4 last:border-b-0 sm:px-5 lg:flex-row lg:items-center lg:gap-5">
      <div className="flex min-w-0 flex-1 gap-5">
        <LotThumb src={lot.image} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/lots/${lot.slug}`} className="min-w-0 truncate text-[14px] font-medium leading-5 text-[#1a1e26] hover:text-[#480516]">
              {lot.title}
            </Link>
            <span className="shrink-0 lg:hidden">
              <StatusPill label="Lost" tone="lost" />
            </span>
          </div>
          <p className="mt-0.5 flex min-w-0 items-center gap-2 truncate text-[12px] leading-4">
            <span className="font-mono text-[#9d9ea2]">{lotCode(lot)}</span>
            <span className="text-[#ebebec]">·</span>
            <span className="text-[#9d9ea2]">Closed {formatClosed(lot.endsAt)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 lg:flex lg:items-center lg:gap-8">
        <Metric label="Your Max Bid" value={formatMoney(max)} />
        <Metric label="Winning Bid" value={formatMoney(winning)} valueClass="font-semibold text-[#e03030]" />
        <Metric label="Missed By" value={`+${formatMoney(missed)}`} valueClass="font-normal text-[#7a7b7c]" />
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <span className="hidden lg:inline-flex">
          <StatusPill label="Lost" tone="lost" />
        </span>
        <Link to={`/categories/${lot.categorySlug}`}>
          <Button size="sm" variant="soft" className="h-[34px] rounded-xl px-3.5 text-[12px] font-medium">
            Find similar
          </Button>
        </Link>
      </div>
    </div>
  )
}

export function BidsPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'active'
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<BidFilter>('all')
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
    let list =
      tab === 'won'
        ? bids.filter((b) => b.status === 'won')
        : tab === 'lost'
          ? bids.filter((b) => b.status === 'lost')
          : bids.filter((b) => b.status === 'active' || b.status === 'leading' || b.status === 'outbid')

    if (tab === 'active' && filter === 'leading') {
      list = list.filter((b) => b.status === 'leading')
    } else if (tab === 'active' && filter === 'outbid') {
      list = list.filter((b) => b.status === 'outbid')
    }

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
  }, [bids, tab, query, filter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, pageCount)
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  const setTab = (id: string) => {
    setParams({ tab: id })
    setPage(1)
    setFilter('all')
  }

  const rangeStart = filtered.length === 0 ? 0 : (pageSafe - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(pageSafe * PAGE_SIZE, filtered.length)
  const rangeNoun =
    tab === 'won'
      ? 'won auctions'
      : tab === 'lost'
        ? 'lost bids'
        : filter === 'leading'
          ? 'leading bids'
          : filter === 'outbid'
            ? 'outbid bids'
            : 'active bids'
  const footerLabel =
    filtered.length === 0
      ? `Showing 0 ${rangeNoun}`
      : pageCount <= 1
        ? `Showing ${filtered.length} ${rangeNoun}`
        : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length} ${rangeNoun}`

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26] sm:text-[24px]">
          Bids & Auctions
        </h1>
        <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">
          Manual and automatic bidding activity
        </p>
      </div>

      <BidsStats bids={bids} />
      <EndingSoonSection />

      <section className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
        <div className="flex flex-col gap-2 border-b border-[#ebebec] px-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:overflow-visible sm:px-0">
            {(
              [
                { id: 'active', label: 'Active', count: counts.active },
                { id: 'won', label: 'Won', count: counts.won },
                { id: 'lost', label: 'Lost', count: counts.lost },
              ] as const
            ).map((t) => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'relative -mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-[14px] transition',
                    active
                      ? 'border-[#480516] font-medium text-[#480516]'
                      : 'border-transparent font-normal text-[#7a7b7c] hover:text-[#1a1e26]',
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      'inline-flex min-w-[19px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                      active ? 'bg-[#f9f5f6] text-[#480516]' : 'bg-[#f5f5f6] text-[#9d9ea2]',
                    )}
                  >
                    {t.count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex w-full items-center gap-2 pb-3 lg:w-auto lg:pb-0">
            <div className="relative min-w-0 flex-1 lg:w-[180px] lg:flex-none">
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
                className="h-[34px] w-full rounded-lg border border-[#ebebec] bg-[#f5f5f6] pl-9 pr-3 text-[12px] text-[#1a1e26] outline-none placeholder:text-[rgba(26,30,38,0.5)] focus:border-[#480516]"
              />
            </div>
            <FilterControl
              value={filter}
              onChange={(id) => {
                setFilter(id)
                setPage(1)
              }}
              disabled={tab !== 'active'}
            />
          </div>
        </div>

        {tab === 'active' ? (
          <div className="hidden border-b border-[#ebebec] bg-[#f8f8f9] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.55px] text-[#9d9ea2] lg:grid lg:grid-cols-[minmax(0,1.4fr)_220px_96px_150px] lg:gap-5">
            <span className="pl-[68px]">Lot</span>
            <span className="text-center">Bids</span>
            <span className="text-center">Status</span>
            <span className="text-center">Actions</span>
          </div>
        ) : null}

        {paged.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={query || (tab === 'active' && filter !== 'all') ? 'No matching bids' : 'Nothing here yet'}
              body={
                query || (tab === 'active' && filter !== 'all')
                  ? 'Try a different search or filter.'
                  : tab === 'won'
                    ? 'Won auctions will show here so you can settle the balance.'
                    : tab === 'lost'
                      ? 'Lost bids will show here with a shortcut to similar lots.'
                      : 'Place a bid on a live lot to see it in Active.'
              }
            />
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

        <div className="flex flex-col-reverse gap-3 border-t border-[#ebebec] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-[12px] leading-4 text-[#9d9ea2]">{footerLabel}</p>
          <div className="flex items-center justify-center gap-1 sm:justify-end">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`Page ${n}`}
                aria-current={n === pageSafe ? 'page' : undefined}
                onClick={() => setPage(n)}
                className={cn(
                  'flex size-7 items-center justify-center rounded-lg text-[12px] transition',
                  n === pageSafe ? 'bg-[#480516] text-white' : 'text-[#7a7b7c] hover:bg-[#f3f4f6]',
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
