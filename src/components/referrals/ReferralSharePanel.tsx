import { Button } from '@/components/shared/Button'

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 13a5 5 0 0 0 7.07.07l1.41-1.41a5 5 0 0 0-7.07-7.07L10 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.07-.07L5.52 12.34a5 5 0 0 0 7.07 7.07L14 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.2 10.8 15.7 6.4M8.2 13.2l7.5 4.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

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
    <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-border bg-white p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wine-50 text-wine-500">
          <LinkIcon />
        </span>
        <div>
          <h2 className="text-[16px] font-semibold text-[#1a1e26]">Your Referral Link</h2>
          <p className="mt-0.5 text-[13px] text-[#7a7b7c]">
            Share your unique link with wholesale buyers and earn $50 in freight credits when they become active.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-[#fafafa] px-4 py-3">
          <span className="shrink-0 text-[#9ca3af]">
            <LinkIcon />
          </span>
          <p className="truncate text-[14px] text-[#1a1e26]">{link}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" className="h-[46px] px-4" onClick={onCopyLink}>
            <CopyIcon />
            Copy Link
          </Button>
          <Button type="button" variant="secondary" className="h-[46px] px-4" onClick={onShare}>
            <ShareIcon />
            Share
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-[#fafafa] px-4 py-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.08em] text-[#9ca3af] uppercase">Your Referral Code</p>
          <p className="mt-0.5 text-[22px] font-semibold tracking-wide text-[#1a1e26]">{code}</p>
        </div>
        <button
          type="button"
          onClick={onCopyCode}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-wine-500 hover:underline"
        >
          <CopyIcon />
          Copy code
        </button>
      </div>
    </section>
  )
}
