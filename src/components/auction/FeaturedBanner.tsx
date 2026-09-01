import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Lot } from '@/types'
import { Icon } from '@/components/shared/Icon'
import arrowLeft from '@/assets/icons/arrow-left.svg'
import arrowRight from '@/assets/icons/arrow-right.svg'
import lotGummies from '@/assets/images/lot-gummies.png'
import { cn } from '@/utils/format'

type Slide = {
  slug: string
  image: string
  category: string
  title: string
  bids: number
  closes: string
  price: string
  compareAt: string
}

const FALLBACK_SLIDES: Omit<Slide, 'slug' | 'image'>[] = [
  {
    category: 'CONCENTRATES',
    title: 'Mix And Match Shatter/Budder 28g (4 X 7G)',
    bids: 67,
    closes: '7H',
    price: '₦102.00',
    compareAt: '₦200.00',
  },
  {
    category: 'FLOWER',
    title: '2 Oz Deal Watermelon Zkittles + Purple Gushers',
    bids: 40,
    closes: '12H',
    price: '₦250.00',
    compareAt: '₦400.00',
  },
  {
    category: 'EDIBLES',
    title: 'Full Spectrum CBD Tincture 1000mg — 24-Unit Case',
    bids: 28,
    closes: '18H',
    price: '₦89.00',
    compareAt: '₦150.00',
  },
  {
    category: 'PROMOTIONS',
    title: 'Premium Concentrate Bundle — Mixed SKUs',
    bids: 55,
    closes: '9H',
    price: '₦175.00',
    compareAt: '₦320.00',
  },
]

function toSlides(lots: Lot[]): Slide[] {
  return FALLBACK_SLIDES.map((meta, i) => {
    const lot = lots[i % Math.max(lots.length, 1)]
    return {
      ...meta,
      slug: lot?.slug ?? 'all',
      image: lot?.image || lotGummies,
    }
  })
}

export function FeaturedBanner({ lots }: { lots: Lot[] }) {
  const slides = useMemo(() => toSlides(lots), [lots])
  const [index, setIndex] = useState(0)

  const go = (next: number) => {
    const len = slides.length
    setIndex(((next % len) + len) % len)
  }

  return (
    <section className="relative w-full overflow-visible rounded-2xl bg-[#480516] px-5 py-8 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-14">
      <div className="flex flex-col-reverse items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="relative min-h-0 w-full max-w-[341px] overflow-hidden lg:min-h-[303px]">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((s) => (
              <div key={s.title} className="w-full shrink-0">
                <p className="text-[14px] font-normal uppercase leading-[1.5] tracking-[0.04em] text-[#dacdd0]">
                  {s.category}
                </p>
                <h2 className="mt-4 text-[24px] font-semibold leading-[1.2] tracking-[-1px] text-white sm:text-[32px] sm:tracking-[-1.5px]">
                  {s.title}
                </h2>
                <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8">
                  <span className="inline-flex h-8 items-center rounded border border-white/25 px-2.5 text-[12px] leading-[1.5] text-[#dacdd0]">
                    {s.bids} Bids
                  </span>
                  <span className="inline-flex h-8 items-center rounded border border-white/25 px-2.5 text-[12px] leading-[1.5] text-[#dacdd0]">
                    Closes in {s.closes}
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8 sm:gap-8">
                  <Link
                    to={`/lots/${s.slug}`}
                    className="inline-flex h-12 w-[106px] items-center justify-center rounded-full bg-[#2e030e] text-[16px] font-medium text-white sm:h-14"
                  >
                    Bid
                  </Link>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[20px] font-medium leading-[30px] text-[#f2bc1b]">{s.price}</span>
                    <span className="text-[14px] text-white/50 line-through">{s.compareAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full max-w-[373px] shrink-0">
          <div className="relative flex h-[240px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#5c1a2a] sm:h-[322px]">
            <div
              className="flex h-full w-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {slides.map((s) => (
                <div
                  key={`img-${s.title}`}
                  className="flex h-full w-full shrink-0 items-center justify-center"
                >
                  <img src={s.image} alt="" className="size-[200px] object-contain sm:size-[300px]" />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => go(index - 1)}
            className="absolute top-1/2 left-2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0px_4px_8px_rgba(0,0,0,0.15)] lg:left-0 lg:-translate-x-[calc(100%+8px)]"
            aria-label="Previous featured"
          >
            <Icon src={arrowLeft} size={16} />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="absolute top-1/2 right-2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0px_4px_8px_rgba(0,0,0,0.15)] lg:right-0 lg:translate-x-[calc(100%+8px)]"
            aria-label="Next featured"
          >
            <Icon src={arrowRight} size={16} />
          </button>

          <div className="mt-4 flex justify-center gap-3.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                className={cn(
                  'size-1.5 rounded-full transition',
                  i === index ? 'bg-white' : 'bg-white/30 hover:bg-white/50',
                )}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
