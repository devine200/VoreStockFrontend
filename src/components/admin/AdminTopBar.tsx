import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/shared/Icon'
import { adminIcons } from '@/assets/admin'
import { AdminBadge } from '@/components/admin/ui'
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
  const wrapRef = useRef<HTMLDivElement>(null)
  const isCompact = useMediaQuery('(max-width: 639px)')

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

  return (
    <header
      ref={wrapRef}
      className="relative max-w-full shrink-0 overflow-x-hidden border-b border-slate-200 bg-white px-2 py-2 sm:px-5 sm:py-0 lg:h-16 lg:px-5"
    >
      <div className="flex flex-col gap-2 lg:h-16 lg:flex-row lg:items-center lg:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-700 lg:hidden"
            aria-label="Open navigation"
            onClick={onMenu}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="relative flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 sm:px-3">
            <Icon src={adminIcons.search} size={16} className="shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isCompact ? 'Search admin…' : 'Search buyer, order, or transaction'}
              className="h-full min-w-0 w-full bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400 sm:text-[13.5px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hits[0]) {
                  navigate(hits[0].to)
                  setQuery('')
                }
              }}
            />
            {hits.length > 0 ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_10px_20px_rgba(15,23,42,0.08)]">
                {hits.map((hit) => (
                  <button
                    key={hit.to}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-slate-50"
                    onClick={() => {
                      navigate(hit.to)
                      setQuery('')
                    }}
                  >
                    <span className="min-w-0 truncate text-[13px] font-medium text-slate-800">{hit.label}</span>
                    <span className="shrink-0 text-[11.5px] text-slate-400">{hit.hint}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2 lg:ml-auto">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setRangeOpen((v) => !v)
                setBellOpen(false)
                setMenuOpen(false)
              }}
              className="rounded-lg border border-slate-200 px-2.5 py-2 text-[11px] text-slate-600 sm:px-3 sm:text-[13.5px]"
              aria-label="Date range"
            >
              <span className="hidden sm:inline">{rangeLabel}</span>
              <span className="sm:hidden">{rangeShortLabel}</span>
            </button>
            {rangeOpen ? (
              <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-[0px_10px_20px_rgba(15,23,42,0.08)]">
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

          <div className="relative">
            <button
              type="button"
              className="relative flex size-9 items-center justify-center"
              onClick={() => {
                setBellOpen((v) => !v)
                setRangeOpen(false)
                setMenuOpen(false)
              }}
              aria-label="Notifications"
            >
              <Icon src={adminIcons.bell} size={22} />
              <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500" />
            </button>
            {bellOpen ? (
              <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[min(360px,calc(100vw-1rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_10px_20px_rgba(15,23,42,0.08)]">
                <p className="border-b border-slate-100 px-4 py-3 text-[13.5px] font-semibold text-slate-800">
                  Notifications
                </p>
                {ADMIN_ACTIVITY.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-slate-800">{item.activity}</p>
                      <p className="mt-0.5 truncate text-[11.5px] text-slate-500">{item.reference}</p>
                    </div>
                    <AdminBadge status={item.status} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative flex items-center gap-1.5 border-l border-slate-200 pl-2 sm:pl-3">
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={() => {
                setMenuOpen((v) => !v)
                setRangeOpen(false)
                setBellOpen(false)
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
                    navigate('/login')
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
