import type { ReferralReward } from '@/types'
import { Icon } from '@/components/shared/Icon'
import giftEarnedIcon from '@/assets/icons/gift-earned.svg'

export function RewardsHistory({
  rewards,
  totalEarned,
}: {
  rewards: ReferralReward[]
  totalEarned: number
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#ebebec] bg-white">
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Rewards History</h2>
        <p className="mt-0.5 text-[13px] text-[#7a7b7c]">Freight credits earned from successful referrals</p>
      </div>
      <div className="divide-y divide-[#ebebec] border-t border-[#ebebec]">
        {rewards.map((reward) => (
          <div key={reward.id} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f6ee]">
                <Icon src={giftEarnedIcon} size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-[#1a1e26]">
                  {reward.name} / {reward.company}
                </p>
                <p className="text-[12px] text-[#9ca3af]">{reward.date}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
              <span className="text-[14px] font-semibold text-[#0a6e38]">+${reward.amount}</span>
              <span className="rounded-full bg-[#e8f6ee] px-2.5 py-0.5 text-[11px] font-medium text-[#0a6e38]">
                Earned
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-[#ebebec] px-4 py-4 sm:px-6">
        <p className="text-[14px] font-medium text-[#1a1e26]">Total earned</p>
        <p className="text-[14px] font-semibold text-[#480516]">+${totalEarned}</p>
      </div>
    </section>
  )
}
