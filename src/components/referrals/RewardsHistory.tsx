import type { ReferralReward } from '@/types'

function GiftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 11h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 7h18v4H3V7Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v15" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 7c0-2-1.2-3.5-3-3.5S6 5 7.5 7H12Zm0 0c0-2 1.2-3.5 3-3.5S18 5 16.5 7H12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  )
}

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
              <span className="flex size-9 items-center justify-center rounded-full bg-[#e8f6ee] text-[#1f7a45]">
                <GiftIcon />
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
