import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLot } from '@/api/fixtures'
import { Button } from '@/components/shared/Button'
import { Icon } from '@/components/shared/Icon'
import { LotCard } from '@/components/auction/LotCard'
import { ProductCarousel } from '@/components/shared/ProductCarousel'
import { icons } from '@/assets'
import heartIcon from '@/assets/icons/heart.svg'
import arrowDown from '@/assets/icons/arrow-down.svg'
import { useCountdown } from '@/hooks/useCountdown'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateLotBid } from '@/store/slices/auctionsSlice'
import { placeBid } from '@/store/slices/bidsSlice'
import { toggleWatch } from '@/store/slices/watchlistSlice'
import { openQuickView, showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn, formatMoney } from '@/utils/format'
import cardPattern from '@/assets/images/card-pattern.svg'

const MANIFEST_ROWS = Array.from({ length: 10 }, (_, i) => ({
  desc: i < 7 ? 'SS RF23M8570SR 23 CF 4' : i === 7 ? 'GreenLeaf CBD Tincture 1000mg' : 'PureCBD Co. Citrus Burst 1000mg',
  qty: i < 7 ? 2 : 8,
  unit: i < 7 ? 1899.98 : i === 7 ? 68 : 59,
  ext: i < 7 ? 3799.98 : i === 7 ? 544 : 472,
  upc: i < 7 ? '887276600235' : i === 7 ? '812345678901' : '812345678918',
  category: i < 7 ? 'Major Appliances' : 'Health & Wellness',
  lotNo: i < 7 ? 'GLD-8938730' : 'CBD-2024-0047',
  itemNo: String(144059 + i),
  brand: i < 7 ? 'SAM' : i === 7 ? 'GLN' : 'PCD',
}))

type DetailTab = 'manifest' | 'history' | 'shipment' | 'policies'

type BidRow = {
  bidder: string
  amount: number
  time: string
  lead?: boolean
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-3">
      <span className="mt-0.5 flex size-[15px] shrink-0 items-center justify-center rounded-sm bg-[#f5f5f6] text-[9px] font-semibold text-[#480516]">
        ·
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.04em] leading-[17px] text-[#9d9ea2]">
          {label}
        </p>
        <p className="text-[14px] font-medium leading-5 text-[#1a1e26]">{value}</p>
      </div>
    </div>
  )
}

function Accordion({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string
  summary?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-[#ebebec]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="text-[14px] font-medium leading-5 text-[#1a1e26]">{title}</span>
        <span className="flex items-center gap-2 text-[14px] text-[#46494f]">
          {summary ? <span>{summary}</span> : null}
          <Icon src={arrowDown} size={14} className={cn('transition-transform', open && 'rotate-180')} />
        </span>
      </button>
      {open ? <div className="px-5 pb-4">{children}</div> : null}
    </div>
  )
}

export function LotDetailPage() {
  const { id = '' } = useParams()
  const lotFromStore = useAppSelector((s) => s.auctions.lots.find((l) => l.id === id || l.slug === id))
  const lot = lotFromStore ?? getLot(id)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.session.user)
  const watched = useAppSelector((s) => (lot ? s.watchlist.ids.includes(lot.id) : false))
  const countdown = useCountdown(lot?.endsAt ?? new Date().toISOString())
  const lots = useAppSelector((s) => s.auctions.lots)

  const presets = useMemo(() => {
    if (!lot) return []
    const step = Math.max(100, Math.round(lot.currentBid * 0.02))
    return [lot.currentBid + step, lot.currentBid + step * 2, lot.currentBid + step * 5]
  }, [lot])

  const [amount, setAmount] = useState('')
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [landedOpen, setLandedOpen] = useState(true)
  const [shippingOpen, setShippingOpen] = useState(true)
  const [paymentOpen, setPaymentOpen] = useState(true)
  const [tab, setTab] = useState<DetailTab>('history')
  const [manifestQuery, setManifestQuery] = useState('')

  const gallery = useMemo(() => {
    if (!lot) return []
    return [lot.image, ...lots.slice(0, 5).map((l) => l.image)]
  }, [lot, lots])

  const bidHistory = useMemo((): BidRow[] => {
    if (!lot) return []
    const base = lot.currentBid
    return [
      { bidder: 'b***r42', amount: base, time: '2 min ago', lead: true },
      { bidder: 'g***n18', amount: Math.round(base * 0.986), time: '14 min ago' },
      { bidder: 'x***z91', amount: Math.round(base * 0.93), time: '1h 12m ago' },
      { bidder: 'k***p07', amount: Math.round(base * 0.9), time: '2h 40m ago' },
      { bidder: 'm***t33', amount: Math.round(base * 0.86), time: '5h 08m ago' },
      { bidder: 'a***w55', amount: Math.round(base * 0.82), time: 'Yesterday' },
    ]
  }, [lot])

  if (!lot) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-semibold text-[#1a1e26]">Lot not found</h1>
        <Link to="/categories/all" className="mt-4 inline-block text-[#480516]">
          Back to listings
        </Link>
      </div>
    )
  }

  const unitCost = lot.units > 0 ? lot.currentBid / lot.units : 0
  const msrpPct = lot.msrp > 0 ? ((lot.currentBid / lot.msrp) * 100).toFixed(1) : '—'
  const freight = Math.round(lot.currentBid * 2.9)
  const handling = Math.round(lot.currentBid * 0.68)
  const shippingTotal = freight + handling
  const landed = lot.currentBid + shippingTotal

  const endLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(lot.endsAt))

  const filteredManifest = MANIFEST_ROWS.filter((row) =>
    `${row.desc} ${row.brand} ${row.category}`.toLowerCase().includes(manifestQuery.toLowerCase()),
  )

  const onBid = (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      navigate('/login', { state: { from: `/lots/${lot.slug}` } })
      return
    }
    const value = Number(amount)
    if (!value || value <= lot.currentBid) {
      dispatch(showToast('Bid must be higher than current bid'))
      return
    }
    dispatch(placeBid({ lotId: lot.id, amount: value }))
    dispatch(updateLotBid({ lotId: lot.id, amount: value }))
    dispatch(
      showSuccess({
        title: 'Bid placed',
        body: 'Your bid is live. We’ll notify you if you’re outbid.',
        actionLabel: 'View Bids',
        actionTo: '/bids',
      }),
    )
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="pb-16">
      {/* Title row */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-[24px] items-center rounded bg-[#480516] px-2.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              Spot
            </span>
            <span className="inline-flex h-[29px] items-center rounded-full bg-[#f5f5f6] px-4 text-[14px] text-[#1a1e26]">
              Auction
            </span>
            <button
              type="button"
              onClick={() => {
                dispatch(toggleWatch(lot.id))
                dispatch(showToast(watched ? 'Removed from watchlist' : 'Added to watchlist'))
              }}
              className="flex size-[18px] items-center justify-center text-[#7a7b7c] hover:text-[#480516]"
              aria-label="Bookmark lot"
            >
              <Icon src={heartIcon} size={14} />
            </button>
          </div>
          <h1 className="mt-1 text-[24px] font-medium leading-[38px] tracking-[-0.5px] text-[#060709]">
            {lot.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-[14px] text-[#46494f]">
            <span className="inline-flex items-center gap-1.5">
              <Icon src={icons.location} size={13} />
              {lot.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon src={icons.retailBag} size={13} />
              Ext. Retail {formatMoney(lot.msrp)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => dispatch(openQuickView(lot.id))}
            className="inline-flex h-[34px] items-center gap-2 rounded-full border border-[#480516] px-4 text-[12px] font-medium text-[#480516] hover:bg-[#480516]/[0.04]"
          >
            View Manifest
          </button>
          <button
            type="button"
            onClick={() => dispatch(showToast('Manifest download started'))}
            className="inline-flex h-[34px] items-center gap-2 rounded-full bg-[#480516] px-4 text-[12px] font-medium text-white hover:bg-[#5c1a2a]"
          >
            Download Manifest
          </button>
        </div>
      </div>

      {/* Gallery + bid panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
            <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-5">
              <div className="flex w-full shrink-0 gap-2 overflow-x-auto scrollbar-none sm:w-14 sm:flex-col">
                {gallery.slice(0, 5).map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className={cn(
                      'flex size-14 items-center justify-center overflow-hidden rounded-lg border bg-[#f5f5f6]',
                      galleryIndex === i ? 'border-[#480516]' : 'border-[#ebebec]',
                    )}
                  >
                    <img src={src} alt="" className="size-9 object-contain" />
                  </button>
                ))}
                <div className="flex h-8 items-center justify-center rounded-lg border border-[#ebebec] text-[12px] text-[#7a7b7c]">
                  +17
                </div>
              </div>

              <div className="relative flex min-h-[260px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-[#fafafa] sm:min-h-[380px]">
                <img
                  src={cardPattern}
                  alt=""
                  className="pointer-events-none absolute bottom-0 left-1/2 w-[80%] -translate-x-1/2 opacity-60"
                />
                <img
                  src={gallery[galleryIndex] || lot.image}
                  alt=""
                  className="relative z-[1] size-[220px] object-contain sm:size-[320px]"
                />
                {lot.dockVerified ? (
                  <span className="absolute left-3 top-3 z-[2] rounded-full bg-[#e6f4ed] px-2.5 py-1 text-[11px] font-semibold text-[#0a6e38]">
                    Dock Verification
                  </span>
                ) : null}
                <span className="absolute right-3 bottom-3 z-[2] rounded bg-[#1a1e26]/70 px-2.5 py-1 text-[12px] text-white">
                  {galleryIndex + 1} of 22
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-5 border-t border-[#ebebec] px-5 py-1 sm:grid-cols-2">
              <div>
                <MetaRow label="Category" value={lot.category} />
                <MetaRow label="Inventory Type" value="Unspecified" />
                <MetaRow label="Location" value={lot.location} />
              </div>
              <div>
                <MetaRow label="Condition" value={lot.condition.split('|')[0].trim()} />
                <MetaRow
                  label="Manifest Summary"
                  value={`${lot.units} Units · ${formatMoney(lot.msrp)} MSRP`}
                />
                <MetaRow label="Shipment Size" value="1 TL / Floor Loaded" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ebebec] bg-white p-6">
            <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Description</h2>
            <div className="mt-4 space-y-4 text-[14px] leading-[23px] text-[#46494f]">
              <p>
                {lot.condition}: Merchandise with visible signs of use. {lot.description}
              </p>
              <p>
                Please be advised that sets, kits or packs may be incomplete. Review the manifest carefully
                before bidding.
              </p>
              <p>
                Stock images, when included, are representations only and may not depict the exact units in
                this lot.
              </p>
              <p>
                Variations between manifested quantities and shipped quantities can occur. Bid with that in
                mind.
              </p>
            </div>
          </div>
        </div>

        {/* Bid panel */}
        <aside className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
          <div className="grid grid-cols-2 border-b border-[#ebebec]">
            <div className="border-r border-[#ebebec] px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] leading-[15px] text-[#7a7b7c]">
                Closes In
              </p>
              <p className="mt-1.5 flex items-baseline gap-1 text-[#1a1e26]">
                {countdown.expired ? (
                  <span className="text-[24px] font-semibold">Ended</span>
                ) : (
                  <>
                    <span className="text-[24px] font-semibold tabular-nums">
                      {pad(countdown.days * 24 + countdown.hours)}
                    </span>
                    <span className="text-[16px] text-[#7a7b7c]">h</span>
                    <span className="text-[24px] font-semibold tabular-nums">{pad(countdown.minutes)}</span>
                    <span className="text-[16px] text-[#7a7b7c]">m</span>
                    <span className="text-[20px] font-semibold tabular-nums">{pad(countdown.seconds)}</span>
                    <span className="text-[14px] text-[#7a7b7c]">s</span>
                  </>
                )}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] leading-[15px] text-[#7a7b7c]">
                Current Bid
              </p>
              <p className="mt-1.5 text-[24px] font-semibold leading-[30px] text-[#480516]">
                {formatMoney(lot.currentBid)}
              </p>
              <p className="mt-1 text-[12px] text-[#7a7b7c]">{lot.bidCount} bids placed</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-[#ebebec] bg-[#f5f5f6] px-5 py-4">
            <div className="px-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#7a7b7c]">
                % of MSRP (Est.)
              </p>
              <p className="mt-1 text-[22px] font-semibold text-[#1a1e26]">{msrpPct}%</p>
              <p className="mt-1 text-[12px] text-[#7a7b7c]">MSRP ~{formatMoney(lot.msrp)}</p>
            </div>
            <div className="px-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#7a7b7c]">
                Cost / Unit (Est.)
              </p>
              <p className="mt-1 text-[22px] font-semibold text-[#1a1e26]">{formatMoney(unitCost)}</p>
              <p className="mt-1 text-[12px] text-[#7a7b7c]">{lot.units} units in lot</p>
            </div>
          </div>

          <form onSubmit={onBid} className="space-y-3 border-b border-[#ebebec] px-5 py-4">
            <p className="text-[14px] font-medium text-[#1a1e26]">Place a new max bid</p>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={cn(
                    'flex h-[55px] items-center justify-center rounded-xl border text-[14px] font-medium transition',
                    amount === String(p)
                      ? 'border-[#480516] bg-[#480516]/[0.06] text-[#480516]'
                      : 'border-[#ebebec] text-[#46494f] hover:border-[#dacdd0]',
                  )}
                >
                  {formatMoney(p)}
                </button>
              ))}
            </div>
            <label className="relative block">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#7a7b7c]">
                US$
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter max bid"
                className="h-[47px] w-full rounded-xl border border-[#ebebec] bg-white pl-14 pr-4 text-[14px] text-[#1a1e26] outline-none focus:border-[#480516] focus:ring-2 focus:ring-[#480516]/10"
              />
            </label>
            <p className="text-[12px] leading-4 text-[#7a7b7c]">
              If you win, you will not be charged more than the max bid you enter.
            </p>
            <Button type="submit" className="h-[52px] w-full rounded-xl bg-[#480516] text-[16px] font-semibold">
              Place Bid
            </Button>
            <p className="text-center text-[12px] text-[#9d9ea2]">
              By bidding you agree to our Terms of Auction. All bids are binding.
            </p>
          </form>

          <Accordion
            title="Total Landed Cost Breakdown"
            summary={`${formatMoney(landed)} ↓`}
            open={landedOpen}
            onToggle={() => setLandedOpen((v) => !v)}
          >
            <div className="space-y-2 text-[13px] text-[#7a7b7c]">
              <div className="flex justify-between">
                <span>Current Bid</span>
                <span>{formatMoney(lot.currentBid)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping &amp; Handling</span>
                <span>{formatMoney(shippingTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Buyer&apos;s Premium (est.)</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between border-t border-[#ebebec] pt-2 text-[14px] font-semibold text-[#1a1e26]">
                <span>Total Landed</span>
                <span>{formatMoney(landed)}</span>
              </div>
            </div>
          </Accordion>

          <div className="flex flex-wrap items-center gap-2 border-t border-[#ebebec] px-5 py-3 text-[12px] text-[#7a7b7c]">
            <span>
              End Date &amp; Time: <span className="text-[#46494f]">{endLabel}</span>
            </span>
            <span className="text-[#c8c9cb]">·</span>
            <span>this auction is extended by deposits/bids</span>
          </div>

          <Accordion
            title="Shipping & Other Charges"
            summary={formatMoney(shippingTotal)}
            open={shippingOpen}
            onToggle={() => setShippingOpen((v) => !v)}
          >
            <p className="mb-2 text-[12px] text-[#7a7b7c]">Calculated based on transaction size.</p>
            <div className="space-y-2 text-[13px] text-[#7a7b7c]">
              <div className="flex justify-between">
                <span>Freight – TL</span>
                <span>{formatMoney(freight)}</span>
              </div>
              <div className="flex justify-between">
                <span>Handling Fee</span>
                <span>{formatMoney(handling)}</span>
              </div>
              <div className="flex justify-between">
                <span>Insurance</span>
                <span>Included</span>
              </div>
            </div>
          </Accordion>

          <Accordion
            title="Available Payment Methods"
            open={paymentOpen}
            onToggle={() => setPaymentOpen((v) => !v)}
          >
            <p className="mb-3 text-[12px] text-[#7a7b7c]">Some methods may require a processing fee.</p>
            <div className="flex flex-wrap gap-2">
              {['ACH', 'Net Terms', 'Wire Transfer'].map((m) => (
                <span
                  key={m}
                  className="inline-flex h-[30px] items-center rounded-lg border border-[#ebebec] px-3 text-[12px] text-[#46494f]"
                >
                  {m}
                </span>
              ))}
            </div>
          </Accordion>

          <div className="grid grid-cols-2 gap-3 border-t border-[#ebebec] px-5 py-4">
            <button
              type="button"
              onClick={() => {
                dispatch(toggleWatch(lot.id))
                dispatch(showToast(watched ? 'Removed from watchlist' : 'Added to watchlist'))
              }}
              className="inline-flex h-[35px] items-center justify-center gap-2 rounded-full border border-[#ebebec] text-[12px] font-medium text-[#46494f] hover:bg-[#f5f5f6]"
            >
              <Icon src={heartIcon} size={13} />
              {watched ? 'Watching' : 'Watch Lot'}
            </button>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(window.location.href)
                dispatch(showToast('Link copied'))
              }}
              className="inline-flex h-[35px] items-center justify-center gap-2 rounded-full border border-[#ebebec] text-[12px] font-medium text-[#46494f] hover:bg-[#f5f5f6]"
            >
              Share
            </button>
          </div>
        </aside>
      </div>

      {/* Tabs */}
      <div className="mt-14 overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
        <div className="flex overflow-x-auto border-b border-[#ebebec] scrollbar-none">
          {(
            [
              { id: 'manifest' as const, label: 'Manifest' },
              { id: 'history' as const, label: 'Bid History' },
              { id: 'shipment' as const, label: 'Shipment Information' },
              { id: 'policies' as const, label: 'Policies' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id)
                if (t.id === 'manifest') {
                  document.getElementById('lot-manifest')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className={cn(
                'h-[50px] shrink-0 px-4 text-[14px] font-medium transition sm:px-5',
                tab === t.id
                  ? 'border-b-2 border-[#480516] text-[#480516]'
                  : 'text-[#7a7b7c] hover:text-[#46494f]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'manifest' ? (
            <div className="rounded-xl bg-[#f5f5f6] px-5 py-6 text-center">
              <p className="text-[14px] text-[#46494f]">
                Full itemized inventory is in the Manifest table below.
              </p>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('lot-manifest')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="mt-4 inline-flex h-10 items-center rounded-full bg-[#480516] px-5 text-[13px] font-medium text-white"
              >
                Jump to Manifest
              </button>
            </div>
          ) : null}

          {tab === 'history' ? (
            <div className="overflow-hidden rounded-xl bg-[#f5f5f6] p-4">
              <div className="grid grid-cols-3 px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#9d9ea2]">
                <span>Bidder</span>
                <span className="text-center">Amount</span>
                <span className="text-right">Time</span>
              </div>
              <ul className="overflow-hidden rounded-lg border border-[#ebebec] bg-white">
                {bidHistory.map((row) => (
                  <li
                    key={`${row.bidder}-${row.amount}`}
                    className={cn(
                      'grid grid-cols-3 items-center border-b border-[#f4f4f4] px-3 py-3.5 last:border-b-0',
                      row.lead && 'bg-[#f9f5f6]',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {row.lead ? (
                        <span className="inline-flex h-5 items-center rounded bg-[#480516] px-1.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Lead
                        </span>
                      ) : null}
                      <span className="text-[14px] text-[#46494f]">{row.bidder}</span>
                    </div>
                    <span
                      className={cn(
                        'text-center text-[14px] font-semibold tabular-nums',
                        row.lead ? 'text-[#480516]' : 'text-[#1a1e26]',
                      )}
                    >
                      {formatMoney(row.amount)}
                    </span>
                    <span className="text-right text-[13px] text-[#7a7b7c]">{row.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tab === 'shipment' ? (
            <div>
              <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                {(
                  [
                    [
                      { label: 'Shipment Type', value: 'Standard Shipping only' },
                      { label: 'Number of Shipments', value: '1' },
                      { label: 'Number of Units', value: String(lot.units) },
                      { label: 'Number of Truckloads', value: '1' },
                    ],
                    [
                      { label: 'Transport Mode', value: 'Freight — TL' },
                      { label: 'Packaging Type', value: 'Floor Loaded' },
                      { label: 'Shipment Weight', value: '9,431 lbs' },
                      { label: 'Spaces', value: '100' },
                    ],
                  ] as const
                ).map((col, ci) => (
                  <div key={ci} className="divide-y divide-[#f4f4f4]">
                    {col.map((item) => (
                      <div key={item.label} className="py-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9d9ea2]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-[15px] font-semibold text-[#1a1e26]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-2 rounded-xl bg-[#f5f5f6] p-5">
                <h3 className="text-[14px] font-semibold text-[#1a1e26]">Additional Information</h3>
                <div className="mt-3 space-y-3 text-[13px] leading-[21px] text-[#7a7b7c]">
                  <p>This lot is floor loaded and will not be palletized.</p>
                  <p>
                    Your total payment must include the shipping cost displayed above. Costco will ship on their
                    own contracted carrier, providing tracking and estimated delivery dates. Costco has
                    negotiated rates specific to liquidation shipments. We are leveraging those freight savings
                    to offer heavily discounted rates to you.
                  </p>
                  <p>
                    Liftgate/Residential services are not available on truckload auctions, nor are they
                    available for floor loaded lots.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'policies' ? (
            <div className="rounded-xl bg-[#f5f5f6] p-5">
              <h3 className="text-[14px] font-semibold text-[#1a1e26]">Terms of Purchase</h3>
              <p className="mt-3 text-[14px] leading-[23px] text-[#46494f]">
                By bidding on this auction, you agree to purchase the lot if you are the winning bidder under
                the following terms.
              </p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    title: 'Binding Bids',
                    body: 'All bids are binding. By placing a bid you agree to complete payment if you win.',
                  },
                  {
                    title: 'Payment',
                    body: 'Full payment due within 48 hours of auction close. Escrow holds may apply.',
                  },
                  {
                    title: 'Shipping',
                    body: 'Buyer arranges freight. Seller ships FOB origin within the stated pickup window.',
                  },
                  {
                    title: 'All Sales Final',
                    body: 'Items sold as-is. Manifest is informational only and not a guarantee of contents.',
                  },
                ].map((item) => (
                  <div key={item.title}>
                    <p className="text-[13px] font-semibold text-[#1a1e26]">{item.title}</p>
                    <p className="mt-1 text-[13px] leading-5 text-[#7a7b7c]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Manifest */}
      <section id="lot-manifest" className="mt-14 scroll-mt-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[20px] font-semibold text-[#1a1e26]">Manifest</h2>
          <button
            type="button"
            onClick={() => dispatch(openQuickView(lot.id))}
            className="inline-flex h-9 items-center rounded-lg bg-[#480516] px-4 text-[14px] font-medium text-white hover:bg-[#5c1a2a]"
          >
            Full Screen
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#ebebec] p-4">
            <div className="relative min-w-0 flex-1 sm:min-w-[280px]">
              <Icon
                src={icons.search}
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                value={manifestQuery}
                onChange={(e) => setManifestQuery(e.target.value)}
                placeholder="Search descriptions, brands, items…"
                className="h-[42px] w-full rounded-xl border border-[#ebebec] bg-white pl-9 pr-4 text-[14px] outline-none focus:border-[#480516]"
              />
            </div>
            <button type="button" className="h-[34px] rounded-lg border border-[#ebebec] px-3 text-[12px] text-[#1a1e26]">
              Columns
            </button>
            <button type="button" className="h-[34px] rounded-lg border border-[#ebebec] px-3 text-[12px] text-[#1a1e26]">
              Filters
            </button>
            <button
              type="button"
              onClick={() => dispatch(showToast('CSV download started'))}
              className="h-[34px] rounded-lg border border-[#ebebec] px-3 text-[12px] text-[#1a1e26]"
            >
              Download CSV
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto border-b border-[#ebebec] px-2 pt-2">
            {['Full Manifest', 'Category', 'Subcategory', 'Brand', 'Model', 'Seller Condition', 'Condition'].map(
              (label, i) => (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    'h-[38px] shrink-0 px-4 text-[13px]',
                    i === 0
                      ? 'border-b-2 border-[#480516] font-medium text-[#480516]'
                      : 'text-[#7a7b7c]',
                  )}
                >
                  {label}
                </button>
              ),
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-[12px]">
              <thead className="bg-[#480516] text-[11px] font-semibold text-white">
                <tr>
                  <th className="px-3 py-3 font-semibold">Item Description</th>
                  <th className="px-3 py-3 font-semibold">QTY</th>
                  <th className="px-3 py-3 font-semibold">Unit Retail</th>
                  <th className="px-3 py-3 font-semibold">Ext. Retail</th>
                  <th className="px-3 py-3 font-semibold">UPC</th>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 font-semibold">Lot #</th>
                  <th className="px-3 py-3 font-semibold">Item #</th>
                  <th className="px-3 py-3 font-semibold">Brand</th>
                </tr>
              </thead>
              <tbody>
                {filteredManifest.map((row, i) => (
                  <tr
                    key={`${row.itemNo}-${i}`}
                    className={cn(
                      'border-t border-[#f4f4f4] text-[#46494f]',
                      i % 2 === 1 && 'bg-[#fafafa]',
                    )}
                  >
                    <td className="px-3 py-2.5 text-[#1a1e26]">{row.desc}</td>
                    <td className="px-3 py-2.5">{row.qty}</td>
                    <td className="px-3 py-2.5">{formatMoney(row.unit)}</td>
                    <td className="px-3 py-2.5">{formatMoney(row.ext)}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px]">{row.upc}</td>
                    <td className="px-3 py-2.5">{row.category}</td>
                    <td className="px-3 py-2.5">{row.lotNo}</td>
                    <td className="px-3 py-2.5">{row.itemNo}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded bg-[#480516] px-2 py-0.5 text-[11px] font-medium text-white">
                        {row.brand}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ebebec] px-4 py-3">
            <p className="text-[12px] text-[#9d9ea2]">
              Rows 1-{filteredManifest.length} of {filteredManifest.length}
            </p>
            <p className="inline-flex items-center gap-1.5 text-[12px] text-[#ff383c]">
              <span aria-hidden>⚠</span>
              There may be a 5% variance in value, unit count, and/or condition listed below.
            </p>
          </div>
        </div>
      </section>

      {/* Similar Items */}
      <section className="mt-14">
        <div className="mb-6 flex min-h-11 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[20px] font-medium leading-[1.5] tracking-[-0.5px] text-[#060709] sm:text-[24px]">
            Similar Items
          </h2>
          <button
            type="button"
            className="inline-flex h-11 items-center gap-3 rounded-full border border-solid border-[#f4f4f4] bg-white px-5 text-[14px] font-normal leading-[1.5] text-[#1a1e26]"
          >
            Sort By Latest
            <Icon src={icons.arrowDown} size={14} />
          </button>
        </div>
        <ProductCarousel visible={3} gap={32}>
          {lots
            .filter((l) => l.id !== lot.id)
            .concat(lots)
            .slice(0, 9)
            .map((similar, i) => (
              <LotCard key={`similar-${similar.id}-${i}`} lot={similar} />
            ))}
        </ProductCarousel>
      </section>
    </div>
  )
}
