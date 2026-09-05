import { Link } from 'react-router-dom'
import linkIcon from '@/assets/icons/link.svg'
import truckIcon from '@/assets/icons/truck.svg'
import fileIcon from '@/assets/icons/file.svg'
import usersIcon from '@/assets/icons/users.svg'

function WineIcon({ src, size = 36 }: { src: string; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 bg-[#480516]"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
      aria-hidden
    />
  )
}

const FEATURES = [
  {
    icon: linkIcon,
    title: 'No middleman',
    body: 'Buy direct from retailers through their official liquidation auction marketplaces.',
  },
  {
    icon: truckIcon,
    title: 'All lot sizes, categories',
    body: 'Source inventory for resale across all lot sizes, product categories, and price points.',
  },
  {
    icon: fileIcon,
    title: 'No surprises',
    body: "From detailed listings of liquidation pallets to itemized manifests, you'll know the quantity.",
  },
  {
    icon: usersIcon,
    title: "We've got your back!",
    body: 'A dedicated customer service team and education center to help you grow your business through wholesale liquidators.',
  },
] as const

export function LandingValueSections() {
  return (
    <div className="w-full">
      <section className="w-full bg-[#f9f5f6] px-4 py-14 sm:px-6 sm:py-16 lg:px-20 lg:py-20">
        <div className="mx-auto max-w-[1100px] text-center">
          <p className="text-[12px] font-semibold tracking-[0.12em] text-[#480516] uppercase sm:text-[13px]">
            Source inventory for resale
          </p>
          <h2 className="mx-auto mt-3 max-w-[640px] text-[22px] font-semibold leading-[1.25] tracking-[-0.5px] text-[#060709] sm:text-[28px] lg:text-[32px]">
            VSK Global: The best place to find inventory for resale
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-14 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
            {FEATURES.map((item) => (
              <div key={item.title} className="flex flex-col items-center px-2">
                <WineIcon src={item.icon} />
                <h3 className="mt-4 text-[16px] font-semibold leading-[1.4] text-[#1a1e26] sm:text-[17px]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] font-normal leading-[1.55] text-[#46494f]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-white px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[760px] text-center">
          <h2 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.5px] text-[#060709] sm:text-[28px] lg:text-[32px]">
            Featured Liquidation Auctions
          </h2>
          <p className="mt-4 text-[14px] font-normal leading-[1.6] text-[#46494f] sm:mt-5 sm:text-[16px]">
            Buy pallets and truckloads directly from top retailers and manufacturers like Amazon, Walmart, Target,
            Samsung, The Home Depot, Whirlpool and more. VSK Global hosts thousands of online liquidation auctions
            and Buy Now listings of returned, excess, and overstock inventory. Skip the middleman and grow your resale
            business with trusted, direct supply.
          </p>
          <Link
            to="/categories/all"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[#480516] px-8 text-[14px] font-semibold text-white transition hover:bg-[#5c1a2a] sm:h-12 sm:px-10"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  )
}
