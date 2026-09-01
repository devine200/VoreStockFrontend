import { cn } from '@/utils/format'
import type { ReactNode } from 'react'

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border-soft scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative -mb-px shrink-0 px-4 py-3 text-sm font-medium transition',
            value === tab.id ? 'text-wine-500' : 'text-muted hover:text-neutral-500',
          )}
        >
          {tab.label}
          {tab.count != null ? (
            <span className="ml-2 rounded-full bg-wine-50 px-2 py-0.5 text-xs text-wine-500">{tab.count}</span>
          ) : null}
          {value === tab.id ? (
            <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-wine-500" />
          ) : null}
        </button>
      ))}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-neutral-900 sm:text-[32px]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-[1.5] text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white px-8 py-16 text-center animate-fade-in">
      <h3 className="text-lg font-medium text-neutral-500">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand'
}) {
  const tones = {
    neutral: 'bg-wine-50 text-secondary-500',
    success: 'bg-dock-soft text-dock',
    warning: 'bg-warning-soft text-wine-500',
    danger: 'bg-danger-soft text-accent-red',
    brand: 'bg-wine-500 text-white',
  }
  return (
    <span className={cn('inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}
