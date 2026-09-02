import { Outlet, useLocation } from 'react-router-dom'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { ModalHost } from '@/components/shared/ModalHost'
import { ToastHost } from '@/components/shared/ToastHost'
import { OnboardingHost } from '@/components/onboarding/OnboardingHost'
import { QuickViewDrawer } from '@/components/auction/QuickViewDrawer'
import logoWhite from '@/assets/images/logo-white.png'
import { cn } from '@/utils/format'

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <SiteHeader />
      {/* Home keeps Figma CTA→footer overlap; other pages get visible white chrome */}
      <main
        className={cn(
          'mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-20',
          isHome ? 'pt-6 pb-0 sm:pt-10' : 'pt-6 pb-12 sm:pt-10 sm:pb-20',
        )}
      >
        <Outlet />
      </main>
      <SiteFooter />
      <OnboardingHost />
      <QuickViewDrawer />
      <ModalHost />
      <ToastHost />
    </div>
  )
}

export function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#f5f5f6] lg:grid-cols-[minmax(280px,517px)_1fr]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-[#480516] px-6 py-8 text-white sm:px-8 sm:py-10 lg:py-[52px]">
        <div className="pointer-events-none absolute -left-28 top-[541px] hidden size-48 rounded-full bg-[#dacdd0] opacity-[0.04] lg:block" />
        <div className="pointer-events-none absolute left-0 top-[686px] hidden size-48 rounded-full bg-[#dacdd0] opacity-[0.04] lg:block" />
        <div className="pointer-events-none absolute left-[54px] top-[-67px] size-48 rounded-full bg-[#dacdd0] opacity-[0.04]" />
        <div className="pointer-events-none absolute left-[142px] top-[86px] hidden size-48 rounded-full bg-[#dacdd0] opacity-[0.04] lg:block" />

        <div className="relative h-[60px] w-[88px] shrink-0 overflow-hidden">
          <img
            src={logoWhite}
            alt="VSK Global"
            className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
          />
        </div>

        <div className="relative mt-8 max-w-[384px] lg:mt-0">
          <h1 className="text-[24px] font-semibold leading-[1.25] tracking-tight text-white sm:text-[30px] sm:leading-[37.5px]">
            The premium marketplace for serious buyers.
          </h1>
          <p className="mt-3 hidden text-[16px] leading-[26px] text-white/65 sm:mt-4 sm:block">
            Access thousands of verified lots — heavy equipment, electronics, bulk pallets, and more.
            Bid with confidence, pay securely, track every shipment.
          </p>
        </div>

        <p className="relative mt-8 hidden text-[12px] leading-4 text-white/35 lg:mt-0 lg:block">
          © 2026 VSKGlobal. All rights reserved.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-[440px] animate-slide-up">
          <Outlet />
        </div>
      </div>
      <ModalHost />
      <ToastHost />
    </div>
  )
}

export function RootError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-8 text-center">
      <h1 className="text-3xl font-semibold text-neutral-500">Something went wrong</h1>
      <p className="text-muted">Try refreshing the page or returning home.</p>
      <a href="/" className="rounded-xl bg-wine-500 px-4 py-2 text-sm font-medium text-white">
        Go home
      </a>
    </div>
  )
}
