import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '@/components/shared/Icon'
import arrowLeft from '@/assets/icons/arrow-left.svg'
import arrowRight from '@/assets/icons/arrow-right.svg'
import { useCarouselVisible, useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/format'

type ProductCarouselProps = {
  children: ReactNode | ReactNode[]
  /** Visible items in the viewport (desktop) */
  visible?: number
  /** Gap between items in px (matches gap-8 = 32) */
  gap?: number
  className?: string
}

export function ProductCarousel({
  children,
  visible = 3,
  gap = 32,
  className,
}: ProductCarouselProps) {
  const [index, setIndex] = useState(0)
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean) as ReactNode[]
  const shown = useCarouselVisible(visible)
  const isXl = useMediaQuery('(min-width: 1280px)')
  const maxIndex = Math.max(0, items.length - shown)
  const compactArrows = !isXl

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex))
  }, [maxIndex])

  const slideBy = (dir: -1 | 1) => {
    setIndex((i) => Math.min(maxIndex, Math.max(0, i + dir)))
  }

  const itemBasis = `calc((100% - ${(shown - 1) * gap}px) / ${shown})`
  const offset = `calc(-${index} * (${itemBasis} + ${gap}px))`

  return (
    <div className={cn('relative', className)}>
      <div className="overflow-hidden">
        <div
          className="flex items-stretch transition-transform duration-300 ease-out"
          style={{
            gap: `${gap}px`,
            transform: `translateX(${offset})`,
          }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              className="flex shrink-0 flex-col [&>*]:h-full [&>*]:min-h-0"
              style={{ flexBasis: itemBasis, width: itemBasis }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={index <= 0}
        onClick={() => slideBy(-1)}
        className={cn(
          'absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0px_6px_8px_rgba(0,0,0,0.12)] transition disabled:cursor-default disabled:opacity-40',
          compactArrows ? 'left-2' : 'left-0 -translate-x-[calc(100%+12px)]',
        )}
        aria-label="Previous"
      >
        <Icon src={arrowLeft} size={20} />
      </button>
      <button
        type="button"
        disabled={index >= maxIndex}
        onClick={() => slideBy(1)}
        className={cn(
          'absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0px_6px_8px_rgba(0,0,0,0.12)] transition disabled:cursor-default disabled:opacity-40',
          compactArrows ? 'right-2' : 'right-0 translate-x-[calc(100%+12px)]',
        )}
        aria-label="Next"
      >
        <Icon src={arrowRight} size={20} />
      </button>
    </div>
  )
}
