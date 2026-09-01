import { cn } from '@/utils/format'

const STEPS = ['Issue', 'Evidence', 'Review', 'Resolution'] as const

export function DisputeStepper({ completedSteps }: { completedSteps: number }) {
  return (
    <div className="flex items-start">
      {STEPS.map((label, i) => {
        const done = i < completedSteps
        const current = i === completedSteps && completedSteps < STEPS.length
        const active = done || current
        return (
          <div key={label} className={cn('flex items-center', i < STEPS.length - 1 ? 'flex-1' : '')}>
            <div className="flex w-auto min-w-0 flex-col items-center sm:w-[87px]">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-[11px] font-semibold',
                  active ? 'bg-wine-500 text-white' : 'bg-[#f5f5f6] text-[#9ca3af]',
                )}
              >
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path
                      d="M2 5.2 4 7.2 8 2.8"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  'mt-1.5 text-[11px] font-medium uppercase tracking-wide',
                  active ? 'text-[#1a1e26]' : 'text-[#9ca3af]',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <span className={cn('mb-5 h-px flex-1', done ? 'bg-wine-500' : 'bg-[#e5e7eb]')} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
