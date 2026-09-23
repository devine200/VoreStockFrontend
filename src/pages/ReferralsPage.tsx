import { useNavigate } from 'react-router-dom'
import {
  INITIAL_REFERRALS,
  INITIAL_REFERRAL_REWARDS,
  REFERRAL_CREDIT,
} from '@/api/fixtures'
import { FreightCreditsPanel } from '@/components/referrals/FreightCreditsPanel'
import { NetworkRoster } from '@/components/referrals/NetworkRoster'
import { ReferralHowItWorks } from '@/components/referrals/ReferralHowItWorks'
import { ReferralInviteBanner } from '@/components/referrals/ReferralInviteBanner'
import { ReferralSharePanel } from '@/components/referrals/ReferralSharePanel'
import { RewardsHistory } from '@/components/referrals/RewardsHistory'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { showToast } from '@/store/slices/uiSlice'
import { referralAbsoluteLink } from '@/utils/referral'

async function copyValue(value: string) {
  await navigator.clipboard.writeText(value)
}

export function ReferralsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { code, earned, used, available } = useAppSelector((s) => s.referrals)
  const link = referralAbsoluteLink(code)
  const activeCount = INITIAL_REFERRALS.filter((r) => r.status === 'reward_earned').length

  const copyLink = async () => {
    try {
      await copyValue(link)
      dispatch(showToast('Referral link copied'))
    } catch {
      dispatch(showToast('Unable to copy link'))
    }
  }

  const copyCode = async () => {
    try {
      await copyValue(code)
      dispatch(showToast('Referral code copied'))
    } catch {
      dispatch(showToast('Unable to copy code'))
    }
  }

  const shareLink = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Join VSK Global',
          text: 'Join the marketplace with my referral link and start bidding on wholesale lots.',
          url: link,
        })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    await copyLink()
  }

  const metrics = [
    { label: 'Active Referrals', value: String(activeCount), tone: 'neutral' as const },
    { label: 'Total Invited', value: String(INITIAL_REFERRALS.length), tone: 'neutral' as const },
    { label: 'Available Credits', value: `$${available}`, tone: 'wine' as const },
  ]

  return (
    <div className="animate-fade-in min-w-0 space-y-6">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">Referrals</h1>
        <p className="pt-1 max-w-xl text-[14px] leading-5 text-[#7a7b7c]">
          Invite wholesale buyers to join the marketplace and earn freight credits when they become active buyers.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:hidden">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="min-w-0 rounded-2xl border border-[#ebebec] bg-white px-2 py-3 text-center sm:px-3"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.4px] text-[#9ca3af]">{metric.label}</p>
            <p
              className={
                metric.tone === 'wine'
                  ? 'mt-1 text-[16px] font-semibold tabular-nums text-[#480516] sm:text-[18px]'
                  : 'mt-1 text-[16px] font-semibold tabular-nums text-[#1a1e26] sm:text-[18px]'
              }
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        <span className="inline-flex h-[38px] items-center rounded-full border border-[#ebebec] bg-white px-4 text-[13px] text-[#7a7b7c]">
          Active Referrals <span className="ml-1.5 font-semibold text-[#1a1e26]">{activeCount}</span>
        </span>
        <span className="inline-flex h-[38px] items-center rounded-full border border-[#ebebec] bg-white px-4 text-[13px] text-[#7a7b7c]">
          Total Invited <span className="ml-1.5 font-semibold text-[#1a1e26]">{INITIAL_REFERRALS.length}</span>
        </span>
        <span className="inline-flex h-[38px] items-center rounded-full bg-[#f9f5f6] px-4 text-[13px] text-[#480516]">
          Available Credits <span className="ml-1.5 font-semibold">${available}</span>
        </span>
      </div>

      <ReferralHowItWorks />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
        <ReferralSharePanel
          code={code}
          link={link}
          onCopyLink={copyLink}
          onCopyCode={copyCode}
          onShare={shareLink}
        />
        <FreightCreditsPanel
          earned={earned}
          used={used}
          available={available}
          activeCount={activeCount}
          credit={REFERRAL_CREDIT}
          onApply={() => navigate('/bids?tab=won')}
        />
      </div>
      <NetworkRoster contacts={INITIAL_REFERRALS} activeCount={activeCount} />
      <RewardsHistory rewards={INITIAL_REFERRAL_REWARDS} totalEarned={earned} />
      <ReferralInviteBanner onCopy={copyLink} />
    </div>
  )
}
