import { Icon } from '@/components/shared/Icon'
import copyIcon from '@/assets/icons/copy.svg'

export function ReferralInviteBanner({ onCopy }: { onCopy: () => void }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-[#480516] px-5 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7">
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[14px] font-medium text-[#480516] hover:bg-[#f9f5f6] sm:order-2 sm:w-auto"
      >
        <Icon src={copyIcon} size={15} />
        Copy Referral Link
      </button>
      <div className="sm:order-1">
        <p className="text-[18px] font-semibold">Know another wholesale buyer?</p>
        <p className="mt-1 text-[14px] text-white/80">
          Invite them and earn $50 in freight credits when they become an active buyer.
        </p>
      </div>
    </section>
  )
}
