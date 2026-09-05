import { Link } from 'react-router-dom'
import type { Lot } from '@/types'
import { useCountdown } from '@/hooks/useCountdown'
import { icons, brandTrek } from '@/assets'
import cardPattern from '@/assets/images/card-pattern.svg'
import lotGummies from '@/assets/images/lot-gummies.png'
import { useAppDispatch } from '@/store/hooks'
import { openQuickView } from '@/store/slices/uiSlice'
import { canonicalLotId } from '@/api/fixtures'
import { cn } from '@/utils/format'

function closesInHours(endsAt: string, countdown: ReturnType<typeof useCountdown>) {
  if (countdown.expired) return 'Ended'
  const ms = new Date(endsAt).getTime() - Date.now()
  const hours = Math.max(1, Math.ceil(ms / 3600000))
  return `Closes in ${hours}h`
}

/**
 * Product card (Home / category / similar):
 * bordered rounded shell with hover shadow; type scales down below xl.
 */
export function LotCard({ lot }: { lot: Lot; compact?: boolean }) {
  const dispatch = useAppDispatch()
  const countdown = useCountdown(lot.endsAt)
  const unitPrice = lot.units > 0 ? lot.currentBid / lot.units : 0

  return (
    <div
      className={cn(
        'relative z-0 flex h-full min-h-0 w-full flex-1 flex-col gap-2 rounded-xl border border-border bg-white p-2.5',
        'transition-shadow duration-200 hover:z-[1] hover:shadow-[0px_8px_24px_rgba(26,30,38,0.12)]',
        'sm:gap-2.5 sm:p-3',
      )}
    >
      <Link
        to={`/lots/${lot.slug}`}
        className="relative flex h-[128px] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white md:h-[140px] xl:h-[156px]"
      >
        <img
          src={cardPattern}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[90px] h-[140px] w-[280px] max-w-none -translate-x-1/2"
        />
        <img
          src={lot.image || lotGummies}
          alt=""
          className="relative z-[1] size-[92px] object-cover md:size-[104px] xl:size-[116px]"
        />
        {lot.dockVerified ? (
          <span className="absolute left-1.5 top-1.5 z-[2] rounded-full bg-[#e6f4ed] px-1.5 py-0.5 text-[9px] font-semibold leading-[14px] text-[#0a6e38] md:left-2 md:top-2 md:px-2 md:text-[10px]">
            Dock verification
          </span>
        ) : null}
        <span className="absolute right-0 top-0 z-[2] flex h-6 items-center rounded-bl px-2 text-[10px] font-normal leading-[1.5] text-[#f2f6f4] bg-[#480516] md:h-7 md:px-2.5 md:text-[11px] xl:h-8 xl:px-3 xl:text-[12px]">
          {`Tier 3 <$15,000`}
        </span>
      </Link>

      <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-2.5">
        <div className="relative h-3.5 w-[108px] shrink-0 overflow-hidden xl:h-4 xl:w-[132px]">
          <img
            src={brandTrek}
            alt={lot.brand ?? 'Brand'}
            className="block h-full w-full max-w-none object-contain object-left"
          />
        </div>

        <div className="flex flex-col gap-1 sm:gap-1.5">
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <Link
              to={`/lots/${lot.slug}`}
              className="line-clamp-2 min-h-[36px] text-[13px] font-normal leading-[1.4] text-[#1a1e26] md:min-h-[40px] md:text-[14px] xl:min-h-[42px] xl:text-[15px]"
            >
              {lot.title}
            </Link>
            <span className="inline-flex h-5 w-fit items-center rounded px-1.5 text-[10px] font-normal leading-[1.5] text-[#05422c] bg-[#f9f5f6] md:h-6 md:px-2 md:text-[11px]">
              {lot.condition}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-start">
              <span className="mt-[2px] flex size-3 shrink-0 items-center justify-center overflow-hidden">
                <img
                  src={icons.location}
                  alt=""
                  width={12}
                  height={12}
                  className="block size-full max-w-none"
                />
              </span>
              <span className="ml-1 text-[10px] font-normal leading-[14px] text-[#7a7b7c] md:text-[11px] md:leading-[16px]">
                {lot.location}
              </span>
            </div>
            <p className="text-[10px] font-normal leading-[1.5] text-[#1a1e26] md:text-[11px]">{lot.units} units</p>
            <div className="flex flex-col gap-0.5">
              <p className="text-[14px] font-normal leading-[1.4] text-[#0e0104] md:text-[15px] xl:text-[16px]">
                ${Math.round(lot.currentBid)}
              </p>
              <div className="flex items-center gap-1 text-[#7a7b7c]">
                <span className="text-[10px] font-normal leading-[1.5] md:text-[11px]">${unitPrice.toFixed(2)}</span>
                <span className="text-[11px] font-light leading-[1.5] md:text-[12px]">/ gram</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-normal leading-[1.5] text-[#060709] xl:text-[12px]">{lot.bidCount} Bids</span>
            <span className="h-2.5 w-px bg-[#c8c9cb]" />
            <span className="text-[11px] font-normal leading-[1.5] text-[#ff383c] xl:text-[12px]">
              {closesInHours(lot.endsAt, countdown)}
            </span>
          </div>
        </div>

        <div className="mt-auto flex shrink-0 flex-nowrap gap-1.5 sm:gap-2">
          <Link
            to={`/lots/${lot.slug}`}
            className="flex h-8 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-[#480516] px-2 text-[11px] font-medium leading-[1.5] text-white sm:h-9 sm:px-3 sm:text-[12px]"
          >
            Place Bid
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              dispatch(openQuickView(canonicalLotId(lot.id)))
            }}
            className="relative z-10 flex h-8 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-solid border-[#ebebec] bg-[#f5f5f6] px-2 text-[11px] font-medium leading-4 text-[#46494f] transition hover:bg-[#ebebec] sm:h-9 sm:px-3"
          >
            Quickview
          </button>
        </div>
      </div>
    </div>
  )
}
