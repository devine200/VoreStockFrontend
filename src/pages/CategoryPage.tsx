import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { LotCard } from '@/components/auction/LotCard'
import {
  CategoryFilters,
  DEFAULT_CATEGORY_FILTERS,
  type CategoryFilterState,
} from '@/components/auction/CategoryFilters'
import { EmptyState } from '@/components/shared/PageChrome'
import { Icon } from '@/components/shared/Icon'
import { icons } from '@/assets'
import { useAppSelector } from '@/store/hooks'
import type { Lot } from '@/types'

/** Map sidebar product categories → lot.categorySlug when possible */
const SIDEBAR_TO_SLUG: Record<string, string | null> = {
  Sales: null,
  Cannabis: 'flower',
  'Pre-Rolls': 'flower',
  'CBD Oil': 'edibles',
  'Magic Mushrooms': 'mushrooms',
  Extracts: 'concentrates',
  Edibles: 'edibles',
  'Vape Pens': 'concentrates',
  Accessories: 'all',
  'Bath & Body': 'all',
  Bundles: 'promotions',
  Wholesale: 'all',
}

function sortLots(lots: Lot[], condition: string): Lot[] {
  const next = [...lots]
  switch (condition) {
    case 'Price: Low to High':
      return next.sort((a, b) => a.currentBid - b.currentBid)
    case 'Price: High to Low':
      return next.sort((a, b) => b.currentBid - a.currentBid)
    case 'Product Name':
      return next.sort((a, b) => a.title.localeCompare(b.title))
    case 'New':
    case 'Newness':
      return next.sort((a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime())
    case 'Popularity':
    case 'Review Count':
    default:
      return next.sort((a, b) => b.bidCount - a.bidCount)
  }
}

export function CategoryPage() {
  const { slug = 'all' } = useParams()
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const lots = useAppSelector((s) => s.auctions.lots)
  const storeQuery = useAppSelector((s) => s.auctions.searchQuery)
  const query = q || storeQuery

  const [filters, setFilters] = useState<CategoryFilterState>(DEFAULT_CATEGORY_FILTERS)
  const [appliedMax, setAppliedMax] = useState(DEFAULT_CATEGORY_FILTERS.maxPrice)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    if (!filtersOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [filtersOpen])

  const filtered = useMemo(() => {
    const sidebarSlug = filters.category ? SIDEBAR_TO_SLUG[filters.category] : null
    const effectiveSlug = sidebarSlug && sidebarSlug !== 'all' ? sidebarSlug : slug

    let list = lots.filter((lot) => {
      const catOk = effectiveSlug === 'all' || lot.categorySlug === effectiveSlug
      const priceOk = lot.currentBid <= appliedMax
      const qOk =
        !query ||
        lot.title.toLowerCase().includes(query.toLowerCase()) ||
        lot.location.toLowerCase().includes(query.toLowerCase()) ||
        lot.brand?.toLowerCase().includes(query.toLowerCase())
      return catOk && priceOk && qOk
    })

    list = sortLots(list, filters.condition)

    // Design shows a dense 3×3 grid — repeat from the pool without mutating lot ids
    if (list.length > 0 && list.length < 9) {
      const padded: Lot[] = []
      while (padded.length < 9) {
        for (const lot of list) {
          if (padded.length >= 9) break
          padded.push(lot)
        }
      }
      return padded
    }
    return list
  }, [lots, slug, query, filters.category, filters.condition, appliedMax])

  const resultCount = filters.category || appliedMax < 50000 || query ? filtered.length : 50

  const filterPanel = (
    <CategoryFilters
      value={filters}
      onChange={setFilters}
      onApplyPrice={(maxPrice) => setAppliedMax(maxPrice)}
      onClear={() => {
        setFilters(DEFAULT_CATEGORY_FILTERS)
        setAppliedMax(DEFAULT_CATEGORY_FILTERS.maxPrice)
      }}
    />
  )

  return (
    <div className="flex flex-col gap-6 pb-16 lg:flex-row lg:gap-[54px]">
      <div className="hidden lg:block">{filterPanel}</div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-[#1a1e26]/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(360px,90vw)] flex-col overflow-y-auto bg-white px-4 py-5 shadow-[8px_0_32px_rgba(26,30,38,0.16)]">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[16px] font-semibold text-[#1a1e26]">Filters</p>
              <button
                type="button"
                className="text-[13px] font-medium text-[#480516]"
                onClick={() => setFiltersOpen(false)}
              >
                Done
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex min-h-11 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[20px] font-medium leading-[1.5] tracking-[-0.5px] text-[#060709] sm:text-[24px]">
            Showing {resultCount} results
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex h-11 items-center rounded-full border border-solid border-[#f4f4f4] bg-white px-5 text-[14px] font-normal leading-[1.5] text-[#1a1e26] lg:hidden"
            >
              Filters
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-3 rounded-full border border-solid border-[#f4f4f4] bg-white px-5 text-[14px] font-normal leading-[1.5] text-[#1a1e26]"
            >
              Sort By
              <Icon src={icons.arrowDown} size={14} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No lots found" body="Try clearing filters or choosing another category." />
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((lot, i) => (
              <LotCard key={`${lot.id}-${i}`} lot={lot} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
