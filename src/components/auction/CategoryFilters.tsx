import { useState } from 'react'
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
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          className={i < filled ? 'text-[#f2bc1b]' : 'text-[#c8c9cb]'}
        >
          <path
            d="M7 1.2l1.54 3.12 3.44.5-2.49 2.43.59 3.43L7 9.16l-3.08 1.62.59-3.43L2.02 4.82l3.44-.5L7 1.2z"
            fill="currentColor"
          />
        </svg>
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

export type CategoryFilterState = {
  category: string | null
  condition: string
  maxPrice: number
  reviews: number[]
}

export const DEFAULT_CATEGORY_FILTERS: CategoryFilterState = {
  category: null,
  condition: 'Review Count',
  maxPrice: 50000,
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
  onApplyPrice: (maxPrice: number) => void
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({ Condition: true })
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
        <h2 className="text-[16px] font-medium leading-[1.5] text-[#060709]">Filter by Price</h2>
        <div className="mt-5">
          <div className="relative h-12 w-full max-w-[272px]">
            <div className="absolute bottom-[3px] left-0 right-0 h-0.5 rounded-full bg-[#f4f4f4]">
              <div className="h-full rounded-full bg-[#060709]" style={{ width: `${(draftMax / 50000) * 100}%` }} />
            </div>
            <div className="flex justify-between">
              <span className="inline-flex h-7 items-center rounded-full bg-[#f4f4f4] px-2.5 text-[12px] leading-[1.5] text-[#1a1e26]">
                $0
              </span>
              <span className="inline-flex h-7 items-center rounded-full bg-[#f4f4f4] px-2.5 text-[12px] leading-[1.5] text-[#1a1e26]">
                ${draftMax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50000}
              step={100}
              value={draftMax}
              onChange={(e) => setDraftMax(Number(e.target.value))}
              className="absolute bottom-0 left-0 w-full cursor-pointer accent-[#060709]"
              aria-label="Maximum price"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onChange({ ...value, maxPrice: draftMax })
              onApplyPrice(draftMax)
            }}
            className="mt-6 inline-flex h-10 w-[103px] items-center justify-center rounded-full bg-[#480516] text-[14px] font-medium leading-[1.5] text-white"
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
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
                      <path
                        d="M1 4l2.5 2.5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
          setDraftMax(50000)
          onClear()
        }}
        className="mt-5 inline-flex h-10 w-fit items-center justify-center rounded-full bg-[#dacdd0] px-8 text-[14px] font-normal leading-[1.5] text-[#480516]"
      >
        Clear Filters
      </button>
    </aside>
  )
}
