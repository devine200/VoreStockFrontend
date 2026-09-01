import { ActivityTimeline, type TimelineItem } from '@/components/shared/ActivityTimeline'
import type { OrderStep } from '@/types'

function stepVariant(step: OrderStep): TimelineItem['variant'] {
  if (step.done) return 'done'
  if (step.current) return 'current'
  return 'pending'
}

export function OrderTimeline({ steps }: { steps: OrderStep[] }) {
  const items: TimelineItem[] = steps.map((step) => ({
    title: step.label.trim(),
    at: step.at,
    variant: stepVariant(step),
  }))

  return <ActivityTimeline embedded items={items} showBadges={false} />
}
