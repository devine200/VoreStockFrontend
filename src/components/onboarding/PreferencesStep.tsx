import { Button } from '@/components/shared/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setOrderSize, toggleOnboardingCategory } from '@/store/slices/onboardingSlice'
import { cn } from '@/utils/format'

const CATEGORIES = [
  'Heavy Equipment',
  'Electronics',
  'Commercial Vehicles',
  'Building Materials',
  'Apparel',
  'Furniture',
  'Industrial',
  'Medical Equipment',
  'Agriculture',
  'Wholesale Pallets',
]

const ORDER_SIZES = [
  'Under $5,000',
  '$5,000–$25,000',
  '$25,000–$100,000',
  '$100,000–$500,000',
  '$500,000+',
]

export function PreferencesStep({
  onContinue,
  onSkip,
}: {
  onContinue: () => void
  onSkip: () => void
}) {
  const dispatch = useAppDispatch()
  const { categories, orderSize } = useAppSelector((s) => s.onboarding)

  return (
    <div>
      <h2 className="text-[20px] font-semibold leading-7 tracking-tight text-[#1a1e26]">
        What do you buy?
      </h2>
      <p className="mt-1 text-[14px] leading-5 text-[#7a7b7c]">
        We&apos;ll use this to personalise your marketplace feed. You can change this anytime.
      </p>

      <div className="mt-6">
        <p className="text-[14px] font-medium leading-5 text-[#1a1e26]">Categories of interest</p>
        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const selected = categories.includes(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => dispatch(toggleOnboardingCategory(cat))}
                className={cn(
                  'h-[38px] rounded-lg border px-1 text-[12px] font-medium leading-5 transition',
                  selected
                    ? 'border-[#480516] bg-[#480516]/[0.06] text-[#480516]'
                    : 'border-[#ebebec] bg-white text-[#46494f] hover:border-[#dacdd0]',
                )}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[14px] font-medium leading-5 text-[#1a1e26]">Typical order size</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ORDER_SIZES.map((size) => {
            const selected = orderSize === size
            return (
              <button
                key={size}
                type="button"
                onClick={() => dispatch(setOrderSize(size))}
                className={cn(
                  'h-[38px] rounded-lg border px-1 text-[12px] font-medium leading-5 transition',
                  selected
                    ? 'border-[#480516] bg-[#480516]/[0.06] text-[#480516]'
                    : 'border-[#ebebec] bg-white text-[#46494f] hover:border-[#dacdd0]',
                )}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Button
          type="button"
          onClick={onContinue}
          className="h-[50px] w-full rounded-xl bg-[#480516] text-[14px] font-semibold"
          size="lg"
        >
          Continue
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onSkip}
          className="h-[50px] w-full rounded-xl border-[#ebebec] text-[14px] font-medium text-[#7a7b7c]"
        >
          Skip for now
        </Button>
      </div>
    </div>
  )
}
