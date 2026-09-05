import { Link } from 'react-router-dom'
import contractsArt from '@/assets/images/buy-contracts-icon.png'
import spotArt from '@/assets/images/buy-spot-icon.png'

function WineArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
      <path
        d="M7.425 16.6L12.8583 11.1667C13.5 10.525 13.5 9.475 12.8583 8.83333L7.425 3.4"
        stroke="#480516"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const APPROACHES = [
  {
    title: 'Contracts',
    body: "Shop medium and long-term purchasing contracts directly from the world's largest retailers and manufacturers.",
    to: '/contracts',
    art: contractsArt,
    artAlt: 'Abstract 3D shapes representing purchasing contracts',
    tone: 'wine' as const,
  },
  {
    title: 'Spot Sales',
    body: 'Browse one-time offers from Fortune 500 retailers and manufacturers. Sizes range from parcels and single liquidation pallets to full truckloads.',
    to: '/categories/all',
    art: spotArt,
    artAlt: 'Abstract 3D browser and search shapes representing spot sales',
    tone: 'cream' as const,
  },
] as const

export function LandingBuyingApproaches() {
  return (
    <section className="w-full bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-20 lg:py-20">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-center text-[22px] font-semibold leading-[1.25] tracking-[-0.5px] text-[#060709] sm:text-[28px] lg:text-[32px]">
          Explore Other Buying Approaches
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:gap-7 md:grid-cols-2">
          {APPROACHES.map((item) => (
            <article
              key={item.title}
              className={`flex h-full flex-col items-start rounded-2xl px-7 py-8 sm:px-10 sm:py-10 ${
                item.tone === 'wine' ? 'bg-[#f9f5f6]' : 'bg-[#f6efe6]'
              }`}
            >
              <img
                src={item.art}
                alt={item.artAlt}
                className="h-[108px] w-auto max-w-[160px] object-contain object-left sm:h-[120px]"
              />
              <h3 className="mt-5 text-[20px] font-semibold leading-[1.3] text-[#1a1e26] sm:mt-6 sm:text-[22px]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[420px] text-[14px] font-normal leading-[1.6] text-[#46494f] sm:text-[15px]">
                {item.body}
              </p>
              <div className="mt-auto pt-7 sm:pt-8">
                <Link
                  to={item.to}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-[14px] font-semibold text-[#480516] transition hover:bg-white/80"
                >
                  Start Shopping
                  <WineArrow />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
