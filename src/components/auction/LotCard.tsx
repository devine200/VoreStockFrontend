import { Link } from 'react-router-dom'
import type { Lot } from '@/types'
import { useCountdown } from '@/hooks/useCountdown'
import { icons, brandTrek } from '@/assets'
import { Icon } from '@/components/shared/Icon'
import cardPattern from '@/assets/images/card-pattern.svg'
import lotGummies from '@/assets/images/lot-gummies.png'
import { useAppDispatch } from '@/store/hooks'
import { openQuickView } from '@/store/slices/uiSlice'
import { canonicalLotId } from '@/api/fixtures'

function closesInHours(endsAt: string, countdown: ReturnType<typeof useCountdown>) {
  if (countdown.expired) return 'Ended'
  const ms = new Date(endsAt).getTime() - Date.now()
  const hours = Math.max(1, Math.ceil(ms / 3600000))
  return `Closes in ${hours}h`
}

/**
 * Figma Card' (Home / category):
 * image 240 → 16px → logo 20 → 16px → content; title→chip 8px;
 * location→units→price 4px; Place Bid | Quickview 10px gap
 */
export function LotCard({ lot }: { lot: Lot; compact?: boolean }) {
  const dispatch = useAppDispatch()
  const countdown = useCountdown(lot.endsAt)
  const unitPrice = lot.units > 0 ? lot.currentBid / lot.units : 0

  return (
    <div className="flex w-full flex-col gap-4">
      <Link
        to={`/lots/${lot.slug}`}
        className="relative flex h-[240px] w-full items-center justify-center overflow-hidden rounded-lg bg-white"
      >
        <img
          src={cardPattern}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[131px] h-[186px] w-[369px] max-w-none -translate-x-1/2"
        />
        <img
          src={lot.image || lotGummies}
          alt=""
          className="relative z-[1] size-[164px] object-cover"
        />
        {lot.dockVerified ? (
          <span className="absolute left-2 top-2 z-[2] rounded-full bg-[#e6f4ed] px-2.5 py-1 text-[11px] font-semibold leading-[16.5px] text-[#0a6e38]">
            Dock verification
          </span>
        ) : null}
        <span className="absolute right-0 top-0 z-[2] flex h-9 items-center rounded-bl px-4 text-[14px] font-normal leading-[1.5] text-[#f2f6f4] bg-[#480516]">
          {`Tier 3 <$15,000`}
        </span>
      </Link>

      <div className="flex flex-col gap-4">
        <div className="relative h-5 w-[168px] overflow-hidden">
          <img
            src={brandTrek}
            alt={lot.brand ?? 'Brand'}
            className="block h-full w-full max-w-none object-contain object-left"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Link
              to={`/lots/${lot.slug}`}
              className="text-[18px] font-normal leading-[1.5] text-[#1a1e26]"
            >
              {lot.title}
            </Link>
            <span className="inline-flex h-7 w-fit items-center rounded px-2.5 text-[12px] font-normal leading-[1.5] text-[#05422c] bg-[#f9f5f6]">
              {lot.condition}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Icon src={icons.location} size={14} />
              <span className="text-[12px] font-normal leading-[1.5] text-[#7a7b7c]">{lot.location}</span>
            </div>
            <p className="text-[12px] font-normal leading-[1.5] text-[#1a1e26]">{lot.units} units</p>
            <div className="flex flex-col gap-1">
              <p className="text-[18px] font-normal leading-[1.5] text-[#0e0104]">
                ${Math.round(lot.currentBid)}
              </p>
              <div className="flex items-center gap-1 text-[#7a7b7c]">
                <span className="text-[12px] font-normal leading-[1.5]">${unitPrice.toFixed(2)}</span>
                <span className="text-[14px] font-light leading-[1.5]">/ gram</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[14px] font-normal leading-[1.5] text-[#060709]">{lot.bidCount} Bids</span>
            <span className="h-3 w-px bg-[#c8c9cb]" />
            <span className="text-[14px] font-normal leading-[1.5] text-[#ff383c]">
              {closesInHours(lot.endsAt, countdown)}
            </span>
          </div>
        </div>

        <div className="flex gap-2.5">
          <Link
            to={`/lots/${lot.slug}`}
            className="flex h-10 flex-1 items-center justify-center rounded-full bg-[#480516] px-3 text-[13px] font-medium leading-[1.5] text-white sm:px-6 sm:text-[14px]"
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
            className="relative z-10 flex h-10 flex-1 items-center justify-center rounded-full border border-solid border-[#ebebec] bg-[#f5f5f6] px-3 text-[12px] font-medium leading-4 text-[#46494f] transition hover:bg-[#ebebec] sm:px-6"
          >
            Quickview
          </button>
        </div>
      </div>
    </div>
  )
}
