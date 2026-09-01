import { cn } from '@/utils/format'
import type { ReferralStatus } from '@/types'

export const REFERRAL_STATUS_LABEL: Record<ReferralStatus, string> = {
  reward_earned: 'Reward Earned',
  pending_verification: 'Pending Verification',
}

const TONE: Record<ReferralStatus, string> = {
  reward_earned: 'bg-wine-50 text-wine-500',
  pending_verification: 'bg-[#fef8e6] text-[#b45309]',
}

const DOT: Record<ReferralStatus, string> = {
  reward_earned: 'bg-wine-500',
  pending_verification: 'bg-[#f2bc1b]',
}

export function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none',
        TONE[status],
      )}
    >
      <span className={cn('size-1.5 rounded-full', DOT[status])} />
      {REFERRAL_STATUS_LABEL[status]}
    </span>
  )
}
