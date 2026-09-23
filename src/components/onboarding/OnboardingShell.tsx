import logo from '@/assets/images/logo.png'
import { Icon } from '@/components/shared/Icon'
import arrowLeft from '@/assets/icons/arrow-left.svg'
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper'
import {
  ONBOARDING_STEPS,
  type OnboardingStep,
} from '@/store/slices/onboardingSlice'
import { cn } from '@/utils/format'
import type { CSSProperties, ReactNode } from 'react'

/** Full VSK mark (gavel, wordmark, tagline) — zooms past PNG padding without clipping the artwork. */
const LOGO_VIEW: CSSProperties = {
  objectFit: 'contain',
  objectViewBox: 'inset(27.5% 29.5% 21% 28.8%)',
}

export function OnboardingLogo({
  className,
  alt = 'VSK Global',
}: {
  className?: string
  alt?: string
}) {
  return (
    <img
      src={logo}
      alt={alt}
      className={cn('pointer-events-none object-contain', className)}
      style={LOGO_VIEW}
    />
  )
}

export function OnboardingShell({
  step,
  onBack,
  children,
}: {
  step: OnboardingStep
  onBack?: () => void
  children: ReactNode
}) {
  const stepNumber = ONBOARDING_STEPS.indexOf(step) + 1
  const total = ONBOARDING_STEPS.length

  return (
    <div className="w-full max-w-[512px] overflow-hidden rounded-2xl border border-[#ebebec] bg-white shadow-[0px_20px_40px_rgba(26,30,38,0.18)]">
      <div className="border-b border-[#f5f5f6] px-5 pb-5 pt-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <OnboardingLogo alt="VSK" className="h-6 w-[36px] shrink-0" />
            <span className="text-[16px] font-semibold leading-6 text-[#1a1e26]">Onboarding</span>
          </div>
          <span className="text-[12px] leading-4 text-[#9d9ea2]">
            Step {stepNumber} of {total}
          </span>
        </div>
        <div className="mt-4">
          <OnboardingStepper step={step} />
        </div>
      </div>

      {onBack ? (
        <div className="px-5 pt-3 sm:px-8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium leading-4 text-[#7a7b7c] transition hover:text-[#480516]"
          >
            <Icon src={arrowLeft} size={12} />
            Back
          </button>
        </div>
      ) : null}

      <div className={onBack ? 'px-5 pb-8 pt-3 sm:px-8' : 'px-5 py-8 sm:px-8'}>{children}</div>
    </div>
  )
}
