import { Link } from 'react-router-dom'

const TERMS_TOC = [
  'Eligibility',
  'Your Account',
  'KYC and Verification',
  'Auctions and Bidding',
  'Bid Holds',
  'Winning an Auction',
  'Proxy Placement',
] as const

const PRIVACY_TOC = [
  'Information we collect',
  'How we use information',
  'Payments and escrow',
  'Sharing',
  'Retention',
  'Your rights',
  'Contact',
] as const

function LegalLayout({
  title,
  intro,
  toc,
}: {
  title: string
  intro: string
  toc: readonly string[]
}) {
  return (
    <div className="pb-16">
      <div className="max-w-[1040px]">
        <h1 className="text-[26px] font-semibold leading-[1.25] tracking-[-1px] text-[#060709] sm:text-[32px] sm:leading-[40px] sm:tracking-[-1.5px]">{title}</h1>
        <p className="mt-[10px] text-[12px] leading-4 text-[#717378]">Last Updated: August 2026</p>
        <p className="mt-[10px] text-[14px] leading-[18px] text-[#46494f]">{intro}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-xl border border-[#f4f4f4] py-[18px]">
          <p className="px-[18px] text-[10px] font-semibold uppercase tracking-[1px] text-[#9d9ea2]">
            On this page
          </p>
          <nav className="mt-1.5 flex flex-col">
            {toc.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-[26px] py-[7px] text-[14px] leading-[15px] text-[#1a1e26] hover:text-[#480516]"
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col gap-8">
          {toc.map((item) => (
            <section key={item} id={item.toLowerCase().replace(/\s+/g, '-')}>
              <h2 className="text-[20px] font-medium leading-[1.5] text-[#060709]">{item}</h2>
              <p className="mt-3 text-[14px] leading-[1.5] text-[#46494f]">
                This section follows the BidBridge Africa / VSK Global legal layout in Figma. Full policy
                copy lives in the design file and will be wired when legal review is complete.
              </p>
            </section>
          ))}
          <p className="text-[14px] text-[#717378]">
            Questions?{' '}
            <Link to="/support" className="font-medium text-[#480516]">
              Contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      intro="These Terms & Conditions govern your access to and use of the platform, including auctions, bidding, purchases, payments, referrals, logistics, and related services. By creating an account or using the platform, you agree to these Terms."
      toc={TERMS_TOC}
    />
  )
}

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="This Privacy Policy explains how we collect, use, and share information when you use the VSK Global marketplace. It covers account data, bidding activity, payments, and communications."
      toc={PRIVACY_TOC}
    />
  )
}
