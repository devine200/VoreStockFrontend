import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLot } from '@/api/fixtures'
import { Button } from '@/components/shared/Button'
import { Icon } from '@/components/shared/Icon'
import { LotCard } from '@/components/auction/LotCard'
import { ProductCarousel } from '@/components/shared/ProductCarousel'
import { icons } from '@/assets'
import arrowDown from '@/assets/icons/arrow-down.svg'
import arrowRight from '@/assets/icons/arrow-right.svg'
import { useCountdown } from '@/hooks/useCountdown'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateLotBid } from '@/store/slices/auctionsSlice'
import { placeBid } from '@/store/slices/bidsSlice'
import { toggleWatch } from '@/store/slices/watchlistSlice'
import { openQuickView, showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn, formatMoney, lotDisplayCode } from '@/utils/format'
import cardPattern from '@/assets/images/card-pattern.svg'

const MANIFEST_COLUMNS = [
  { key: 'desc', label: 'Item Description' },
  { key: 'qty', label: 'QTY' },
  { key: 'unit', label: 'Unit Retail' },
  { key: 'ext', label: 'Ext. Retail' },
  { key: 'upc', label: 'UPC' },
  { key: 'category', label: 'Category' },
  { key: 'lotNo', label: 'Lot #' },
  { key: 'itemNo', label: 'Item #' },
  { key: 'brand', label: 'Brand' },
] as const

type ManifestColKey = (typeof MANIFEST_COLUMNS)[number]['key']

const MANIFEST_TABS = [
  'Full Manifest',
  'Category',
  'Subcategory',
  'Brand',
  'Model',
  'Seller Condition',
  'Condition',
] as const

type ManifestTab = (typeof MANIFEST_TABS)[number]
type SimilarSort = 'latest' | 'ending' | 'price'

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

type DetailTab = 'history' | 'shipment' | 'policies'

type BidRow = {
  bidder: string
  amount: number
  time: string
  lead?: boolean
}

function usd(amount: number) {
  return `US$${formatMoney(amount).replace('$', '')}`
}

function downloadCsv(filename: string, rows: typeof MANIFEST_ROWS) {
  const header = MANIFEST_COLUMNS.map((c) => c.label).join(',')
  const body = rows
    .map((row) =>
      [row.desc, row.qty, row.unit, row.ext, row.upc, row.category, row.lotNo, row.itemNo, row.brand]
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-[#ebebec] py-3">
      <Icon src={icon} size={15} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] font-light uppercase tracking-[0.55px] leading-[16.5px] text-[#9d9ea2]">
          {label}
        </p>
        <p className="pt-0.5 text-[14px] font-normal leading-5 text-[#1a1e26]">{value}</p>
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
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="min-w-0 pr-2 text-[14px] font-medium leading-5 text-[#1a1e26]">{title}</span>
        <span className="flex shrink-0 items-center gap-2 text-[12px] text-[#46494f] sm:text-[14px]">
          {summary ? <span>{summary}</span> : null}
          <Icon src={icons.arrowDown} size={14} className={cn('transition-transform', open && 'rotate-180')} />
        </span>
      </button>
      {open ? <div className="px-4 pb-4 sm:px-5">{children}</div> : null}
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
  const [manifestTab, setManifestTab] = useState<ManifestTab>('Full Manifest')
  const [visibleCols, setVisibleCols] = useState<ManifestColKey[]>(MANIFEST_COLUMNS.map((c) => c.key))
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [similarSort, setSimilarSort] = useState<SimilarSort>('latest')
  const [sortOpen, setSortOpen] = useState(false)
  const columnsRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node
      if (columnsRef.current && !columnsRef.current.contains(target)) setColumnsOpen(false)
      if (filtersRef.current && !filtersRef.current.contains(target)) setFiltersOpen(false)
      if (sortRef.current && !sortRef.current.contains(target)) setSortOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [])

  const gallery = useMemo(() => {
    if (!lot) return []
    const sources = [lot.image, ...lots.map((item) => item.image).filter((src) => src && src !== lot.image)]
    const pool = sources.length ? sources : [lot.image]
    return Array.from({ length: 22 }, (_, index) => pool[index % pool.length])
  }, [lot, lots])
  const galleryRailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setGalleryIndex(0)
  }, [lot?.id])

  useEffect(() => {
    const rail = galleryRailRef.current
    const thumb = rail?.querySelector<HTMLElement>(`[data-thumb="${galleryIndex}"]`)
    if (!rail || !thumb) return
    const railRect = rail.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()
    const vertical = rail.scrollHeight > rail.clientHeight + 1
    if (vertical) {
      rail.scrollTop += thumbRect.top - railRect.top - rail.clientHeight / 2 + thumbRect.height / 2
      return
    }
    rail.scrollLeft += thumbRect.left - railRect.left - rail.clientWidth / 2 + thumbRect.width / 2
  }, [galleryIndex])

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

  const filteredManifest = MANIFEST_ROWS.filter((row) => {
    const matchesQuery = `${row.desc} ${row.brand} ${row.category}`
      .toLowerCase()
      .includes(manifestQuery.toLowerCase())
    const matchesCategory = !categoryFilter || row.category === categoryFilter
    const matchesTab =
      manifestTab === 'Full Manifest' ||
      (manifestTab === 'Category' && row.category === 'Major Appliances') ||
      (manifestTab === 'Brand' && row.brand === 'SAM') ||
      (manifestTab === 'Condition' && row.category === 'Health & Wellness') ||
      (manifestTab !== 'Category' && manifestTab !== 'Brand' && manifestTab !== 'Condition')
    return matchesQuery && matchesCategory && matchesTab
  })

  const similarPool = lots.filter((item) => item.id !== lot.id)
  const similarLots = [...similarPool]
  if (similarSort === 'ending') {
    similarLots.sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime())
  } else if (similarSort === 'price') {
    similarLots.sort((a, b) => b.currentBid - a.currentBid)
  }
  const similarItems = similarLots.concat(similarPool).slice(0, 9)

  const jumpToManifest = () => {
    document.getElementById('lot-manifest')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
    <div className="min-w-0 pb-16">
      {/* Title row */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-[24px] items-center rounded-full bg-[#dacdd0] px-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#480516]">
              Spot
            </span>
            <span className="inline-flex h-[29px] items-center rounded-full bg-[#dacdd0] px-4 text-[14px] font-medium text-[#480516]">
              Auction
            </span>
            <button
              type="button"
              onClick={() => {
                dispatch(toggleWatch(lot.id))
                dispatch(showToast(watched ? 'Removed from watchlist' : 'Added to watchlist'))
              }}
              className="flex size-[18px] items-center justify-center text-[#7a7b7c] hover:text-[#480516]"
              aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Icon src={icons.bookmark} size={18} />
            </button>
          </div>
          <h1 className="mt-1 text-[20px] font-medium leading-7 tracking-[-0.5px] text-[#060709] sm:text-[24px] sm:leading-[38px]">
            {lot.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[#7a7b7c]">
            <span className="inline-flex items-center gap-1.5 text-[12px]">
              <Icon src={icons.pin} size={13} />
              {lot.location}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[14px]">
              <Icon src={icons.retailBag} size={13} />
              Ext. Retail {usd(lot.msrp)}
            </span>
          </div>
        </div>
        <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button
            type="button"
            onClick={jumpToManifest}
            className="inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-xl border border-[#ebebec] px-3 text-[12px] font-medium text-[#46494f] hover:bg-[#f8f8f9] sm:w-auto sm:px-4"
          >
            <Icon src={icons.fileText} size={13} />
            View Manifest
          </button>
          <button
            type="button"
            onClick={() => {
              downloadCsv(`${lotDisplayCode(lot.id).replace(/\s/g, '-')}-manifest.csv`, MANIFEST_ROWS)
              dispatch(showToast('Manifest download started'))
            }}
            className="inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-xl bg-[#480516] px-3 text-[12px] font-medium text-white hover:bg-[#5c1a2a] sm:w-auto sm:px-4"
          >
            <Icon src={icons.download} size={13} />
            Download Manifest
          </button>
        </div>
      </div>

      {/* Gallery + bid panel — image first on mobile, bid form next */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
            <div className="flex flex-col-reverse gap-5 p-4 sm:flex-row sm:p-5">
              <div className="relative h-14 w-full shrink-0 sm:h-[380px] sm:w-14">
                <div
                  ref={galleryRailRef}
                  className="flex h-full gap-2 overflow-x-auto scrollbar-none sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto"
                >
                  {gallery.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      data-thumb={i}
                      onClick={() => setGalleryIndex(i)}
                      aria-label={`Show image ${i + 1}`}
                      aria-current={galleryIndex === i ? 'true' : undefined}
                      className={cn(
                        'flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-[#f5f5f6]',
                        galleryIndex === i ? 'border-[#480516]' : 'border-[#ebebec]',
                      )}
                    >
                      <img src={src} alt="" className="size-9 object-contain" />
                    </button>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:inset-x-0 sm:top-auto sm:h-12 sm:w-auto sm:bg-gradient-to-t" />
                <button
                  type="button"
                  onClick={() => setGalleryIndex((current) => (current + 1) % gallery.length)}
                  aria-label="Next image"
                  className="absolute top-1/2 right-0 flex size-7 -translate-y-1/2 items-center justify-center text-[#9d9ea2] opacity-40 transition hover:opacity-70 sm:top-auto sm:right-auto sm:bottom-1 sm:left-1/2 sm:size-6 sm:-translate-x-1/2 sm:translate-y-0"
                >
                  <Icon src={arrowRight} size={14} className="sm:hidden" />
                  <Icon src={arrowDown} size={14} className="hidden sm:block" />
                </button>
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
                  {galleryIndex + 1} of {gallery.length}
                </span>
                <div className="absolute bottom-3 left-1/2 z-[2] hidden max-w-[70%] -translate-x-1/2 items-center gap-1.5 overflow-x-auto scrollbar-none sm:flex">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Image ${i + 1}`}
                      onClick={() => setGalleryIndex(i)}
                      className={cn(
                        'size-1.5 shrink-0 rounded-full',
                        galleryIndex === i ? 'bg-[#480516]' : 'bg-[#1a1e26]/25',
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 border-t border-[#ebebec] p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <MetaRow icon={icons.metaCategory} label="Category" value={lot.category} />
                <MetaRow icon={icons.metaInventory} label="Inventory Type" value="Unspecified" />
                <MetaRow icon={icons.metaLocation} label="Location" value={lot.location} />
              </div>
              <div>
                <MetaRow
                  icon={icons.metaCondition}
                  label="Condition"
                  value={lot.condition.split('|')[0].trim()}
                />
                <MetaRow
                  icon={icons.metaManifest}
                  label="Manifest Summary"
                  value={`${lot.units} Units · ${usd(lot.msrp)} MSRP`}
                />
                <MetaRow icon={icons.metaShipment} label="Shipment Size" value="1 TL / Floor Loaded" />
              </div>
            </div>
          </div>

        {/* Bid panel */}
        <aside className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
          <div className="grid grid-cols-2 border-b border-[#ebebec]">
            <div className="border-r border-[#ebebec] bg-[#f8f8f9] px-3 py-3 sm:px-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] leading-[15px] text-[#7a7b7c]">
                Closes In
              </p>
              <p className="mt-1.5 flex flex-nowrap items-baseline gap-0.5 text-[#1a1e26] sm:gap-1">
                {countdown.expired ? (
                  <span className="text-[20px] font-semibold sm:text-[24px]">Ended</span>
                ) : (
                  <>
                    <span className="text-[20px] font-semibold tabular-nums sm:text-[24px]">
                      {pad(countdown.days * 24 + countdown.hours)}
                    </span>
                    <span className="text-[14px] text-[#7a7b7c] sm:text-[16px]">h</span>
                    <span className="text-[20px] font-semibold tabular-nums sm:text-[24px]">{pad(countdown.minutes)}</span>
                    <span className="text-[14px] text-[#7a7b7c] sm:text-[16px]">m</span>
                    <span className="text-[18px] font-semibold tabular-nums sm:text-[20px]">{pad(countdown.seconds)}</span>
                    <span className="text-[12px] text-[#7a7b7c] sm:text-[14px]">s</span>
                  </>
                )}
              </p>
            </div>
            <div className="px-3 py-3 sm:px-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] leading-[15px] text-[#7a7b7c]">
                Current Bid
              </p>
              <p className="mt-1.5 text-[20px] font-semibold leading-7 text-[#1a1e26] sm:text-[24px] sm:leading-[30px]">
                {usd(lot.currentBid)}
              </p>
              <p className="mt-1 text-[12px] text-[#7a7b7c]">{lot.bidCount} bids placed</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-[#ebebec] px-4 py-4 sm:gap-3 sm:px-5">
            <div className="min-w-0 rounded-xl bg-[#f8f8f9] px-3 py-3 sm:px-4">
              <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7a7b7c] sm:text-[11px]">
                % of MSRP (Est.)
                <span title="Estimated current bid as a percent of manufacturer suggested retail.">
                  <Icon src={icons.infoSm} size={10} />
                </span>
              </p>
              <p className="mt-1 text-[18px] font-semibold text-[#1a1e26] sm:text-[22px]">{msrpPct}%</p>
              <p className="mt-1 text-[11px] text-[#7a7b7c] sm:text-[12px]">MSRP ~{usd(lot.msrp)}</p>
            </div>
            <div className="min-w-0 rounded-xl bg-[#f8f8f9] px-3 py-3 sm:px-4">
              <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7a7b7c] sm:text-[11px]">
                Cost / Unit (Est.)
                <span title="Estimated cost per unit based on the current bid.">
                  <Icon src={icons.infoSm} size={10} />
                </span>
              </p>
              <p className="mt-1 text-[18px] font-semibold text-[#1a1e26] sm:text-[22px]">{usd(unitCost)}</p>
              <p className="mt-1 text-[11px] text-[#7a7b7c] sm:text-[12px]">{lot.units} units in lot</p>
            </div>
          </div>

          <form onSubmit={onBid} className="space-y-3 border-b border-[#ebebec] px-4 py-4 sm:px-5">
            <p className="text-[14px] font-medium text-[#1a1e26]">Place a new max bid</p>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={cn(
                    'flex h-[48px] min-w-0 items-center justify-center rounded-xl border px-0.5 text-[11px] font-medium transition sm:h-[55px] sm:px-1 sm:text-[14px]',
                    amount === String(p)
                      ? 'border-[#480516] bg-[#480516]/[0.06] text-[#480516]'
                      : 'border-[#ebebec] text-[#46494f] hover:border-[#dacdd0]',
                  )}
                >
                  {usd(p)}
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
            <p className="text-[12px] leading-[18px] text-[#480516]">
              Enter max bid ({usd(presets[0] ?? lot.currentBid)}+). If you win, you will not be charged more than this amount.
            </p>
            <Button type="submit" className="h-[52px] w-full rounded-xl bg-[#480516] text-[16px] font-semibold">
              Place Bid
            </Button>
            <p className="text-center text-[12px] text-[#9d9ea2]">
              By bidding you agree to our{' '}
              <Link to="/terms" className="font-medium text-[#480516] hover:underline">
                Terms of Auction
              </Link>
              . All bids are binding.
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

          <div className="flex flex-wrap items-center gap-2 border-t border-[#ebebec] px-4 py-3 text-[12px] text-[#7a7b7c] sm:px-5">
            <Icon src={icons.clockSm} width={8.445} height={14} />
            <span>
              End Date &amp; Time: <span className="text-[#46494f]">{endLabel}</span>
            </span>
            <span className="text-[#c8c9cb]">·</span>
            <span className="text-[#480516]">this auction is extended by deposits/bids</span>
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

          <div className="grid grid-cols-2 gap-2 border-t border-[#ebebec] px-4 py-4 sm:gap-3 sm:px-5">
            <button
              type="button"
              onClick={() => {
                dispatch(toggleWatch(lot.id))
                dispatch(showToast(watched ? 'Removed from watchlist' : 'Added to watchlist'))
              }}
              className="inline-flex h-[35px] items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-[#ebebec] px-2 text-[11px] font-medium text-[#46494f] hover:bg-[#f5f5f6] sm:gap-2 sm:text-[12px]"
            >
              <Icon src={icons.watchHeart} size={13} />
              {watched ? 'Watching' : 'Watch Lot'}
            </button>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(window.location.href)
                dispatch(showToast('Link copied'))
              }}
              className="inline-flex h-[35px] items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-[#ebebec] px-2 text-[11px] font-medium text-[#46494f] hover:bg-[#f5f5f6] sm:gap-2 sm:text-[12px]"
            >
              <Icon src={icons.share} size={13} />
              Share
            </button>
          </div>
        </aside>

        <div className="rounded-2xl border border-[#ebebec] bg-white p-4 sm:p-6 lg:col-start-1">
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

      {/* Tabs */}
      <div className="mt-14 overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
        <div className="flex overflow-x-auto border-b border-[#ebebec] scrollbar-none">
          {(
            [
              { id: 'history' as const, label: 'Bid History' },
              { id: 'shipment' as const, label: 'Shipment Information' },
              { id: 'policies' as const, label: 'Policies' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'h-[50px] shrink-0 border-b-2 px-5 text-[14px] leading-5 transition',
                tab === t.id
                  ? 'border-[#480516] font-medium text-[#480516]'
                  : 'border-transparent font-normal text-[#7a7b7c] hover:text-[#46494f]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
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
              <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
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
                  <div key={ci}>
                    {col.map((item) => (
                      <div key={item.label} className="border-b border-[#ebebec] py-3">
                        <p className="text-[11px] font-light uppercase tracking-[0.55px] leading-[16.5px] text-[#9d9ea2]">
                          {item.label}
                        </p>
                        <p className="pt-1 text-[14px] font-normal leading-5 text-[#1a1e26]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-[#ebebec] bg-[#f5f5f6] p-4">
                <h3 className="text-[12px] font-medium leading-4 text-[#46494f]">Additional Information</h3>
                <div className="mt-2 space-y-2 text-[12px] font-normal leading-[19.5px] text-[#7a7b7c]">
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
            <div>
              <h3 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">Terms of Purchase</h3>
              <p className="mt-3 text-[14px] font-normal leading-[22.75px] text-[#46494f]">
                By bidding on this auction, you agree to purchase the goods described subject to the{' '}
                <Link to="/terms" className="text-[#480516]">
                  Terms of Purchase
                </Link>
                .
              </p>
              <div className="mt-4 rounded-xl border border-[#ebebec] bg-[#f5f5f6] p-4">
                {[
                  {
                    title: 'Binding Bids',
                    body: 'All bids are binding. By placing a bid you agree to purchase at your bid price if you win.',
                  },
                  {
                    title: 'Payment',
                    body: 'Full payment due within 48 hours of auction close. Accepted: ACH, Net Terms, Wire Transfer.',
                  },
                  {
                    title: 'Shipping',
                    body: 'Buyer arranges freight. Seller ships FOB origin within 3 business days of payment clearance.',
                  },
                  {
                    title: 'All Sales Final',
                    body: 'Items sold as-is. Manifest is informational only and does not guarantee exact contents.',
                  },
                ].map((item) => (
                  <div key={item.title} className="border-b border-[#ebebec] py-3 first:pt-0">
                    <p className="text-[12px] font-semibold leading-4 text-[#1a1e26]">{item.title}</p>
                    <p className="pt-1 text-[12px] font-normal leading-[19.5px] text-[#7a7b7c]">{item.body}</p>
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
            className="inline-flex h-9 items-center justify-center self-start rounded-xl bg-[#480516] px-4 text-[14px] font-medium text-white hover:bg-[#5c1a2a] sm:rounded-lg"
          >
            Full Screen
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#ebebec] p-4">
            <div className="relative min-w-0 flex-1 sm:min-w-[280px]">
              <Icon
                src={icons.manifestSearch}
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
            <div ref={columnsRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setColumnsOpen((open) => !open)
                  setFiltersOpen(false)
                }}
                className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#ebebec] px-3 text-[12px] text-[#1a1e26] hover:bg-[#f8f8f9]"
              >
                <Icon src={icons.columns} size={13} />
                Columns
              </button>
              {columnsOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#ebebec] bg-white p-2 shadow-[0px_8px_24px_rgba(26,30,38,0.12)]">
                  {MANIFEST_COLUMNS.map((col) => {
                    const checked = visibleCols.includes(col.key)
                    return (
                      <label
                        key={col.key}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-[#46494f] hover:bg-[#f8f8f9]"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setVisibleCols((prev) => {
                              if (checked) {
                                return prev.length === 1 ? prev : prev.filter((key) => key !== col.key)
                              }
                              return [...prev, col.key]
                            })
                          }}
                          className="accent-[#480516]"
                        />
                        {col.label}
                      </label>
                    )
                  })}
                </div>
              ) : null}
            </div>
            <div ref={filtersRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setFiltersOpen((open) => !open)
                  setColumnsOpen(false)
                }}
                className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#ebebec] px-3 text-[12px] text-[#1a1e26] hover:bg-[#f8f8f9]"
              >
                <Icon src={icons.filterSm} size={13} />
                Filters
              </button>
              {filtersOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-[#ebebec] bg-white p-3 shadow-[0px_8px_24px_rgba(26,30,38,0.12)]">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#9d9ea2]">Category</p>
                  {['', ...Array.from(new Set(MANIFEST_ROWS.map((row) => row.category)))].map((cat) => (
                    <button
                      key={cat || 'all'}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(cat)
                        setFiltersOpen(false)
                      }}
                      className={cn(
                        'flex w-full rounded-lg px-2 py-1.5 text-left text-[12px]',
                        categoryFilter === cat ? 'bg-[#f9f5f6] font-medium text-[#480516]' : 'text-[#46494f] hover:bg-[#f8f8f9]',
                      )}
                    >
                      {cat || 'All categories'}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                downloadCsv(`${lotDisplayCode(lot.id).replace(/\s/g, '-')}-manifest.csv`, filteredManifest)
                dispatch(showToast('CSV download started'))
              }}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#ebebec] px-3 text-[12px] text-[#1a1e26] hover:bg-[#f8f8f9]"
            >
              <Icon src={icons.downloadCsv} size={13} />
              Download CSV
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto border-b border-[#ebebec] px-2 pt-2">
            {MANIFEST_TABS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setManifestTab(label)}
                className={cn(
                  'h-[38px] shrink-0 px-4 text-[13px]',
                  manifestTab === label
                    ? 'border-b-2 border-[#480516] font-medium text-[#480516]'
                    : 'text-[#7a7b7c] hover:text-[#46494f]',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-[12px]">
              <thead className="bg-[#480516] text-[11px] font-semibold text-white">
                <tr>
                  {MANIFEST_COLUMNS.filter((col) => visibleCols.includes(col.key)).map((col) => (
                    <th key={col.key} className="px-3 py-3 font-semibold">
                      {col.label}
                    </th>
                  ))}
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
                    {visibleCols.includes('desc') ? <td className="px-3 py-2.5 text-[#1a1e26]">{row.desc}</td> : null}
                    {visibleCols.includes('qty') ? <td className="px-3 py-2.5">{row.qty}</td> : null}
                    {visibleCols.includes('unit') ? <td className="px-3 py-2.5">{usd(row.unit)}</td> : null}
                    {visibleCols.includes('ext') ? <td className="px-3 py-2.5">{usd(row.ext)}</td> : null}
                    {visibleCols.includes('upc') ? <td className="px-3 py-2.5 font-mono text-[11px]">{row.upc}</td> : null}
                    {visibleCols.includes('category') ? <td className="px-3 py-2.5">{row.category}</td> : null}
                    {visibleCols.includes('lotNo') ? <td className="px-3 py-2.5">{row.lotNo}</td> : null}
                    {visibleCols.includes('itemNo') ? <td className="px-3 py-2.5">{row.itemNo}</td> : null}
                    {visibleCols.includes('brand') ? (
                      <td className="px-3 py-2.5">
                        <span className="rounded bg-[#480516] px-2 py-0.5 text-[11px] font-medium text-white">
                          {row.brand}
                        </span>
                      </td>
                    ) : null}
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
          <div ref={sortRef} className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSortOpen((open) => !open)}
              className="inline-flex h-11 items-center gap-3 rounded-full border border-solid border-[#f4f4f4] bg-white px-5 text-[14px] font-normal leading-[1.5] text-[#1a1e26]"
            >
              {similarSort === 'latest'
                ? 'Sort By Latest'
                : similarSort === 'ending'
                  ? 'Sort By Ending Soon'
                  : 'Sort By Price'}
              <Icon src={icons.arrowDown} size={14} />
            </button>
            {sortOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-[#ebebec] bg-white py-1 shadow-[0px_8px_24px_rgba(26,30,38,0.12)]">
                {(
                  [
                    { id: 'latest' as const, label: 'Sort By Latest' },
                    { id: 'ending' as const, label: 'Sort By Ending Soon' },
                    { id: 'price' as const, label: 'Sort By Price' },
                  ]
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSimilarSort(option.id)
                      setSortOpen(false)
                    }}
                    className={cn(
                      'flex w-full px-4 py-2 text-left text-[13px]',
                      similarSort === option.id ? 'bg-[#f9f5f6] text-[#480516]' : 'text-[#46494f] hover:bg-[#f8f8f9]',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <ProductCarousel visible={4} gap={20}>
          {similarItems.map((similar, i) => (
            <LotCard key={`similar-${similar.id}-${i}`} lot={similar} />
          ))}
        </ProductCarousel>
      </section>
    </div>
  )
}
