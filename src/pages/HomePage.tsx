import { Link } from 'react-router-dom'
import type { Lot } from '@/types'
import { LotCard } from '@/components/auction/LotCard'
import { FeaturedBanner } from '@/components/auction/FeaturedBanner'
import { ProductCarousel } from '@/components/shared/ProductCarousel'
import { icons } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import { useAppSelector } from '@/store/hooks'
import cardPattern from '@/assets/images/card-pattern.svg'
import lotGummies from '@/assets/images/lot-gummies.png'
import arrowLeft from '@/assets/icons/arrow-left.svg'
import arrowRight from '@/assets/icons/arrow-right.svg'

const CATEGORY_TILES = [
  { label: 'FLOWER', slug: 'flower' },
  { label: 'EDIBLES', slug: 'edibles' },
  { label: 'CONCENTRATES', slug: 'concentrates' },
  { label: 'MUSHROOMS', slug: 'mushrooms' },
  { label: 'PROMOTIONS', slug: 'promotions' },
  { label: 'WHOLESALE', slug: 'all' },
  { label: 'BUNDLES', slug: 'promotions' },
  { label: 'EXTRACTS', slug: 'concentrates' },
] as const

function SortButton() {
  return (
    <button
      type="button"
      className="inline-flex h-11 items-center gap-3 rounded-full border border-solid border-[#f4f4f4] bg-white px-5 text-[14px] font-normal leading-[1.5] text-[#1a1e26]"
    >
      Short By Lates
      <Icon src={icons.arrowDown} size={14} />
    </button>
  )
}

function PanelHeader({ title, action }: { title: string; action: React.ReactNode }) {
  return (
    <div className="mb-6 flex min-h-11 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-[20px] font-medium leading-[1.5] tracking-[-0.5px] text-[#060709] sm:text-[24px]">{title}</h2>
      {action}
    </div>
  )
}

/** Enough items so arrow slides have somewhere to go */
function extendLots(lots: Lot[], min = 9): Lot[] {
  if (lots.length === 0) return lots
  const out: Lot[] = []
  let i = 0
  while (out.length < min) {
    out.push(lots[i % lots.length])
    i += 1
  }
  return out
}

function TopProductsPanel({ lots }: { lots: Lot[] }) {
  const slides = extendLots(lots, 9)
  return (
    <section className="relative w-full overflow-visible rounded-2xl bg-[#dacdd0] px-4 py-5 sm:px-8 sm:py-6">
      <PanelHeader title="Top Products" action={<SortButton />} />
      <ProductCarousel visible={3} gap={32}>
        {slides.map((lot, i) => (
          <LotCard key={`top-${lot.id}-${i}`} lot={lot} />
        ))}
      </ProductCarousel>
    </section>
  )
}

function RecommendedPanel({ lots }: { lots: Lot[] }) {
  const slides = extendLots(lots, 9)
  return (
    <section className="relative w-full overflow-visible py-6">
      <PanelHeader title="Recommended" action={<SortButton />} />
      <ProductCarousel visible={3} gap={32}>
        {slides.map((lot, i) => (
          <LotCard key={`rec-${lot.id}-${i}`} lot={lot} />
        ))}
      </ProductCarousel>
    </section>
  )
}

function CategoryTile({ label, slug }: { label: string; slug: string }) {
  return (
    <Link to={`/categories/${slug}`} className="flex w-full flex-col gap-4 bg-white">
      <div className="relative flex h-[240px] w-full items-center justify-center overflow-hidden rounded-lg bg-[#f4f4f4]">
        <img
          src={cardPattern}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[131px] h-[186px] w-[369px] max-w-none -translate-x-1/2"
        />
        <img src={lotGummies} alt="" className="relative z-[1] size-[164px] object-cover" />
      </div>
      <p className="text-center text-[14px] font-light leading-[1.5] text-[#9d9ea2]">{label}</p>
    </Link>
  )
}

export function HomePage() {
  const lots = useAppSelector((s) => s.auctions.lots)
  const top = lots.slice(0, 3)
  const rec1 = lots.slice(1, 4)
  const rec2 = lots.slice(2, 5)

  return (
    <div className="flex w-full flex-col gap-14">
      <TopProductsPanel lots={top} />
      <RecommendedPanel lots={rec1} />
      <RecommendedPanel lots={rec2} />

      <section className="relative w-full overflow-visible rounded-2xl px-0 py-6 sm:px-8">
        <PanelHeader
          title="Bid by Categories"
          action={
            <Link
              to="/categories/all"
              className="inline-flex h-11 items-center rounded-full border border-solid border-[#f4f4f4] bg-white px-5 text-[14px] font-normal leading-[1.5] text-[#1a1e26]"
            >
              View all
            </Link>
          }
        />
        <ProductCarousel visible={5} gap={32}>
          {CATEGORY_TILES.map((tile) => (
            <CategoryTile key={tile.label} label={tile.label} slug={tile.slug} />
          ))}
        </ProductCarousel>
      </section>

      <div className="flex flex-col gap-12">
        <FeaturedBanner lots={lots} />

        <div className="flex flex-col gap-3 sm:h-[60px] sm:flex-row sm:items-end sm:justify-between">
          <p className="text-[14px] font-normal leading-[1.5] text-[#46494f]">Showing 1-30 of 393 results</p>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none sm:gap-3">
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full border border-[#f4f4f4]"
              aria-label="Prev page"
            >
              <Icon src={arrowLeft} size={18} />
            </button>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                className={`flex size-9 items-center justify-center rounded-full text-[14px] ${
                  n === 1 ? 'bg-[#480516] text-white' : 'text-[#46494f]'
                }`}
              >
                {n}
              </button>
            ))}
            <span className="px-1 text-[#46494f]">...</span>
            <button type="button" className="flex size-9 items-center justify-center rounded-full text-[14px] text-[#46494f]">
              55
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full border border-[#f4f4f4]"
              aria-label="Next page"
            >
              <Icon src={arrowRight} size={18} />
            </button>
          </div>
        </div>
      </div>

      <section className="relative z-10 mb-[-80px] w-full max-w-[1200px] self-center rounded-2xl bg-[#dacdd0] px-5 py-10 sm:mb-[-100px] sm:px-10 sm:py-12 lg:mb-[-120px] lg:px-16 lg:py-16">
        <h2 className="max-w-[789px] text-[32px] font-semibold leading-[1.1] tracking-[-1px] text-[#060709] sm:text-[44px] sm:tracking-[-2px] lg:text-[64px] lg:tracking-[-4px]">
          UNLOCK 20% OFF YOUR FIRST BID
        </h2>
        <p className="mt-4 text-[16px] font-normal leading-[1.5] text-[#1a1e26] sm:mt-6 sm:text-[20px]">
          Reveal coupon code by entering your email
        </p>
        <div className="mt-6 h-px w-full max-w-[1072px] bg-[#1a1e26]/15 sm:mt-8" />
        <div className="mt-6 flex max-w-[1072px] flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-8">
          <input
            type="email"
            placeholder="Email Address"
            className="h-14 w-full flex-1 rounded-full border-0 bg-white px-6 text-[16px] text-[#1a1e26] outline-none placeholder:text-[#9d9ea2] sm:h-[72px] sm:px-11"
          />
          <button
            type="button"
            className="h-14 w-full shrink-0 rounded-full bg-[#480516] text-[16px] font-medium text-white sm:h-[72px] sm:w-[205px]"
          >
            Reveal coupon
          </button>
        </div>
      </section>
    </div>
  )
}
