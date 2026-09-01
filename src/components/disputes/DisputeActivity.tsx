import { cn } from '@/utils/format'
import type { DisputeEvent } from '@/types'

function ActorIcon({ actor }: { actor: DisputeEvent['actor'] }) {
  if (actor === 'you') {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-wine-500 text-[10px] font-semibold text-white">
        You
      </span>
    )
  }
  if (actor === 'cs') {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e8f1fb] text-[11px] font-semibold text-[#1d4ed8]">
        CS
      </span>
    )
  }
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f5f5f6] text-[#7a7b7c]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M19.4 13a7.8 7.8 0 0 0 .1-2l2-1.2-2-3.4-2.3.6a8 8 0 0 0-1.7-1L15 4h-4l-.5 2a8 8 0 0 0-1.7 1l-2.3-.6-2 3.4 2 1.2a7.8 7.8 0 0 0 .1 2l-2 1.2 2 3.4 2.3-.6a8 8 0 0 0 1.7 1l.5 2h4l.5-2a8 8 0 0 0 1.7-1l2.3.6 2-3.4-2-1.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function DisputeActivity({ events }: { events: DisputeEvent[] }) {
  return (
    <ol className="space-y-4">
      {events.map((event, i) => (
        <li key={`${event.title}-${i}`} className="flex gap-3">
          <ActorIcon actor={event.actor} />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
              <span className="font-semibold text-[#1a1e26]">{event.title}</span>
              <span className="text-[12px] text-[#9ca3af]">{event.at}</span>
            </p>
            <p className={cn('mt-0.5 text-[13px] leading-5 text-[#7a7b7c]')}>{event.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
