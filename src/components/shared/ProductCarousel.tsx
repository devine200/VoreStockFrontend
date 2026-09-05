import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
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
  const scrollerRef = useRef<HTMLDivElement>(null)
  const snapTimer = useRef<number>(0)
  const drag = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: false,
    pointerId: -1,
  })

  const [index, setIndex] = useState(0)
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean) as ReactNode[]
  const shown = useCarouselVisible(visible)
  const isXl = useMediaQuery('(min-width: 1280px)')
  const maxIndex = Math.max(0, items.length - shown)
  const compactArrows = !isXl
  const itemBasis = `calc((100% - ${(shown - 1) * gap}px) / ${shown})`

  const itemStep = useCallback(() => {
    const el = scrollerRef.current
    const first = el?.querySelector<HTMLElement>('[data-carousel-item]')
    if (!first) return 0
    return first.offsetWidth + gap
  }, [gap])

  const pauseSnap = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    el.style.scrollSnapType = 'none'
    window.clearTimeout(snapTimer.current)
    snapTimer.current = window.setTimeout(() => {
      if (drag.current.active) return
      el.style.scrollSnapType = ''
    }, 90)
  }, [])

  const syncIndex = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const step = itemStep()
    if (step <= 0) return
    const next = Math.round(el.scrollLeft / step)
    setIndex(Math.min(maxIndex, Math.max(0, next)))
  }, [itemStep, maxIndex])

  const slideBy = (dir: -1 | 1) => {
    const el = scrollerRef.current
    const step = itemStep()
    if (!el || step <= 0) return
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (delta === 0) return
      const max = el.scrollWidth - el.clientWidth
      const next = el.scrollLeft + delta
      const canScroll = (delta > 0 && el.scrollLeft < max - 1) || (delta < 0 && el.scrollLeft > 1)
      if (!canScroll) return
      event.preventDefault()
      pauseSnap()
      el.scrollLeft += delta
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      window.clearTimeout(snapTimer.current)
    }
  }, [pauseSnap])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const step = itemStep()
    if (step <= 0) return
    const next = Math.min(maxIndex, Math.round(el.scrollLeft / step))
    el.scrollTo({ left: next * step })
  }, [itemStep, maxIndex, shown])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || event.button !== 0) return
    if ((event.target as HTMLElement).closest('button')) return
    const el = scrollerRef.current
    if (!el) return
    drag.current = {
      active: true,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      moved: false,
      pointerId: event.pointerId,
    }
    el.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return
    const el = scrollerRef.current
    if (!el) return
    const dx = event.clientX - drag.current.startX
    if (Math.abs(dx) > 5) {
      drag.current.moved = true
      pauseSnap()
      el.style.cursor = 'grabbing'
    }
    if (drag.current.moved) {
      el.scrollLeft = drag.current.startScroll - dx
    }
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current
    if (!drag.current.active) return
    drag.current.active = false
    if (el) {
      el.style.cursor = ''
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId)
    }
    window.clearTimeout(snapTimer.current)
    snapTimer.current = window.setTimeout(() => {
      if (el) el.style.scrollSnapType = ''
    }, 16)
  }

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!drag.current.moved) return
    event.preventDefault()
    event.stopPropagation()
    drag.current.moved = false
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scrollerRef}
        className="-mx-1 flex cursor-grab snap-x snap-mandatory overflow-x-auto overflow-y-hidden px-1 py-3 select-none scrollbar-none overscroll-x-contain"
        style={{ gap: `${gap}px` }}
        onScroll={syncIndex}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {items.map((child, i) => (
          <div
            key={i}
            data-carousel-item
            className="flex shrink-0 snap-start flex-col [&>*]:h-full [&>*]:min-h-0"
            style={{ flexBasis: itemBasis, width: itemBasis }}
          >
            {child}
          </div>
        ))}
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
