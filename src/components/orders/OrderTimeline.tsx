import { cn } from '@/utils/format'
import type { OrderStep } from '@/types'

function CheckMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 7.2 5.7 10 11 4"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function OrderTimeline({ steps }: { steps: OrderStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const done = step.done
        const current = Boolean(step.current) && !done
        const pending = !done && !current
        const inProgress = current && (step.at === 'In progress' || !step.at)

        return (
          <li key={`${step.label}-${index}`} className="flex gap-4">
            <div className="flex w-8 shrink-0 flex-col items-center">
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full',
                  done && 'bg-[#22c55e]',
                  current && 'border-[3px] border-[#480516] bg-white',
                  pending && 'bg-[#f5f5f6]',
                )}
              >
                {done ? <CheckMark /> : null}
                {current ? <span className="size-2.5 rounded-full bg-[#480516]" /> : null}
                {pending ? <span className="size-2 rounded-full bg-[#d7d7d9]" /> : null}
              </span>
              {isLast ? null : (
                <span
                  className={cn(
                    'mt-1 w-px flex-1 min-h-[28px]',
                    done ? 'bg-[#22c55e]' : 'bg-[#ebebec]',
                  )}
                />
              )}
            </div>
            <div className={cn('min-w-0 flex-1', isLast ? 'pb-0' : 'pb-5')}>
              <p
                className={cn(
                  'text-[14px] font-semibold leading-5',
                  pending ? 'text-[#9ca3af]' : 'text-[#1a1e26]',
                )}
              >
                {step.label.trim()}
              </p>
              {step.at ? (
                <p
                  className={cn(
                    'mt-0.5 text-[12px] leading-[17px]',
                    inProgress || current ? 'font-medium text-[#480516]' : pending ? 'text-[#c4c5c7]' : 'text-[#9ca3af]',
                  )}
                >
                  {step.at}
                </p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
