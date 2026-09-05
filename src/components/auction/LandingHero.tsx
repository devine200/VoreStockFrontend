import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/shared/Icon'
import arrowLeft from '@/assets/icons/arrow-left.svg'
import arrowRight from '@/assets/icons/arrow-right.svg'
import heroWarehouse from '@/assets/images/hero-warehouse.jpg'
import heroPallets from '@/assets/images/hero-pallets.jpg'
import heroContainers from '@/assets/images/hero-containers.jpg'
import { cn } from '@/utils/format'

const INTERVAL_MS = 6500

type Slide = {
  id: string
  title: string
  body: string
  cta: string
  to: string
  tone: 'photo' | 'gradient'
  image?: string
  art?: string
}

const SLIDES: Slide[] = [
  {
    id: 'source',
    title: 'Source better. Scale faster.',
    body: 'Buy returned, excess, and trade-in inventory directly from top retailers and brands, across all categories, conditions, and lot sizes.',
    cta: 'Shop all listings',
    to: '/categories/all',
    tone: 'photo',
    image: heroWarehouse,
  },
  {
    id: 'terms',
    title: 'Buy now, pay later with Net Terms',
    body: 'Get 30 days to pay for your orders and unlock exclusive resale inventory only available for buyers using Net Terms.',
    cta: 'Apply for Net Terms',
    to: '/verification',
    tone: 'gradient',
    art: heroPallets,
  },
  {
    id: 'lots',
    title: 'Verified lots. Dock-checked inventory.',
    body: 'Bid on equipment, electronics, and bulk pallets with condition reports and 3PL verification on every listing.',
    cta: 'Browse live auctions',
    to: '/categories/all',
    tone: 'photo',
    image: heroContainers,
  },
]

const LOOP = [SLIDES[SLIDES.length - 1], ...SLIDES, SLIDES[0]]

function SlideView({ slide }: { slide: Slide }) {
  return (
    <article className="relative h-[280px] w-full shrink-0 overflow-hidden sm:h-[360px] lg:h-[420px]">
      {slide.tone === 'photo' && slide.image ? (
        <>
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0e0104]/55" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(90deg, #480516 0%, #6d3745 42%, #dacdd0 100%)',
          }}
        />
      )}

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-center justify-between gap-6 px-12 sm:px-16 lg:px-24">
        <div className="max-w-[560px] shrink">
          <h1 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.5px] text-white sm:text-[36px] sm:tracking-[-1px] lg:text-[44px]">
            {slide.title}
          </h1>
          <p className="mt-3 max-w-[480px] text-[13px] font-normal leading-[1.5] text-white/90 sm:mt-4 sm:text-[16px]">
            {slide.body}
          </p>
          <Link
            to={slide.to}
            className="mt-5 inline-flex h-10 items-center rounded-md bg-[#1a1e26] px-4 text-[13px] font-semibold text-white transition hover:bg-[#060709] sm:mt-6 sm:h-11 sm:px-5 sm:text-[14px]"
          >
            {slide.cta}
          </Link>
        </div>

        {slide.art ? (
          <div className="relative hidden h-[70%] w-[38%] max-w-[420px] shrink-0 overflow-hidden rounded-lg lg:block">
            <img src={slide.art} alt="" className="size-full object-cover" />
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function LandingHero() {
  const [pos, setPos] = useState(1)
  const [animate, setAnimate] = useState(true)
  const hovered = useRef(false)
  const locked = useRef(false)

  const len = SLIDES.length
  const active = ((pos - 1 + len) % len + len) % len

  const go = useCallback((dir: -1 | 1) => {
    if (locked.current) return
    locked.current = true
    setAnimate(true)
    setPos((p) => p + dir)
  }, [])

  useEffect(() => {
    const tick = () => {
      if (hovered.current || document.hidden) return
      go(1)
    }
    const id = window.setInterval(tick, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [go])

  const onTransitionEnd = () => {
    if (pos !== 0 && pos !== len + 1) {
      locked.current = false
      return
    }
    setAnimate(false)
    setPos(pos === 0 ? len : 1)
  }

  useEffect(() => {
    if (animate) return
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setAnimate(true)
        locked.current = false
      })
    })
    return () => window.cancelAnimationFrame(id)
  }, [animate, pos])

  const arrowClass =
    'absolute top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center text-white/70 transition hover:text-white sm:size-12'

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0e0104]"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => {
        hovered.current = true
      }}
      onMouseLeave={() => {
        hovered.current = false
      }}
    >
      <div
        className="flex"
        style={{
          transform: `translateX(-${pos * 100}%)`,
          transition: animate ? 'transform 600ms ease-in-out' : 'none',
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {LOOP.map((slide, i) => (
          <div key={`${slide.id}-${i}`} className="w-full min-w-full shrink-0 basis-full">
            <SlideView slide={slide} />
          </div>
        ))}
      </div>

      <button type="button" className={cn(arrowClass, 'left-1 sm:left-3')} onClick={() => go(-1)} aria-label="Previous slide">
        <Icon src={arrowLeft} size={36} className="[&_img]:brightness-0 [&_img]:invert" />
      </button>
      <button type="button" className={cn(arrowClass, 'right-1 sm:right-3')} onClick={() => go(1)} aria-label="Next slide">
        <Icon src={arrowRight} size={36} className="[&_img]:brightness-0 [&_img]:invert" />
      </button>

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            onClick={() => {
              if (locked.current || i + 1 === pos) return
              locked.current = true
              setAnimate(true)
              setPos(i + 1)
            }}
            className={cn(
              'h-1.5 rounded-full transition',
              i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70',
            )}
          />
        ))}
      </div>
    </section>
  )
}
