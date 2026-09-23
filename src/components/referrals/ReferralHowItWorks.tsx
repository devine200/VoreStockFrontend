const STEPS = [
  {
    n: '01',
    title: 'Share your link',
    body: 'Copy your unique referral link and send it to wholesale buyers in your network.',
  },
  {
    n: '02',
    title: 'They join & verify',
    body: 'Your contact signs up, completes KYC verification, and becomes an active member.',
  },
  {
    n: '03',
    title: 'You earn credits',
    body: 'Once they complete a qualifying purchase, $50 in freight credits are added to your account.',
  },
]

export function ReferralHowItWorks() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#ebebec] bg-white px-5 py-5 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.08em] text-[#9ca3af] uppercase">How It Works</p>
      <div className="mt-4 grid gap-5 lg:grid-cols-3 lg:gap-6">
        {STEPS.map((step) => (
          <div key={step.n} className="flex gap-3 sm:gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#480516] text-[12px] font-semibold text-white">
              {step.n}
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-5 text-[#1a1e26]">{step.title}</p>
              <p className="mt-0.5 text-[13px] leading-5 text-[#7a7b7c]">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
