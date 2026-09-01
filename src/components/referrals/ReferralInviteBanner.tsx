function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function ReferralInviteBanner({ onCopy }: { onCopy: () => void }) {
  return (
    <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-wine-500 px-8 py-7 text-white sm:flex-row sm:items-center">
      <div>
        <p className="text-[18px] font-semibold">Know another wholesale buyer?</p>
        <p className="mt-1 text-[14px] text-white/80">
          Invite them and earn $50 in freight credits when they become an active buyer.
        </p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-medium text-wine-500 hover:bg-wine-50"
      >
        <CopyIcon />
        Copy Referral Link
      </button>
    </section>
  )
}
