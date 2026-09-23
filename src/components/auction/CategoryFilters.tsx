import { useEffect, useRef, useState } from 'react'
import { icons } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import { cn } from '@/utils/format'

const PRODUCT_CATEGORIES = [
  { label: 'Sales', count: 12 },
  { label: 'Cannabis', count: 430 },
  { label: 'Pre-Rolls', count: 40 },
  { label: 'CBD Oil', count: 20 },
  { label: 'Magic Mushrooms', count: 34 },
  { label: 'Extracts', count: 26 },
  { label: 'Edibles', count: 32 },
  { label: 'Vape Pens', count: 12 },
  { label: 'Accessories', count: 10 },
  { label: 'Bath & Body', count: 8 },
  { label: 'Bundles', count: 24 },
  { label: 'Wholesale', count: 28 },
] as const

const CONDITION_OPTIONS = [
  'New',
  'Review Count',
  'Popularity',
  'Average Rating',
  'Newness',
  'Price: Low to High',
  'Price: High to Low',
  'Random Products',
  'Product Name',
] as const

const ACCORDIONS = ['Model', 'Manufacturer', 'Capacity', 'Current Bid', 'Listing Type', 'Number of units'] as const

function StarRow({ filled }: { filled: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          src={icons.star}
          size={14}
          className={i < filled ? '' : 'opacity-30'}
        />
      ))}
    </span>
  )
}

function RadioRow({
  label,
  selected,
  onSelect,
  count,
}: {
  label: string
  selected: boolean
  onSelect: () => void
  count?: number
}) {
  return (
    <button type="button" onClick={onSelect} className="flex w-full items-center gap-0 text-left">
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-[#480516]' : 'border-[#c8c9cb]',
        )}
      >
        {selected ? <span className="size-2 rounded-full bg-[#480516]" /> : null}
      </span>
      <span className="ml-3 text-[14px] font-normal leading-[1.5] text-[#1a1e26]">{label}</span>
      {typeof count === 'number' ? (
        <>
          <span className="mx-2 h-[11px] w-px bg-[#c8c9cb]" />
          <span className="text-[14px] leading-[1.5] text-[#7a7b7c]">{count}</span>
        </>
      ) : null}
    </button>
  )
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('border-b border-[#f4f4f4] pb-5', className)}>{children}</section>
  )
}

const PRICE_MIN = 0
const PRICE_MAX = 50_000
const PRICE_STEP = 100

function formatFilterPrice(n: number) {
  if (n === 0) return '$0'
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function PriceRangeSlider({
  lo,
  hi,
  onLo,
  onHi,
}: {
  lo: number
  hi: number
  onLo: (n: number) => void
  onHi: (n: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef<'lo' | 'hi' | null>(null)
  const loRef = useRef(lo)
  const hiRef = useRef(hi)
  loRef.current = lo
  hiRef.current = hi

  const span = PRICE_MAX - PRICE_MIN
  const thumbLeft = (v: number) => `calc((100% - 8px) * ${(v - PRICE_MIN) / span})`

  const valueFromX = (clientX: number) => {
    const el = trackRef.current
    if (!el) return PRICE_MIN
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const raw = PRICE_MIN + ratio * span
    return Math.round(raw / PRICE_STEP) * PRICE_STEP
  }

  useEffect(() => {
    const move = (clientX: number) => {
      if (!drag.current) return
      const v = valueFromX(clientX)
      if (drag.current === 'lo') onLo(Math.min(v, hiRef.current))
      else onHi(Math.max(v, loRef.current))
    }
    const onPointerMove = (e: PointerEvent) => move(e.clientX)
    const onMouseMove = (e: MouseEvent) => move(e.clientX)
    const up = () => {
      drag.current = null
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('pointerup', up)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('mouseup', up)
    }
  }, [onHi, onLo])

  const startDrag = (which: 'lo' | 'hi') => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    drag.current = which
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.track) return
    const v = valueFromX(e.clientX)
    const mid = (lo + hi) / 2
    if (v <= mid) {
      drag.current = 'lo'
      onLo(Math.min(v, hi))
    } else {
      drag.current = 'hi'
      onHi(Math.max(v, lo))
    }
  }

  const knobClass =
    'absolute top-9 z-[1] flex size-4 cursor-grab items-center justify-center p-0 active:cursor-grabbing'

  return (
    <div className="relative h-12 w-full max-w-[272px] select-none">
      <div
        ref={trackRef}
        data-track="true"
        className="absolute top-9 right-0 left-0 h-4 cursor-pointer"
        onPointerDown={onTrackPointerDown}
      >
        <div data-track="true" className="absolute top-[7px] right-0 left-0 h-0.5 rounded-full bg-[#f4f4f4]">
          <div
            data-track="true"
            className="absolute top-0 h-0.5 rounded-full bg-[#060709]"
            style={{
              left: `${((lo - PRICE_MIN) / span) * 100}%`,
              width: `${((hi - lo) / span) * 100}%`,
            }}
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute top-0 flex flex-col items-start gap-3"
        style={{ left: thumbLeft(lo) }}
      >
        <span className="inline-flex h-7 items-center rounded-full bg-[#f4f4f4] px-2.5 text-[12px] leading-[1.5] text-[#060709]">
          {formatFilterPrice(lo)}
        </span>
      </div>
      <div
        className="pointer-events-none absolute top-0 flex flex-col items-end gap-3"
        style={{ left: thumbLeft(hi), transform: 'translateX(calc(-100% + 8px))' }}
      >
        <span className="inline-flex h-7 items-center rounded-full bg-[#f4f4f4] px-2.5 text-[12px] leading-[1.5] whitespace-nowrap text-[#060709]">
          {formatFilterPrice(hi)}
        </span>
      </div>

      <button
        type="button"
        aria-label="Minimum price"
        className={cn(knobClass, 'z-[1]')}
        style={{ left: thumbLeft(lo), marginLeft: '-4px' }}
        onPointerDown={startDrag('lo')}
      >
        <span className="size-2 rounded-full border-2 border-solid border-[#1a1e26] bg-white shadow-[0px_4px_8px_rgba(0,0,0,0.1)]" />
      </button>
      <button
        type="button"
        aria-label="Maximum price"
        className={cn(knobClass, 'z-[2]')}
        style={{ left: thumbLeft(hi), marginLeft: '-4px' }}
        onPointerDown={startDrag('hi')}
      >
        <span className="size-2 rounded-full border-2 border-solid border-[#1a1e26] bg-white shadow-[0px_4px_8px_rgba(0,0,0,0.1)]" />
      </button>
    </div>
  )
}

export type CategoryFilterState = {
  category: string | null
  condition: string
  minPrice: number
  maxPrice: number
  reviews: number[]
}

export const DEFAULT_CATEGORY_FILTERS: CategoryFilterState = {
  category: null,
  condition: 'Review Count',
  minPrice: PRICE_MIN,
  maxPrice: PRICE_MAX,
  reviews: [],
}

export function CategoryFilters({
  value,
  onChange,
  onClear,
  onApplyPrice,
}: {
  value: CategoryFilterState
  onChange: (next: CategoryFilterState) => void
  onClear: () => void
  onApplyPrice: (range: { minPrice: number; maxPrice: number }) => void
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({ Condition: true })
  const [draftMin, setDraftMin] = useState(value.minPrice)
  const [draftMax, setDraftMax] = useState(value.maxPrice)

  const toggleAccordion = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleReview = (n: number) => {
    const has = value.reviews.includes(n)
    onChange({
      ...value,
      reviews: has ? value.reviews.filter((r) => r !== n) : [...value.reviews, n].sort((a, b) => b - a),
    })
  }

  return (
    <aside className="flex w-full flex-col px-1 lg:w-[304px] lg:shrink-0 lg:px-3">
      <Section>
        <h2 className="text-[16px] font-medium leading-[1.5] text-[#060709]">Product Category</h2>
        <div className="mt-5 flex flex-col gap-3">
          {PRODUCT_CATEGORIES.map((item) => (
            <RadioRow
              key={item.label}
              label={item.label}
              count={item.count}
              selected={value.category === item.label}
              onSelect={() =>
                onChange({
                  ...value,
                  category: value.category === item.label ? null : item.label,
                })
              }
            />
          ))}
        </div>
      </Section>

      <Section className="pt-5">
        <h2 className="text-[20px] font-semibold leading-[1.2] tracking-[-1.5px] text-[#1a1e26]">
          Filter by Price
        </h2>
        <div className="mt-5 flex flex-col gap-6">
          <PriceRangeSlider lo={draftMin} hi={draftMax} onLo={setDraftMin} onHi={setDraftMax} />
          <button
            type="button"
            onClick={() => {
              onChange({ ...value, minPrice: draftMin, maxPrice: draftMax })
              onApplyPrice({ minPrice: draftMin, maxPrice: draftMax })
            }}
            className="inline-flex h-10 w-[103px] items-center justify-center rounded-full bg-[#480516] px-8 text-[14px] font-normal leading-[1.5] text-white"
          >
            Apply
          </button>
        </div>
      </Section>

      <Section className="pt-5">
        <button
          type="button"
          className="flex w-full items-center justify-between"
          onClick={() => toggleAccordion('Condition')}
        >
          <h2 className="text-[16px] font-medium leading-[1.5] text-[#060709]">Condition</h2>
          <Icon
            src={icons.arrowDown}
            size={14}
            className={cn('transition', open.Condition ? 'rotate-180' : '')}
          />
        </button>
        {open.Condition ? (
          <div className="mt-5 flex flex-col gap-3">
            {CONDITION_OPTIONS.map((opt) => (
              <RadioRow
                key={opt}
                label={opt}
                selected={value.condition === opt}
                onSelect={() => onChange({ ...value, condition: opt })}
              />
            ))}
          </div>
        ) : null}
      </Section>

      {ACCORDIONS.map((title) => (
        <Section key={title} className="pt-5">
          <button
            type="button"
            className="flex h-6 w-full items-center justify-between"
            onClick={() => toggleAccordion(title)}
          >
            <span className="text-[16px] font-medium leading-[1.5] text-[#060709]">{title}</span>
            <Icon
              src={icons.arrowDown}
              size={14}
              className={cn('transition', open[title] ? 'rotate-180' : '')}
            />
          </button>
          {open[title] ? (
            <p className="mt-3 text-[13px] leading-[1.5] text-[#7a7b7c]">No options in this demo.</p>
          ) : null}
        </Section>
      ))}

      <Section className="border-b-0 pb-0 pt-5">
        <h2 className="text-[12px] font-semibold uppercase leading-[1.5] tracking-[0.04em] text-[#9d9ea2]">
          FILTER BY REVIEWS
        </h2>
        <div className="mt-5 flex flex-col gap-4">
          {[5, 4, 3, 2, 1].map((n) => {
            const checked = value.reviews.includes(n)
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggleReview(n)}
                className="flex items-center gap-3"
                aria-label={`${n} star reviews`}
              >
                <span
                  className={cn(
                    'flex size-[22px] items-center justify-center rounded border',
                    checked ? 'border-[#480516] bg-[#480516] text-white' : 'border-[#c8c9cb] bg-white',
                  )}
                >
                  {checked ? (
                    <Icon src={icons.check} size={10} />
                  ) : null}
                </span>
                <StarRow filled={n} />
              </button>
            )
          })}
        </div>
      </Section>

      <button
        type="button"
        onClick={() => {
          setDraftMin(PRICE_MIN)
          setDraftMax(PRICE_MAX)
          onClear()
        }}
        className="mt-5 inline-flex h-10 w-fit items-center justify-center rounded-full bg-[#dacdd0] px-8 text-[14px] font-normal leading-[1.5] text-[#480516]"
      >
        Clear Filters
      </button>
    </aside>
  )
}
