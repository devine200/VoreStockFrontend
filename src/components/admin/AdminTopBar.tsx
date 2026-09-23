import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/shared/Icon'
import { adminIcons, adminLogo } from '@/assets/admin'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setDateRange } from '@/store/slices/adminSlice'
import { logout } from '@/store/slices/sessionSlice'
import { ADMIN_ACTIVITY } from '@/api/adminFixtures'
import type { AdminDateRange } from '@/types/admin'

const RANGES: { id: AdminDateRange; label: string; shortLabel: string }[] = [
  { id: 'today', label: 'Today', shortLabel: 'Today' },
  { id: '7d', label: 'Last 7 days', shortLabel: '7 days' },
  { id: '30d', label: 'Last 30 days', shortLabel: '30 days' },
  { id: 'all', label: 'All time', shortLabel: 'All' },
]

const NOTIF_HREF: Record<string, string> = {
  a1: '/admin/buyers',
  a2: '/admin/verification',
  a3: '/admin/settlements',
  a4: '/admin/3pl-verification',
  a5: '/admin/3pl-verification',
  a6: '/admin/withdrawals',
}

export function AdminTopBar({ onMenu }: { onMenu?: () => void }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.session.user)
  const dateRange = useAppSelector((s) => s.admin.dateRange)
  const buyers = useAppSelector((s) => s.admin.buyers)
  const orders = useAppSelector((s) => s.admin.orders)
  const transactions = useAppSelector((s) => s.admin.transactions)
  const [query, setQuery] = useState('')
  const [rangeOpen, setRangeOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [readIds, setReadIds] = useState<string[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)
  const isCompact = useMediaQuery('(max-width: 639px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const notifications = useMemo(() => ADMIN_ACTIVITY.slice(0, 5), [])
  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    const buyerHits = buyers
      .filter((b) => `${b.name} ${b.email} ${b.id}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map((b) => ({ to: `/admin/buyers/${b.id}`, label: b.name, hint: b.id }))
    const orderHits = orders
      .filter((o) => `${o.id} ${o.buyer} ${o.lot}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map((o) => ({ to: `/admin/orders/${o.id}`, label: o.id, hint: o.buyer }))
    const txnHits = transactions
      .filter((t) => `${t.id} ${t.buyer} ${t.reference}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map((t) => ({ to: `/admin/transactions/${t.id}`, label: t.id, hint: t.type }))
    return [...buyerHits, ...orderHits, ...txnHits].slice(0, 8)
  }, [query, buyers, orders, transactions])

  const initials = user?.avatarInitials || 'OA'
  const name = user?.name || 'Ops Admin'
  const rangeLabel = RANGES.find((r) => r.id === dateRange)?.label ?? 'Today'
  const rangeShortLabel = RANGES.find((r) => r.id === dateRange)?.shortLabel ?? 'Today'

  const closeMenus = () => {
    setRangeOpen(false)
    setBellOpen(false)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!rangeOpen && !bellOpen && !menuOpen) return
    const onPointer = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) closeMenus()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenus()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [rangeOpen, bellOpen, menuOpen])

  const searchField = (
    <div className="relative flex min-w-0 w-full flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-[5px] lg:h-9 lg:p-0 lg:px-3">
      <Icon src={adminIcons.search} size={15} className="shrink-0 opacity-50" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          closeMenus()
        }}
        placeholder={isCompact ? 'Search admin…' : 'Search buyer, order, or transaction'}
        className="h-full min-w-0 w-full bg-transparent text-[14px] leading-none text-slate-700 outline-none placeholder:text-slate-400 lg:text-[13.5px] lg:font-bold lg:placeholder:font-bold"
        onFocus={closeMenus}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && hits[0]) {
            navigate(hits[0].to)
            setQuery('')
          }
          if (e.key === 'Escape') setQuery('')
        }}
      />
      {hits.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-[min(320px,70vh)] overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_10px_20px_rgba(15,23,42,0.08)]">
          {hits.map((hit) => (
            <button
              key={hit.to}
              type="button"
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              onClick={() => {
                navigate(hit.to)
                setQuery('')
                closeMenus()
              }}
            >
              <span className="min-w-0 truncate text-[13px] font-medium text-slate-800">{hit.label}</span>
              <span className="shrink-0 text-[11.5px] text-slate-400">{hit.hint}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )

  const rangeControl = (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setRangeOpen((v) => !v)
          setBellOpen(false)
          setMenuOpen(false)
          setQuery('')
        }}
        className="flex h-9 items-center rounded-lg border border-slate-200 px-2.5 text-[12px] text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400 sm:px-3 sm:text-[13.5px]"
        aria-label="Date range"
      >
        <span className="hidden sm:inline">{rangeLabel}</span>
        <span className="sm:hidden">{rangeShortLabel}</span>
      </button>
      {rangeOpen ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-30 max-h-[min(280px,70vh)] w-[min(11rem,calc(100vw-1rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-[0px_10px_20px_rgba(15,23,42,0.08)]">
          {RANGES.map((range) => (
            <button
              key={range.id}
              type="button"
              className="block w-full px-3 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50"
              onClick={() => {
                dispatch(setDateRange(range.id))
                setRangeOpen(false)
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )

  const bellControl = (
    <div className="relative">
      <button
        type="button"
        className="relative flex size-9 shrink-0 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400"
        onClick={() => {
          setBellOpen((v) => !v)
          setRangeOpen(false)
          setMenuOpen(false)
          setQuery('')
        }}
        aria-label="Notifications"
        aria-expanded={bellOpen}
      >
        {unreadCount > 0 ? (
          <img src={adminIcons.bell} alt="" className="pointer-events-none size-8 max-w-none" />
        ) : (
          <Icon src={adminIcons.bellPlain} size={22} />
        )}
      </button>
      {bellOpen ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 max-h-[min(420px,75vh)] w-[min(360px,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_10px_20px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="text-[13.5px] font-semibold text-slate-800">Notifications</p>
              {unreadCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-medium leading-5 text-white">
                  {unreadCount}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              className="text-[12px] font-medium text-slate-500 hover:text-slate-800 disabled:opacity-40"
              disabled={unreadCount === 0}
              onClick={() => setReadIds(notifications.map((n) => n.id))}
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.map((item) => {
              const unread = !readIds.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 ${unread ? 'bg-slate-50/70' : ''}`}
                  onClick={() => {
                    setReadIds((ids) => (ids.includes(item.id) ? ids : [...ids, item.id]))
                    closeMenus()
                    navigate(NOTIF_HREF[item.id] ?? '/admin')
                  }}
                >
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${unread ? 'bg-red-500' : 'bg-transparent'}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium leading-normal text-slate-800">{item.activity}</span>
                    <span className="mt-0.5 block truncate text-[12px] leading-normal text-slate-500">{item.reference}</span>
                    <span className="mt-1 block text-[11.5px] leading-normal text-slate-400">{item.at}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5">
            <button
              type="button"
              className="text-[12.5px] font-medium text-[#480516] hover:underline"
              onClick={() => {
                closeMenus()
                navigate('/admin')
              }}
            >
              View all activity →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )

  const accountControl = (
    <div className="relative flex items-center border-l border-slate-200 pl-2 sm:pl-3">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400"
        onClick={() => {
          setMenuOpen((v) => !v)
          setRangeOpen(false)
          setBellOpen(false)
          setQuery('')
        }}
      >
        <span className="relative size-8 shrink-0">
          <img src={adminIcons.avatarBg} alt="" className="absolute inset-0 size-8" />
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white">
            {initials}
          </span>
        </span>
        <span className="hidden text-left xl:block">
          <span className="block text-[13.5px] font-medium leading-normal text-slate-700">{name}</span>
          <span className="block text-[11.5px] leading-normal text-slate-400">Administrator</span>
        </span>
      </button>
      {menuOpen ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-[0px_10px_20px_rgba(15,23,42,0.08)]">
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50"
            onClick={() => {
              closeMenus()
              navigate('/')
            }}
          >
            View marketplace
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-[13px] text-red-700 hover:bg-red-50"
            onClick={() => {
              closeMenus()
              dispatch(logout())
              navigate('/admin/login')
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )

  return (
    <header
      ref={wrapRef}
      className="relative z-40 max-w-full shrink-0 border-b border-slate-200 bg-white"
    >
      {isDesktop ? (
        <div className="flex h-16 items-center gap-3 px-5">
          {searchField}
          <div className="flex shrink-0 items-center gap-3">
            {rangeControl}
            {bellControl}
            {accountControl}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-3 py-2.5 sm:px-5">
          <div className="flex h-10 items-center gap-2">
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400"
              aria-label="Open navigation"
              onClick={onMenu}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="h-7 w-[41px] shrink-0 overflow-hidden">
              <img src={adminLogo} alt="VSK" className="h-7 w-[41px] object-cover" />
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              {rangeControl}
              {bellControl}
              {accountControl}
            </div>
          </div>

          {searchField}
        </div>
      )}
    </header>
  )
}
