import { cn } from '@/utils/format'
import { Icon } from '@/components/shared/Icon'
import { icons } from '@/assets'

const STEPS = ['Issue', 'Evidence', 'Review', 'Resolution'] as const

export function DisputeStepper({ completedSteps }: { completedSteps: number }) {
  return (
    <div className="flex min-w-[280px] items-start">
      {STEPS.map((label, i) => {
        const done = i < completedSteps
        const current = i === completedSteps && completedSteps < STEPS.length
        const active = done || current
        return (
          <div key={label} className={cn('flex items-center', i < STEPS.length - 1 ? 'flex-1' : '')}>
            <div className="flex w-auto min-w-0 flex-col items-center sm:w-[87px]">
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-[12px] font-semibold',
                  active ? 'bg-[#480516] text-white' : 'bg-[#f5f5f6] text-[#9ca3af]',
                )}
              >
                {done ? <Icon src={icons.check} size={12} /> : i + 1}
              </span>
              <span
                className={cn(
                  'mt-1.5 text-[10px] font-medium uppercase tracking-wide sm:text-[11px]',
                  active ? 'text-[#1a1e26]' : 'text-[#9ca3af]',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <span className={cn('mb-5 h-px flex-1', done ? 'bg-[#480516]' : 'bg-[#e5e7eb]')} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
