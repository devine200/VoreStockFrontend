import { Link, useLocation } from 'react-router-dom'
import logoImg from '@/assets/images/logo.png'
import { cn } from '@/utils/format'

const QUICK_LEFT = ['Track Your Order', 'Shop All', 'Flower', 'Edibles', 'Concentrates', 'Refunds']
const QUICK_RIGHT = ['Mushrooms', 'Promotions / Bundles', 'Support', 'Reward', 'Blog', 'Shipping Faq']
const MORE_LEFT = ['About Us', 'Careers', 'Press', 'Investors', 'Affiliates']
const MORE_RIGHT = ['Accessibility', 'Cookie Settings', 'Do Not Sell', 'Sitemap', 'Help Center']

export function SiteFooter() {
  const isHome = useLocation().pathname === '/'

  return (
    <footer
      className={cn(
        'text-white',
        // Home: tall top pad so the UNLOCK CTA can overlap into the dark band
        isHome ? 'pt-[100px] sm:pt-[140px] lg:pt-[160px]' : 'pt-0',
      )}
      style={{
        backgroundImage: 'linear-gradient(180deg, #1A1E26 0%, #0E0104 100%)',
      }}
    >
      <div className={cn('mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-0', isHome ? 'pt-0' : 'pt-12 sm:pt-16')}>
        <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-[minmax(0,280px)_1fr] md:gap-8 lg:grid-cols-[379px_1fr] lg:pb-16">
          <div>
            {/* Figma Logo instance: 66×45 — burgundy mark on dark charcoal */}
            <div className="relative h-[45px] w-[66px] overflow-hidden">
              <img
                src={logoImg}
                alt="VSK Global"
                className="pointer-events-none absolute max-w-none"
                style={{
                  height: '204%',
                  width: '253.47%',
                  left: '-76.24%',
                  top: '-58.55%',
                }}
              />
            </div>
            <p className="mt-6 max-w-[276px] text-[14px] font-normal leading-[1.5] text-white/70">
              BidBridge Africa is a cross-border product bidding, procurement, and import platform that
              connects African buyers to international auction and liquidation marketplaces.
            </p>
          </div>

          <div className="flex flex-col gap-10">
            <div>
              <p className="text-[20px] font-medium leading-[1.5] text-white">QUICK LINK</p>
              <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 text-[14px] leading-[1.5] text-white/80 sm:grid-cols-2">
                {[...QUICK_LEFT, ...QUICK_RIGHT].map((label) => (
                  <Link key={label} to="/categories/all" className="hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[20px] font-medium leading-[1.5] text-white">CONTACT US</p>
              <p className="mt-6 text-[14px] leading-[1.5] text-white/80">info@bridgeafrica.cc</p>
            </div>

            <div>
              <p className="text-[20px] font-medium leading-[1.5] text-white">MORE</p>
              <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 text-[14px] leading-[1.5] text-white/80 sm:grid-cols-2">
                {[...MORE_LEFT, ...MORE_RIGHT].map((label) => (
                  <Link key={label} to="/support" className="hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {['MC', 'VISA', 'AMEX', 'DISC'].map((label) => (
                <div
                  key={label}
                  className="flex h-8 w-14 items-center justify-center rounded bg-white/10 text-[10px] font-semibold tracking-wide text-white/80"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
          <p className="text-[14px] leading-[1.5] text-white/60 sm:text-[16px]">
            © 2022 Top Shelf BC. All Rights Reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] leading-[1.5] text-white/60 sm:gap-8">
            <span>Out Of Stock</span>
            <Link to="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
