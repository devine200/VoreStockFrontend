import { Icon } from '@/components/shared/Icon'
import { cn } from '@/utils/format'
import arrowLeft from '@/assets/icons/arrow-left.svg'
import arrowRight from '@/assets/icons/arrow-right.svg'

function visiblePages(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const shown = new Set<number>([1, total])
  for (let i = current - 1; i <= current + 1; i += 1) {
    if (i >= 1 && i <= total) shown.add(i)
  }
  if (current <= 3) {
    shown.add(2)
    shown.add(3)
    shown.add(4)
  }
  if (current >= total - 2) {
    shown.add(total - 3)
    shown.add(total - 2)
    shown.add(total - 1)
  }

  const sorted = [...shown].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const items: Array<number | 'ellipsis'> = []
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) items.push('ellipsis')
    items.push(sorted[i])
  }
  return items
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  total,
  onPage,
}: {
  page: number
  pageCount: number
  pageSize: number
  total: number
  onPage: (page: number) => void
}) {
  if (total === 0 || pageCount < 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const items = visiblePages(page, pageCount)

  return (
    <div className="flex flex-col gap-3 sm:h-[60px] sm:flex-row sm:items-end sm:justify-between">
      <p className="text-[14px] font-normal leading-[1.5] text-[#46494f]">
        Showing {from}-{to} of {total} results
      </p>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none sm:gap-3">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full border border-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <Icon src={arrowLeft} size={18} />
        </button>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-1 text-[#46494f]">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPage(item)}
              className={cn(
                'flex size-9 items-center justify-center rounded-full text-[14px]',
                item === page ? 'bg-[#480516] text-white' : 'text-[#46494f]',
              )}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full border border-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          <Icon src={arrowRight} size={18} />
        </button>
      </div>
    </div>
  )
}
