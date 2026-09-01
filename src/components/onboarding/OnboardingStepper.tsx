import { cn } from '@/utils/format'
import {
  ONBOARDING_LABELS,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from '@/store/slices/onboardingSlice'

export function OnboardingStepper({ step }: { step: OnboardingStep }) {
  const index = ONBOARDING_STEPS.indexOf(step)
  const progress = ((index + 1) / ONBOARDING_STEPS.length) * 100

  return (
    <div className="w-full">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebebec]">
        <div
          className="h-full rounded-full bg-[#480516] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-[12px] flex justify-between">
        {ONBOARDING_STEPS.map((s, i) => {
          const done = i < index
          const active = i === index
          return (
            <span
              key={s}
              className={cn(
                'text-[10px] font-medium leading-[15px]',
                done && 'text-[#16a34a]',
                active && 'text-[#480516]',
                !done && !active && 'text-[#9d9ea2]',
              )}
            >
              {ONBOARDING_LABELS[s]}
            </span>
          )
        })}
      </div>
    </div>
  )
}
