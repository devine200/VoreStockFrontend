import { Button } from '@/components/shared/Button'
import { Icon } from '@/components/shared/Icon'
import tickCircle from '@/assets/icons/tick-circle.svg'

export function CompleteStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex flex-col items-center pb-2 pt-6 text-center">
      <span className="flex size-20 items-center justify-center rounded-full border-2 border-[#16a34a]/30 bg-[#16a34a]/[0.06]">
        <Icon src={tickCircle} size={36} />
      </span>
      <h2 className="mt-8 text-[24px] font-semibold leading-8 tracking-tight text-[#1a1e26]">
        You&apos;re all set!
      </h2>
      <p className="mt-3 max-w-[384px] text-[14px] leading-[26px] text-[#7a7b7c]">
        Your account is ready. Start browsing thousands of verified lots — or complete your
        verification to unlock higher bidding limits.
      </p>
      <Button
        type="button"
        onClick={onFinish}
        className="mt-10 h-[52px] w-full rounded-xl bg-[#480516] text-[16px] font-semibold"
        size="lg"
      >
        Browse the marketplace →
      </Button>
    </div>
  )
}
