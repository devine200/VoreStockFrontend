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
    <section className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="px-6 py-5">
        <h2 className="text-[16px] font-semibold text-[#1a1e26]">Rewards History</h2>
        <p className="mt-0.5 text-[13px] text-[#7a7b7c]">Freight credits earned from successful referrals</p>
      </div>
      <div className="divide-y divide-border border-t border-border">
        {rewards.map((reward) => (
          <div key={reward.id} className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-[#e8f6ee]">
                <Icon src={giftEarnedIcon} size={18} />
              </span>
              <div>
                <p className="text-[14px] font-medium text-[#1a1e26]">
                  {reward.name} / {reward.company}
                </p>
                <p className="text-[12px] text-[#9ca3af]">{reward.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-[#1f7a45]">+${reward.amount}</span>
              <span className="rounded-full bg-[#e8f6ee] px-2.5 py-0.5 text-[11px] font-medium text-[#1f7a45]">
                Earned
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <p className="text-[14px] font-medium text-[#1a1e26]">Total earned</p>
        <p className="text-[14px] font-semibold text-wine-500">+${totalEarned}</p>
      </div>
    </section>
  )
}
