import { FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CATEGORIES, getLot } from '@/api/fixtures'
import { AccountMenu } from '@/components/session/AccountMenu'
import { icons, logoImg } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSearchQuery } from '@/store/slices/auctionsSlice'
import { toggleAccountMenu } from '@/store/slices/uiSlice'
import { cn, lotDisplayCode } from '@/utils/format'

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return <Icon src={icons.close} size={16} />
}

function categoryTo(slug: string) {
  if (slug === 'support') return '/support'
  if (slug === 'rewards') return '/referrals'
  return `/categories/${slug}`
}

export function SiteHeader() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const accountMenuOpen = useAppSelector((s) => s.ui.accountMenuOpen)
  const [query, setQuery] = useState('')
  const [promoLeft, setPromoLeft] = useState(23 * 3600 + 15 * 60)
  const [navOpen, setNavOpen] = useState(false)

  const lotParam = location.pathname.match(/^\/lots\/([^/]+)/)?.[1]
  const lots = useAppSelector((s) => s.auctions.lots)
  const lot = lotParam
    ? lots.find((l) => l.id === lotParam || l.slug === lotParam) ?? getLot(lotParam)
    : undefined
  const isDetail = Boolean(lotParam)
  const isBids = location.pathname === '/bids'
  const showSeoHeader = isDetail || isBids

  useEffect(() => {
    const id = window.setInterval(() => setPromoLeft((v) => Math.max(0, v - 1)), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    setNavOpen(false)
    dispatch(toggleAccountMenu(false))
  }, [location.pathname, dispatch])

  useEffect(() => {
    if (!navOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [navOpen])

  const h = String(Math.floor(promoLeft / 3600)).padStart(2, '0')
  const m = String(Math.floor((promoLeft % 3600) / 60)).padStart(2, '0')
  const sec = String(promoLeft % 60).padStart(2, '0')

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    dispatch(setSearchQuery(query))
    navigate(query ? `/categories/all?q=${encodeURIComponent(query)}` : '/categories/all')
    setNavOpen(false)
  }

  const searchField = (
    <>
      <div className="flex h-11 min-w-0 flex-1 items-center rounded-full border border-solid border-[#f4f4f4] bg-white py-1 pl-5 pr-1 lg:h-12 lg:pl-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent text-[16px] font-normal leading-[1.5] text-[#1a1e26] outline-none placeholder:text-[#c8c9cb]"
        />
      </div>
      <button
        type="submit"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#6d3745] p-2 lg:size-12"
        aria-label="Search"
      >
        <Icon src={icons.search} size={18} className="[&_img]:brightness-0 [&_img]:invert" />
      </button>
    </>
  )

  return (
    <header className="bg-white">
      <div className="flex min-h-[37px] w-full items-center justify-center gap-2 bg-[#480516] px-3 py-1.5 text-[12px] font-normal leading-[1.5] sm:gap-4 sm:px-4 sm:text-[14px]">
        <p className="truncate text-white/70 sm:whitespace-nowrap">
          LIMITED OFFER: 30% OFF. Use RABBIT30 at Checkout.
        </p>
        <p className="shrink-0 whitespace-nowrap tabular-nums text-white">
          {h} : {m} : {sec}
        </p>
      </div>

      <div className="flex h-16 w-full items-center justify-between gap-3 border-b border-solid border-[#f4f4f4] px-4 sm:px-6 lg:h-[78px] lg:px-16">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full text-[#1a1e26] lg:hidden"
          aria-label="Open menu"
          onClick={() => {
            dispatch(toggleAccountMenu(false))
            setNavOpen(true)
          }}
        >
          <MenuIcon />
        </button>

        <Link to="/" className="relative h-[42px] w-[62px] shrink-0 overflow-hidden lg:h-[49.691px] lg:w-[73px]">
          <img
            src={logoImg}
            alt="VSK Global"
            className="pointer-events-none absolute max-w-none"
            style={{
              height: '204%',
              width: '253.47%',
              left: '-76.24%',
              top: '-58.55%',
            }}
          />
        </Link>

        <form onSubmit={onSearch} className="hidden min-w-0 flex-1 items-center justify-center gap-2 lg:flex lg:max-w-[460px]">
          {searchField}
        </form>

        <div className="relative flex min-w-0 items-center justify-end md:w-[180px] lg:w-[270px]">
          <button
            type="button"
            className="whitespace-nowrap text-[14px] font-normal leading-[1.5] text-[#46494f]"
            onClick={() => {
              setNavOpen(false)
              dispatch(toggleAccountMenu())
            }}
          >
            <span className="hidden sm:inline">Your Account</span>
            <span className="inline sm:hidden">Account</span>
          </button>
          {accountMenuOpen ? <AccountMenu /> : null}
        </div>
      </div>

      <form onSubmit={onSearch} className="flex items-center gap-2 border-b border-[#f4f4f4] px-4 py-3 lg:hidden">
        {searchField}
      </form>

      <nav className="hidden h-14 w-full items-center justify-start gap-6 overflow-x-auto border-b border-solid border-[#f4f4f4] px-6 scrollbar-none lg:flex xl:justify-center xl:gap-10 xl:px-16">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={categoryTo(cat.slug)}
            className="inline-flex shrink-0 items-center whitespace-nowrap text-[16px] font-normal leading-[1.5] text-[#46494f]"
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      {showSeoHeader ? (
        <div className="flex min-h-[37px] w-full flex-col gap-1 border-b border-[#f4f4f4] px-4 py-2 text-[12px] leading-4 text-[#46494f] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-20">
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1.5">
            <Link to="/categories/all" className="hover:text-[#1a1e26]">
              All Listings
            </Link>
            {isBids ? (
              <>
                <span className="text-[#c8c9cb]">›</span>
                <span className="text-[#1a1e26]">Bids & Auctions</span>
              </>
            ) : (
              <>
                <span className="text-[#c8c9cb]">›</span>
                <span>{lot?.brand || lot?.category || 'Lot'}</span>
                <span className="text-[#c8c9cb]">›</span>
                <span className="text-[#1a1e26]">{lot ? lotDisplayCode(lot.id) : 'Lot'}</span>
              </>
            )}
          </nav>
          {isDetail ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
              <Icon src={icons.location} size={13} />
              <span>Shipping to Wed, GA 30002</span>
              <button type="button" className="font-medium text-[#480516]">
                Edit
              </button>
              <span className="hidden text-[#c8c9cb] sm:inline">·</span>
              <span>Ship time: 9.431 lbs</span>
              <span className="hidden text-[#c8c9cb] sm:inline">·</span>
              <span>Carrier: Old Dominion</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {navOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-[#1a1e26]/40"
            onClick={() => setNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(320px,88vw)] flex-col bg-white shadow-[8px_0_32px_rgba(26,30,38,0.16)] animate-slide-up">
            <div className="flex items-center justify-between border-b border-[#f4f4f4] px-4 py-4">
              <p className="text-[14px] font-semibold text-[#1a1e26]">Menu</p>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full text-[#46494f]"
                aria-label="Close menu"
                onClick={() => setNavOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={categoryTo(cat.slug)}
                  className="flex items-center rounded-xl px-3 py-3 text-[15px] text-[#1a1e26] hover:bg-[#f9f5f6]"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  )
}
