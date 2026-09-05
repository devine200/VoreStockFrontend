import { Button } from '@/components/shared/Button'
import { Icon } from '@/components/shared/Icon'
import giftIcon from '@/assets/icons/gift.svg'

function GiftIcon() {
  return <Icon src={giftIcon} size={20} />
}

export function FreightCreditsPanel({
  earned,
  used,
  available,
  activeCount,
  credit,
  onApply,
}: {
  earned: number
  used: number
  available: number
  activeCount: number
  credit: number
  onApply: () => void
}) {
  return (
    <div className="flex w-full flex-col gap-4 lg:w-[487px] lg:shrink-0">
      <section className="rounded-2xl bg-wine-500 p-6 text-white">
        <div className="flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] uppercase">
          <GiftIcon />
          Freight Credits
        </div>
        <p className="mt-4 text-[14px] text-white/80">You have</p>
        <p className="font-display text-[36px] leading-none font-semibold">${available}</p>
        <p className="mt-1 text-[14px] text-white/80">in available freight credits</p>
        <div className="mt-5 space-y-2 border-t border-white/15 pt-4 text-[13px]">
          <div className="flex justify-between text-white/80">
            <span>Total earned</span>
            <span>${earned}</span>
          </div>
          <div className="flex justify-between text-white/80">
            <span>
              {activeCount} active referrals × ${credit}
            </span>
            <span>${earned}</span>
          </div>
          <div className="flex justify-between text-white/80">
            <span>Used at checkout</span>
            <span>–${used}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white/10 px-3 py-2 font-semibold text-[#f2bc1b]">
            <span>Available now</span>
            <span>${available}</span>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-white p-5">
        <p className="text-[14px] font-semibold text-[#1a1e26]">Use your Freight Credits</p>
        <p className="mt-1 text-[13px] leading-5 text-[#7a7b7c]">
          Your available credits can be applied to eligible orders during checkout.
        </p>
        <Button type="button" className="mt-4 h-10 w-full" onClick={onApply}>
          Apply at checkout
        </Button>
      </section>
    </div>
  )
}
