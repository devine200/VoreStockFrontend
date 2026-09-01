import { useNavigate } from 'react-router-dom'
import {
  INITIAL_REFERRALS,
  INITIAL_REFERRAL_REWARDS,
  REFERRAL_CODE,
  REFERRAL_CREDIT,
  REFERRAL_LINK,
  REFERRAL_SUMMARY,
} from '@/api/fixtures'
import { FreightCreditsPanel } from '@/components/referrals/FreightCreditsPanel'
import { NetworkRoster } from '@/components/referrals/NetworkRoster'
import { ReferralHowItWorks } from '@/components/referrals/ReferralHowItWorks'
import { ReferralInviteBanner } from '@/components/referrals/ReferralInviteBanner'
import { ReferralSharePanel } from '@/components/referrals/ReferralSharePanel'
import { RewardsHistory } from '@/components/referrals/RewardsHistory'
import { PageHeader } from '@/components/shared/PageChrome'
import { useAppDispatch } from '@/store/hooks'
import { showToast } from '@/store/slices/uiSlice'

async function copyValue(value: string) {
  await navigator.clipboard.writeText(value)
}

export function ReferralsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const activeCount = INITIAL_REFERRALS.filter((r) => r.status === 'reward_earned').length

  const copyLink = async () => {
    try {
      await copyValue(REFERRAL_LINK)
      dispatch(showToast('Referral link copied'))
    } catch {
      dispatch(showToast('Unable to copy link'))
    }
  }

  const copyCode = async () => {
    try {
      await copyValue(REFERRAL_CODE)
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
          url: REFERRAL_LINK,
        })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    await copyLink()
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Referrals"
        subtitle="Invite wholesale buyers to join the marketplace and earn freight credits when they become active buyers."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full border border-border bg-white px-3.5 py-2 text-[13px] text-[#7a7b7c]">
              Active Referrals <span className="ml-1 font-semibold text-[#1a1e26]">{activeCount}</span>
            </span>
            <span className="rounded-full border border-border bg-white px-3.5 py-2 text-[13px] text-[#7a7b7c]">
              Total Invited <span className="ml-1 font-semibold text-[#1a1e26]">{INITIAL_REFERRALS.length}</span>
            </span>
            <span className="rounded-full bg-wine-50 px-3.5 py-2 text-[13px] text-wine-500">
              Available Credits{' '}
              <span className="ml-1 font-semibold">${REFERRAL_SUMMARY.available}</span>
            </span>
          </div>
        }
      />
      <div className="flex flex-col gap-6">
        <ReferralHowItWorks />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <ReferralSharePanel
            code={REFERRAL_CODE}
            link={REFERRAL_LINK}
            onCopyLink={copyLink}
            onCopyCode={copyCode}
            onShare={shareLink}
          />
          <FreightCreditsPanel
            earned={REFERRAL_SUMMARY.earned}
            used={REFERRAL_SUMMARY.used}
            available={REFERRAL_SUMMARY.available}
            activeCount={activeCount}
            credit={REFERRAL_CREDIT}
            onApply={() => navigate('/orders')}
          />
        </div>
        <NetworkRoster contacts={INITIAL_REFERRALS} activeCount={activeCount} />
        <RewardsHistory rewards={INITIAL_REFERRAL_REWARDS} totalEarned={REFERRAL_SUMMARY.earned} />
        <ReferralInviteBanner onCopy={copyLink} />
      </div>
    </div>
  )
}
