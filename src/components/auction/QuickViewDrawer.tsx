import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import type { Lot } from '@/types'
import { getLot, canonicalLotId } from '@/api/fixtures'
import { Icon } from '@/components/shared/Icon'
import { icons } from '@/assets'
import heartIcon from '@/assets/icons/heart.svg'
import arrowDown from '@/assets/icons/arrow-down.svg'
import { useCountdown } from '@/hooks/useCountdown'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeQuickView, showSuccess, showToast } from '@/store/slices/uiSlice'
import { placeBid } from '@/store/slices/bidsSlice'
import { updateLotBid } from '@/store/slices/auctionsSlice'
import { toggleWatch } from '@/store/slices/watchlistSlice'
import { cn, formatMoney } from '@/utils/format'

function lotCode(lot: Lot) {
  const n = lot.id.replace(/\D/g, '').padStart(4, '0')
  return `LOT #${lot.categorySlug.slice(0, 3).toUpperCase()}-2024-${n}`
}

function glanceItems(lot: Lot) {
  return [
    lot.subtitle || lot.description,
    lot.brand ? `Brand: ${lot.brand}` : null,
    `Category: ${lot.category}`,
    `Condition: ${lot.condition}`,
    `${lot.units} units in this lot`,
    lot.dockVerified ? 'Third-party dock verification complete' : 'Seller-listed inventory — verify before bid',
    'Minimum shelf / service life remaining subject to manifest',
  ].filter(Boolean) as string[]
}

function retailPicks(lot: Lot) {
  const base = Math.round(lot.msrp / Math.max(lot.units, 1))
  return [
    {
      title: `${lot.brand ?? 'Primary SKU'} — lead retail item`,
      detail: lot.subtitle,
      note: 'Highest MSRP item in lot',
      price: Math.round(base * 1.15),
    },
    {
      title: `${lot.category} mid-tier assortment`,
      detail: 'Strong repeat buyer category.',
      note: 'Volume mover',
      price: Math.round(base * 0.95),
    },
    {
      title: `${lot.tags[0] ?? 'Assorted'} pack`,
      detail: 'Popular with wholesale and retail channels.',
      note: 'Steady demand',
      price: Math.round(base * 0.8),
    },
  ]
}

function bulkChips(lot: Lot) {
  const perSku = Math.max(1, Math.round(lot.units / 3))
  return [
    { label: lot.brand ?? lot.category, qty: perSku },
    { label: lot.tags[0] ?? 'Assorted', qty: perSku },
    { label: lot.tags[1] ?? lot.condition.split('|')[0].trim(), qty: perSku },
    { label: lot.category, qty: lot.units },
    { label: lot.condition.includes('New') ? 'New / Sealed' : 'Mixed condition', qty: lot.units },
  ]
}

function formatEndDate(endsAt: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(endsAt))
}

const DRAWER_TRANSITION_MS = 320

export function QuickViewDrawer() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const lotId = useAppSelector((s) => s.ui.quickViewLotId)
  const lots = useAppSelector((s) => s.auctions.lots)
  const user = useAppSelector((s) => s.session.user)

  const resolvedLot = useMemo(() => {
    if (!lotId) return undefined
    const baseId = canonicalLotId(lotId)
    return (
      lots.find((l) => l.id === lotId || l.slug === lotId || l.id === baseId || l.slug === baseId) ??
      getLot(lotId) ??
      getLot(baseId)
    )
  }, [lotId, lots])

  const [mounted, setMounted] = useState(false)
  const [entered, setEntered] = useState(false)
  const [lot, setLot] = useState<Lot | undefined>()
  const [costOpen, setCostOpen] = useState(true)
  const [bidAmount, setBidAmount] = useState('')

  const watched = useAppSelector((s) => (lot ? s.watchlist.ids.includes(lot.id) : false))
  const countdown = useCountdown(lot?.endsAt ?? new Date().toISOString())

  useEffect(() => {
    if (resolvedLot) setLot(resolvedLot)
  }, [resolvedLot])

  useEffect(() => {
    if (!lotId) {
      setEntered(false)
      const t = window.setTimeout(() => {
        setMounted(false)
        setLot(undefined)
        document.body.style.overflow = ''
      }, DRAWER_TRANSITION_MS)
      return () => window.clearTimeout(t)
    }

    if (!resolvedLot) return

    setMounted(true)
    setEntered(false)
    document.body.style.overflow = 'hidden'
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setEntered(true))
    })
    return () => window.cancelAnimationFrame(id)
  }, [lotId, resolvedLot?.id])

  useEffect(() => {
    if (resolvedLot) {
      const step = Math.max(100, Math.round(resolvedLot.currentBid * 0.02))
      setBidAmount(String(resolvedLot.currentBid + step))
      setCostOpen(true)
    }
  }, [resolvedLot?.id])

  const costs = useMemo(() => {
    if (!lot) return null
    const premium = Math.round(lot.currentBid * (lot.buyerPremiumPct / 100))
    const freight = Math.round(lot.currentBid * 0.043)
    const processing = Math.round(lot.currentBid * 0.0129)
    const total = lot.currentBid + premium + freight + processing
    return { premium, freight, processing, total }
  }, [lot])

  if (!mounted || !lot || !costs) return null

  const perUnit = lot.units > 0 ? lot.currentBid / lot.units : 0
  const msrpPct = lot.msrp > 0 ? ((lot.currentBid / lot.msrp) * 100).toFixed(1) : '—'
  const msrpPerUnit = lot.units > 0 ? lot.msrp / lot.units : 0

  const close = () => dispatch(closeQuickView())

  const onBid = (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      close()
      navigate('/login', { state: { from: `/lots/${lot.slug}` } })
      return
    }
    const value = Number(bidAmount)
    if (!value || value <= lot.currentBid) {
      dispatch(showToast('Bid must be higher than current bid'))
      return
    }
    dispatch(placeBid({ lotId: lot.id, amount: value }))
    dispatch(updateLotBid({ lotId: lot.id, amount: value }))
    close()
    dispatch(
      showSuccess({
        title: 'Bid placed',
        body: 'Your bid is live. We’ll notify you if you’re outbid.',
        actionLabel: 'View Bids',
        actionTo: '/bids',
      }),
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Manifest summary">
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-[#1a1e26]/50 transition-opacity duration-300 ease-out',
          entered ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="Close quick view"
        onClick={close}
      />

      <aside
        className={cn(
          'absolute flex w-full flex-col bg-white will-change-transform',
          'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'inset-x-0 bottom-0 max-h-[min(92dvh,920px)] rounded-t-2xl shadow-[0_-12px_40px_rgba(26,30,38,0.2)]',
          entered ? 'translate-y-0' : 'translate-y-full',
          'md:inset-y-0 md:right-0 md:left-auto md:top-0 md:max-h-none md:max-w-[460px] md:rounded-none md:shadow-[-8px_0_32px_rgba(26,30,38,0.18)] md:transition-[transform,opacity] md:ease-out',
          entered ? 'md:translate-x-0 md:translate-y-0' : 'md:translate-x-full md:translate-y-0',
        )}
      >
        <div className="flex shrink-0 justify-center pt-2.5 md:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-[#d7d7d9]" />
        </div>
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#ebebec] px-4 pb-5 pt-3 sm:px-6 md:pt-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-1.5">
              <h2 className="text-[14px] font-semibold leading-[30px] text-[#1a1e26]">Manifest Summary</h2>
              <span className="text-[12px] text-[#9d9ea2]">·</span>
              <p className="text-[12px] leading-[15px] text-[#7a7b7c]">
                Built from this lot&apos;s manifest — verify before bid
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#7a7b7c] transition hover:bg-[#f5f5f6] hover:text-[#1a1e26]"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="mt-2 flex-1 overflow-y-auto px-4 pb-8 pt-6 sm:px-6 md:pt-8">
          <div className="flex flex-wrap items-center gap-2 text-[12px] leading-[17px] text-[#7a7b7c]">
            <span className="inline-flex h-[23px] items-center rounded bg-[#f9f5f6] px-2.5 text-[10px] font-semibold uppercase tracking-wide text-[#05422c]">
              Auction
            </span>
            <span>·</span>
            <span className="font-medium text-[#46494f]">{lotCode(lot)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Icon src={icons.location} size={12} />
              {lot.location}
            </span>
          </div>
          <p className="mt-3 text-[12px] leading-[17px] text-[#7a7b7c]">{lot.brand ?? 'VSK Seller'}</p>
          <h3 className="mt-2 text-[20px] font-semibold leading-[28px] tracking-tight text-[#1a1e26]">
            {lot.title}
          </h3>
          <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[12px] leading-[18px] text-[#7a7b7c]">
            <span>2 pallets</span>
            <span>·</span>
            <span>{lot.units} units</span>
            <span>·</span>
            <span>{formatMoney(lot.msrp)} MSRP</span>
            <span>·</span>
            <span>{formatMoney(msrpPerUnit)}/unit</span>
          </p>

          <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-[#ebebec]">
            {[
              { label: 'Current Bid', value: formatMoney(lot.currentBid) },
              { label: '% of MSRP', value: `${msrpPct}%` },
              { label: 'Per Unit', value: formatMoney(perUnit) },
            ].map((cell) => (
              <div key={cell.label} className="border-r border-[#ebebec] px-4 py-3.5 last:border-r-0">
                <p className="text-[11px] leading-[15px] text-[#7a7b7c]">{cell.label}</p>
                <p className="mt-0.5 text-[16px] font-semibold leading-[23px] text-[#1a1e26]">{cell.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-[#ebebec] px-4 py-3">
            <p className="flex flex-wrap items-center gap-1.5 text-[12px] leading-[18px] text-[#46494f]">
              <span aria-hidden>⏱</span>
              <span className="font-medium">{countdown.expired ? 'Ended' : `${countdown.label} left`}</span>
              <span className="text-[#9d9ea2]">·</span>
              <span className="text-[#7a7b7c]">Ends {formatEndDate(lot.endsAt)}</span>
            </p>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold',
                lot.status === 'live' && !countdown.expired
                  ? 'bg-[#e6f4ed] text-[#0a6e38]'
                  : 'bg-[#f5f5f6] text-[#7a7b7c]',
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  lot.status === 'live' && !countdown.expired ? 'bg-[#16a34a]' : 'bg-[#9d9ea2]',
                )}
              />
              {countdown.expired ? 'Ended' : 'Live'}
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#ebebec]">
            <button
              type="button"
              onClick={() => setCostOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-4 text-left"
            >
              <span className="text-[14px] font-medium leading-5 text-[#1a1e26]">Total Landed Cost</span>
              <span className="flex items-center gap-2">
                <span className="text-[18px] font-semibold leading-[27px] text-[#1a1e26]">
                  {formatMoney(costs.total)}
                </span>
                <Icon
                  src={arrowDown}
                  size={14}
                  className={cn('transition-transform', costOpen && 'rotate-180')}
                />
              </span>
            </button>
            {costOpen ? (
              <div className="space-y-2 border-t border-[#ebebec] px-4 py-3.5 text-[12px] leading-[18px]">
                <div className="flex justify-between text-[#7a7b7c]">
                  <span>Current bid</span>
                  <span>{formatMoney(lot.currentBid)}</span>
                </div>
                <div className="flex justify-between text-[#7a7b7c]">
                  <span>Buyer&apos;s premium ({lot.buyerPremiumPct}%)</span>
                  <span>{formatMoney(costs.premium)}</span>
                </div>
                <div className="flex justify-between text-[#7a7b7c]">
                  <span>Estimated freight</span>
                  <span>{formatMoney(costs.freight)}</span>
                </div>
                <div className="flex justify-between text-[#7a7b7c]">
                  <span>Processing fee</span>
                  <span>{formatMoney(costs.processing)}</span>
                </div>
                <div className="flex justify-between border-t border-[#ebebec] pt-2 text-[13px] font-semibold text-[#1a1e26]">
                  <span>Total</span>
                  <span>{formatMoney(costs.total)}</span>
                </div>
              </div>
            ) : null}
          </div>

          <section className="mt-8">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9d9ea2]">At a Glance</h4>
            <ul className="mt-3 space-y-2.5">
              {glanceItems(lot).map((item) => (
                <li key={item} className="flex gap-2.5 text-[13px] leading-[20px] text-[#46494f]">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-[#480516]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9d9ea2]">
              Top Retail Picks
            </h4>
            <div className="mt-3 divide-y divide-[#ebebec] rounded-xl border border-[#ebebec]">
              {retailPicks(lot).map((pick) => (
                <div key={pick.title} className="flex gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-[18px] text-[#1a1e26]">{pick.title}</p>
                    <p className="mt-1 text-[12px] leading-[18px] text-[#7a7b7c]">{pick.detail}</p>
                    <p className="mt-1 text-[11px] leading-[15px] text-[#9d9ea2]">{pick.note}</p>
                  </div>
                  <p className="shrink-0 text-[13px] font-semibold text-[#1a1e26]">{formatMoney(pick.price)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9d9ea2]">
              Bulk Inventory
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {bulkChips(lot).map((chip) => (
                <span
                  key={`${chip.label}-${chip.qty}`}
                  className="inline-flex h-[31px] items-center gap-1.5 rounded-lg bg-[#f5f5f6] px-2.5 text-[12px] leading-[17px] text-[#46494f]"
                >
                  {chip.label}
                  <span className="text-[#9d9ea2]">×{chip.qty}</span>
                </span>
              ))}
            </div>
          </section>

          <form id="quickview-bid" onSubmit={onBid} className="mt-8">
            <label className="relative block">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#7a7b7c]">
                US$
              </span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter new max bid"
                className="h-[47px] w-full rounded-xl border border-[#ebebec] bg-white pl-14 pr-4 text-[14px] text-[#1a1e26] outline-none transition placeholder:text-[#9d9ea2] focus:border-[#480516] focus:ring-2 focus:ring-[#480516]/10"
              />
            </label>
            <p className="mt-3 text-[12px] leading-[21px] text-[#7a7b7c]">
              If you win, you will not be charged more than the max bid you enter. Bids are binding.
            </p>
          </form>
        </div>

        <footer className="mt-2 shrink-0 border-t border-[#ebebec] bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5">
          <div className="flex gap-3">
            <button
              type="submit"
              form="quickview-bid"
              className="flex h-[49px] flex-1 items-center justify-center rounded-xl bg-[#480516] text-[14px] font-semibold text-white transition hover:bg-[#5c1a2a]"
            >
              Placebid
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(toggleWatch(lot.id))
                dispatch(showToast(watched ? 'Removed from watchlist' : 'Added to watchlist'))
              }}
              className="inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-xl border border-[#ebebec] bg-white text-[13px] font-medium text-[#46494f] transition hover:bg-[#f5f5f6]"
            >
              <Icon src={heartIcon} size={13} />
              {watched ? 'Watching' : 'Add to watchlist'}
            </button>
          </div>
          <p className="mt-2.5 text-center text-[11px] leading-[15px] text-[#9d9ea2]">
            By bidding you agree to our Terms of Auction
          </p>
        </footer>
      </aside>
    </div>,
    document.body,
  )
}
