import logo from '@/assets/images/logo.png'
import { Button } from '@/components/shared/Button'

export function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-10 w-[59px] overflow-hidden">
        <img src={logo} alt="VSK Global" className="h-full w-auto object-contain" />
      </div>
      <h1 className="mt-8 text-[28px] font-semibold leading-9 tracking-tight text-[#1a1e26]">
        Welcome to the marketplace
      </h1>
      <p className="mt-3 max-w-[448px] text-[14px] leading-[26px] text-[#7a7b7c]">
        Access thousands of premium auction lots — heavy equipment, electronics, bulk pallets,
        commercial vehicles, and more. Bid with confidence on verified inventory from global sellers.
      </p>
      <Button
        type="button"
        onClick={onContinue}
        className="mt-10 h-[52px] w-full max-w-[384px] rounded-xl bg-[#480516] text-[16px] font-semibold"
        size="lg"
      >
        Get started →
      </Button>
    </div>
  )
}
