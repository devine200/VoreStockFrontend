import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '@/api/fixtures'
import { Icon } from '@/components/shared/Icon'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/PageChrome'
import { Modal } from '@/components/shared/Modal'
import { Checkbox, Field, Input, Select } from '@/components/shared/Field'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addSavedSearch,
  markSearchViewed,
  removeSavedSearch,
  toggleSearchAlerts,
  toggleWatch,
  updateSavedSearch,
  clearWatchlist,
  type SavedSearch,
  type SearchFrequency,
} from '@/store/slices/watchlistSlice'
import { showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn, formatMoney } from '@/utils/format'
import { useCountdown } from '@/hooks/useCountdown'
import type { Lot } from '@/types'
import searchWhiteIcon from '@/assets/icons/watchlist-search-white.svg'
import searchFilterIcon from '@/assets/icons/watchlist-search.svg'
import sortIcon from '@/assets/icons/watchlist-sort.svg'
import chevronIcon from '@/assets/icons/watchlist-chevron.svg'
import shieldIcon from '@/assets/icons/watchlist-shield.svg'
import starIcon from '@/assets/icons/watchlist-star.svg'
import editIcon from '@/assets/icons/watchlist-edit.svg'
import trashIcon from '@/assets/icons/watchlist-trash.svg'
import resultsIcon from '@/assets/icons/watchlist-results.svg'
import clockIcon from '@/assets/icons/watchlist-clock.svg'
import bellOnIcon from '@/assets/icons/watchlist-bell.svg'
import bellOffIcon from '@/assets/icons/watchlist-bell-off.svg'
import viewSearchIcon from '@/assets/icons/watchlist-view-search.svg'

type WatchSort = 'ending' | 'price-asc' | 'price-desc' | 'name'
type SearchSort = 'recent' | 'new' | 'name'

const WATCH_SORTS: { id: WatchSort; label: string }[] = [
  { id: 'ending', label: 'Ending Soon' },
  { id: 'price-asc', label: 'Price: Low–High' },
  { id: 'price-desc', label: 'Price: High–Low' },
  { id: 'name', label: 'Name' },
]

const SEARCH_SORTS: { id: SearchSort; label: string }[] = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'new', label: 'Most New' },
  { id: 'name', label: 'Name' },
]

const FREQUENCIES: SearchFrequency[] = ['Hourly', 'Daily', 'Weekly']

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
  return Math.max(120, Math.round(lot.currentBid * 0.2756))
}

function relativeUpdated(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms) || ms < 0) return 'Updated just now'
  const minutes = Math.floor(ms / 60000)
  if (minutes < 1) return 'Updated just now'
  if (minutes < 60) return `Updated ${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `Updated ${days} day${days === 1 ? '' : 's'} ago`
}

function categoryPath(search: SavedSearch) {
  const name = search.category.toLowerCase()
  const match = CATEGORIES.find((c) => c.name.toLowerCase() === name)
  if (match) return match.slug
  if (name.includes('edible') || name.includes('cbd')) return 'edibles'
  if (name.includes('flower')) return 'flower'
  if (name.includes('concentrate') || name.includes('equipment') || name.includes('heavy')) {
    return 'concentrates'
  }
  if (name.includes('promotion') || name.includes('truck') || name.includes('vehicle')) {
    return 'promotions'
  }
  return 'all'
}

function searchHref(search: SavedSearch) {
  const q = encodeURIComponent(search.query.replace(/^"|"$/g, ''))
  return `/categories/${categoryPath(search)}?q=${q}`
}

function SortControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { id: T; label: string }[]
  onChange: (id: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.id === value)?.label ?? ''

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
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-[34px] items-center gap-2 rounded-xl border border-[#ebebec] bg-white px-3 text-[12px] text-[#46494f] sm:px-3.5"
      >
        <Icon src={sortIcon} size={13} />
        <span className="max-w-[118px] truncate sm:max-w-none">
          <span className="hidden sm:inline">Sort: </span>
          {current}
        </span>
        <Icon src={chevronIcon} size={11} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 z-20 mt-1 min-w-full overflow-hidden rounded-xl border border-[#ebebec] bg-white py-1 shadow-[0px_8px_24px_rgba(26,30,38,0.12)] sm:left-auto sm:right-0 sm:min-w-[200px]">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id)
                setOpen(false)
              }}
              className={cn(
                'block w-full px-3.5 py-2 text-left text-[12px] transition hover:bg-[#f9f5f6]',
                opt.id === value ? 'font-medium text-[#480516]' : 'text-[#46494f]',
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

function FilterField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative h-[34px] min-w-0 flex-1 sm:w-[194.5px] sm:flex-none sm:shrink-0">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <Icon src={searchFilterIcon} size={13} />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter by name…"
        className="h-full w-full rounded-xl border border-[#ebebec] bg-white py-2 pl-9 pr-4 text-[12px] text-[#1a1e26] outline-none placeholder:text-[rgba(26,30,38,0.5)] focus:border-[#480516]"
      />
    </div>
  )
}

function WatchRow({ lot, rowRef }: { lot: Lot; rowRef?: (el: HTMLDivElement | null) => void }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const tick = useCountdown(lot.endsAt)
  const { label, urgent } = shortCountdown(lot.endsAt)
  void tick
  const shipping = shippingEstimate(lot)
  const landed = lot.currentBid + shipping

  const timeBadge = (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold leading-4',
        urgent ? 'gap-1.5 bg-[#fff1f1] text-[#e03030]' : 'bg-[#f3f3f4] text-[#7a7b7c]',
      )}
    >
      {urgent ? <span className="size-1.5 rounded-full bg-[#e03030] opacity-70" /> : null}
      {label}
    </span>
  )

  return (
    <div
      ref={rowRef}
      id={`watch-${lot.id}`}
      className="flex flex-col gap-3 border-b border-[#ebebec] px-4 py-4 last:border-b-0 sm:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_240px_96px_96px] lg:items-center lg:gap-4"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          to={`/lots/${lot.slug}`}
          className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ebebec] bg-[#f5f5f6] sm:size-16"
        >
          <img src={lot.image} alt="" className="size-10 object-contain sm:size-12" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={`/lots/${lot.slug}`}
            className="block truncate text-[14px] font-medium leading-[19.25px] text-[#1a1e26] hover:text-[#480516]"
          >
            {lot.title}
          </Link>
          <div className="mt-1 flex min-w-0 items-center gap-2 text-[11px] leading-[16.5px] text-[#9d9ea2]">
            <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] leading-[15px] text-[#9d9ea2] bg-[#f5f5f6]">
              {lotCode(lot)}
            </span>
            <span className="truncate">
              {lot.category}
              <span className="mx-1.5 text-[#ebebec]">·</span>
              {lot.bidCount} bids
            </span>
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1 text-[10px] leading-[15px] text-[#7a7b7c]">
            <Icon src={shieldIcon} size={11} />
            <span className="truncate">{lot.condition.split('|')[0].trim()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 overflow-hidden rounded-xl bg-[#f8f8f9] lg:flex lg:w-auto lg:justify-end lg:gap-6 lg:bg-transparent">
        <div className="px-2.5 py-2.5 text-center lg:w-[76px] lg:shrink-0 lg:px-0 lg:py-0 lg:text-right">
          <p className="text-[10px] uppercase leading-[15px] tracking-[0.4px] text-[#9d9ea2]">Current Bid</p>
          <p className="pt-0.5 text-[15px] font-semibold leading-6 tabular-nums text-[#1a1e26] sm:text-[16px]">
            {formatMoney(lot.currentBid)}
          </p>
        </div>
        <div className="border-x border-[#ebebec] px-2.5 py-2.5 text-center lg:w-[86px] lg:shrink-0 lg:border-0 lg:px-0 lg:py-0 lg:text-right">
          <p className="text-[10px] uppercase leading-[15px] tracking-[0.4px] text-[#9d9ea2]">Landed</p>
          <p className="pt-0.5 text-[15px] font-semibold leading-6 tabular-nums text-[#46494f] sm:text-[16px]">
            {formatMoney(landed)}
          </p>
          <p className="hidden text-[10px] leading-[15px] text-[#7a7b7c] lg:block">+{formatMoney(shipping)} shipping</p>
        </div>
        <div className="flex flex-col items-center justify-center px-2 py-2.5 lg:hidden">
          <p className="text-[10px] uppercase leading-[15px] tracking-[0.4px] text-[#9d9ea2]">Closes</p>
          <div className="pt-1">{timeBadge}</div>
        </div>
      </div>

      <div className="hidden lg:flex lg:justify-end">{timeBadge}</div>

      <div className="flex items-center gap-2 lg:justify-end">
        <button
          type="button"
          onClick={() => navigate(`/lots/${lot.slug}`)}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#480516] px-4 text-[14px] font-medium leading-5 text-white hover:bg-[#5a0a1c] md:flex-none md:px-5 lg:h-auto lg:py-2"
        >
          Bid
        </button>
        <button
          type="button"
          aria-label="Remove from watchlist"
          onClick={() => {
            dispatch(toggleWatch(lot.id))
            dispatch(showToast('Removed from watchlist'))
          }}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#ebebec] hover:bg-[#fff8e6] lg:size-9 lg:border-0"
        >
          <Icon src={starIcon} size={18} />
        </button>
      </div>
    </div>
  )
}

function SavedSearchCard({
  search,
  onEdit,
}: {
  search: SavedSearch
  onEdit: (search: SavedSearch) => void
}) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const hasNew = (search.newResults ?? 0) > 0
  const filters = search.filters?.length ? search.filters : [`Category: ${search.category}`]
  const results = search.results ?? 0
  const frequency = search.frequency ?? 'Daily'
  const alertsOn = search.emailAlerts

  const viewResults = () => {
    dispatch(markSearchViewed(search.id))
    navigate(searchHref(search))
  }

  return (
    <article
      className={cn(
        'flex min-w-0 flex-col gap-4 rounded-2xl border bg-white p-4 sm:p-5',
        hasNew ? 'border-[#dacdd0]' : 'border-[#ebebec]',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">{search.name}</h3>
            {hasNew ? (
              <span className="rounded-full bg-[#f9f5f6] px-2 py-0.5 text-[10px] font-bold leading-[15px] text-[#480516]">
                {search.newResults} new
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-[12px] leading-4 text-[#9d9ea2]">{`"${search.query}"`}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Edit saved search"
            onClick={() => onEdit(search)}
            className="flex size-7 items-center justify-center rounded-lg hover:bg-[#f5f5f6]"
          >
            <Icon src={editIcon} size={13} />
          </button>
          <button
            type="button"
            aria-label="Delete saved search"
            onClick={() => {
              dispatch(removeSavedSearch(search.id))
              dispatch(showToast('Saved search removed'))
            }}
            className="flex size-7 items-center justify-center rounded-lg hover:bg-[#fff1f1]"
          >
            <Icon src={trashIcon} size={13} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-[#ebebec] bg-[#f5f5f6] px-2.5 py-1 text-[11px] leading-[16.5px] text-[#46494f]"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-[#ebebec] pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <p className="inline-flex items-center gap-1.5 text-[12px] leading-4">
            <Icon src={resultsIcon} width={11} height={13} />
            <span>
              <span className="font-bold text-[#1a1e26]">{results}</span>
              <span className="text-[#7a7b7c]"> results</span>
              {hasNew ? <span className="text-[#480516]">{` · ${search.newResults} new`}</span> : null}
            </span>
          </p>
          <p className="inline-flex items-center gap-1.5 text-[12px] leading-4 text-[#7a7b7c]">
            <Icon src={clockIcon} width={11} height={13} />
            {relativeUpdated(search.updatedAt ?? search.createdAt)}
          </p>
          <span className="rounded-full border border-[#ebebec] bg-[#f5f5f6] px-2 py-0.5 text-[10px] font-medium leading-[15px] text-[#9d9ea2]">
            {frequency}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0">
          <button
            type="button"
            onClick={() => {
              dispatch(toggleSearchAlerts(search.id))
              dispatch(showToast(alertsOn ? 'Email alerts turned off' : 'Email alerts turned on'))
            }}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium leading-4 sm:py-1.5',
              alertsOn
                ? 'border-[#dacdd0] bg-[#f9f5f6] text-[#480516]'
                : 'border-[#ebebec] bg-[#f5f5f6] text-[#7a7b7c]',
            )}
          >
            <Icon
              src={alertsOn ? bellOnIcon : bellOffIcon}
              width={alertsOn ? 10 : 12}
              height={12}
            />
            {alertsOn ? 'Alerts on' : 'Alerts off'}
          </button>
          <button
            type="button"
            onClick={viewResults}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#480516] px-3 py-2 text-[12px] font-medium leading-4 text-white hover:bg-[#5a0a1c] sm:py-1.5"
          >
            <Icon src={viewSearchIcon} width={9} height={11} />
            View results
          </button>
        </div>
      </div>
    </article>
  )
}

type SearchForm = {
  name: string
  query: string
  category: string
  filters: string
  frequency: SearchFrequency
  emailAlerts: boolean
}

const EMPTY_FORM: SearchForm = {
  name: '',
  query: '',
  category: CATEGORIES[0].name,
  filters: '',
  frequency: 'Daily',
  emailAlerts: true,
}

function formFromSearch(search: SavedSearch): SearchForm {
  return {
    name: search.name,
    query: search.query,
    category: search.category,
    filters: (search.filters ?? []).join(', '),
    frequency: search.frequency ?? 'Daily',
    emailAlerts: search.emailAlerts,
  }
}

export function WatchlistPage() {
  const dispatch = useAppDispatch()
  const ids = useAppSelector((s) => s.watchlist.ids)
  const searches = useAppSelector((s) => s.watchlist.searches ?? [])
  const allLots = useAppSelector((s) => s.auctions.lots)
  const [tab, setTab] = useState<'watchlist' | 'searches'>('watchlist')
  const [query, setQuery] = useState('')
  const [watchSort, setWatchSort] = useState<WatchSort>('ending')
  const [searchSort, setSearchSort] = useState<SearchSort>('recent')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SearchForm>(EMPTY_FORM)
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
      if (watchSort === 'ending') return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
      if (watchSort === 'price-asc') return a.currentBid - b.currentBid
      if (watchSort === 'price-desc') return b.currentBid - a.currentBid
      return a.title.localeCompare(b.title)
    })
    return list
  }, [allLots, ids, query, watchSort])

  const filteredSearches = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = q
      ? searches.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.query.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q),
        )
      : [...searches]

    list = [...list].sort((a, b) => {
      if (searchSort === 'new') return (b.newResults ?? 0) - (a.newResults ?? 0)
      if (searchSort === 'name') return a.name.localeCompare(b.name)
      return new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime()
    })
    return list
  }, [searches, query, searchSort])

  const urgentLots = useMemo(
    () => allLots.filter((l) => ids.includes(l.id) && shortCountdown(l.endsAt).urgent),
    [allLots, ids],
  )

  const newResultsTotal = searches.reduce((sum, s) => sum + (s.newResults ?? 0), 0)
  const alertsCount = searches.filter((s) => s.emailAlerts).length

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setTab('searches')
    setFormOpen(true)
  }

  const openEdit = (search: SavedSearch) => {
    setEditingId(search.id)
    setForm(formFromSearch(search))
    setFormOpen(true)
  }

  const saveForm = () => {
    if (!form.name.trim() || !form.query.trim()) return
    const filters = form.filters
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
    const payload = {
      name: form.name.trim(),
      query: form.query.trim(),
      category: form.category,
      filters,
      frequency: form.frequency,
      emailAlerts: form.emailAlerts,
    }
    if (editingId) {
      dispatch(updateSavedSearch({ id: editingId, ...payload }))
      dispatch(showToast('Saved search updated'))
    } else {
      dispatch(addSavedSearch(payload))
      dispatch(
        showSuccess({
          title: 'Saved Search Created',
          body: 'We’ll notify you when new lots match this search.',
          actionLabel: 'Done',
        }),
      )
    }
    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const scrollToUrgent = () => {
    setTab('watchlist')
    const first = urgentLots[0]
    if (!first) return
    requestAnimationFrame(() => {
      urgentRowRefs.current[first.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const stats = [
    {
      id: 'watched',
      label: 'Watched Lots',
      value: String(ids.length),
      foot: 'across all categories',
      valueClass: 'text-[#1a1e26]',
      onClick: () => setTab('watchlist'),
    },
    {
      id: 'urgent',
      label: 'Closing Urgently',
      value: String(urgentLots.length),
      foot: 'within the next hour',
      valueClass: 'text-[#e03030]',
      onClick: scrollToUrgent,
    },
    {
      id: 'searches',
      label: 'Saved Searches',
      value: String(searches.length),
      foot: alertsCount > 0 ? 'with email alerts' : 'no email alerts',
      valueClass: 'text-[#1a1e26]',
      onClick: () => setTab('searches'),
    },
    {
      id: 'new',
      label: 'New Results',
      value: String(newResultsTotal),
      foot: 'across all searches',
      valueClass: 'text-[#480516]',
      onClick: () => setTab('searches'),
    },
  ]

  return (
    <div className="animate-fade-in flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26] sm:text-[24px]">
            Watchlist & Searches
          </h1>
          <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">
            Track lots you're interested in and monitor your saved searches
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#480516] px-5 text-[14px] font-medium leading-5 text-white hover:bg-[#5a0a1c]"
        >
          <Icon src={searchWhiteIcon} size={14} />
          New Saved Search
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={card.onClick}
            className="flex min-w-0 flex-col items-start gap-1.5 rounded-2xl border border-[#ebebec] bg-white px-3 py-3.5 text-left transition hover:border-[#dacdd0] sm:gap-2 sm:px-6 sm:py-5"
          >
            <p className="text-[10px] font-medium uppercase leading-[15px] tracking-[0.6px] text-[#9d9ea2] sm:text-[11px] sm:leading-[16.5px] sm:tracking-[1.1px]">
              {card.label}
            </p>
            <p className={cn('text-[24px] font-semibold leading-none tracking-[-1px] tabular-nums sm:text-[30px] sm:leading-[30px]', card.valueClass)}>
              {card.value}
            </p>
            <p className="text-[12px] leading-4 text-[#9d9ea2]">{card.foot}</p>
          </button>
        ))}
      </div>

      {urgentLots.length > 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#fca5a5] bg-[#fff1f1] px-4 py-3 sm:gap-4 sm:px-5 sm:py-3.5">
          <span className="size-2 shrink-0 rounded-full bg-[#e03030] opacity-50" />
          <p className="min-w-0 flex-1 text-[13px] font-medium leading-5 text-[#e03030] sm:text-[14px]">
            {urgentLots.length} watched lot{urgentLots.length === 1 ? '' : 's'}{' '}
            {urgentLots.length === 1 ? 'is' : 'are'} closing within the hour — act now
          </p>
          <button
            type="button"
            onClick={scrollToUrgent}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#e03030] px-3 py-1.5 text-[12px] font-semibold leading-4 text-white hover:opacity-90 sm:px-4"
          >
            View now
          </button>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
        <div className="flex flex-col gap-2 border-b border-[#ebebec] px-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:overflow-visible sm:px-0">
            {(
              [
                { id: 'watchlist' as const, label: 'Watchlist', count: ids.length },
                { id: 'searches' as const, label: 'Saved Searches', count: searches.length },
              ]
            ).map((t) => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-[14px] leading-5 sm:px-4 sm:py-4',
                    active
                      ? 'font-medium text-[#480516]'
                      : 'font-normal text-[#7a7b7c] hover:text-[#1a1e26]',
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-[14px]',
                      active ? 'bg-[#f9f5f6] text-[#480516]' : 'bg-[#f5f5f6] text-[#9d9ea2]',
                    )}
                  >
                    {t.count}
                  </span>
                  {active ? (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#480516]" />
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="flex w-full items-center gap-2 pb-3 lg:w-auto lg:py-2 lg:pb-2">
            <FilterField value={query} onChange={setQuery} />
            {tab === 'watchlist' ? (
              <SortControl value={watchSort} options={WATCH_SORTS} onChange={setWatchSort} />
            ) : (
              <SortControl value={searchSort} options={SEARCH_SORTS} onChange={setSearchSort} />
            )}
          </div>
        </div>

        {tab === 'watchlist' ? (
          <>
            <div className="hidden bg-[#f8f8f9] px-5 py-2.5 text-[11px] font-medium uppercase leading-[16.5px] tracking-[0.55px] text-[#9d9ea2] lg:grid lg:grid-cols-[minmax(0,1fr)_240px_96px_96px]">
              <span>Lot</span>
              <span>Pricing</span>
              <span className="text-right">Closes</span>
              <span className="text-center">ACTIONS</span>
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

            <div className="flex items-center justify-between gap-3 border-t border-[#ebebec] px-4 py-3.5 sm:px-5">
              <p className="text-[12px] leading-4 text-[#9d9ea2]">
                {ids.length} lot{ids.length === 1 ? '' : 's'} watched
              </p>
              {ids.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearWatchlist())
                    dispatch(showToast('Watchlist cleared'))
                  }}
                  className="text-[12px] leading-4 text-[#e03030] hover:underline"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            {filteredSearches.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No saved searches"
                  body="Create a saved search to get alerts when matching lots go live."
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-4 sm:p-5">
                {filteredSearches.map((s) => (
                  <SavedSearchCard key={s.id} search={s} onEdit={openEdit} />
                ))}
              </div>
            )}
            <div className="border-t border-[#ebebec] px-4 py-3.5 text-[12px] leading-4 text-[#9d9ea2] sm:px-5">
              {searches.length} saved search{searches.length === 1 ? '' : 'es'}
            </div>
          </>
        )}
      </section>

      {formOpen ? (
        <Modal
          title={editingId ? 'Edit Saved Search' : 'New Saved Search'}
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveForm} disabled={!form.name.trim() || !form.query.trim()}>
                {editingId ? 'Save changes' : 'Save search'}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-left">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Heavy Equipment — CAT"
              />
            </Field>
            <Field label="Keywords">
              <Input
                value={form.query}
                onChange={(e) => setForm((f) => ({ ...f, query: e.target.value }))}
                placeholder="caterpillar excavator bulldozer"
              />
            </Field>
            <Field label="Category">
              <Select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Filters" hint="Comma-separated chips shown on the card">
              <Input
                value={form.filters}
                onChange={(e) => setForm((f) => ({ ...f, filters: e.target.value }))}
                placeholder="Condition: Used, Price: $20k–$150k"
              />
            </Field>
            <Field label="Alert frequency">
              <Select
                value={form.frequency}
                onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as SearchFrequency }))}
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </Select>
            </Field>
            <Checkbox
              checked={form.emailAlerts}
              onChange={(checked) => setForm((f) => ({ ...f, emailAlerts: checked }))}
            >
              <span className="text-sm text-[#46494f]">Email alerts</span>
            </Checkbox>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
