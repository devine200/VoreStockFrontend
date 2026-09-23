import { Button } from '@/components/shared/Button'
import { Icon } from '@/components/shared/Icon'
import linkIcon from '@/assets/icons/link.svg'
import copyIcon from '@/assets/icons/copy.svg'
import shareIcon from '@/assets/icons/share.svg'

export function ReferralSharePanel({
  code,
  link,
  onCopyLink,
  onCopyCode,
  onShare,
}: {
  code: string
  link: string
  onCopyLink: () => void
  onCopyCode: () => void
  onShare: () => void
}) {
  return (
    <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-[#ebebec] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f9f5f6]">
          <Icon src={linkIcon} size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Your Referral Link</h2>
          <p className="mt-0.5 text-[13px] leading-5 text-[#7a7b7c]">
            Share your unique link with wholesale buyers and earn $50 in freight credits when they become active.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#ebebec] bg-[#f8f8f9] px-4 py-3">
          <span className="shrink-0">
            <Icon src={linkIcon} size={16} />
          </span>
          <p className="truncate text-[14px] text-[#1a1e26]">{link}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" className="h-[46px] w-full px-4 sm:flex-1" onClick={onCopyLink}>
            <Icon src={copyIcon} size={15} className="[&_img]:brightness-0 [&_img]:invert" />
            Copy Link
          </Button>
          <Button type="button" variant="secondary" className="h-[46px] w-full px-4 sm:w-auto" onClick={onShare}>
            <Icon src={shareIcon} size={15} />
            Share
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#ebebec] bg-[#f8f8f9] px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-[0.08em] text-[#9ca3af] uppercase">Your Referral Code</p>
          <p className="mt-0.5 truncate text-[22px] font-semibold tracking-wide text-[#1a1e26]">{code}</p>
        </div>
        <button
          type="button"
          onClick={onCopyCode}
          className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-[#480516] hover:underline"
        >
          <Icon src={copyIcon} size={15} />
          Copy code
        </button>
      </div>
    </section>
  )
}
