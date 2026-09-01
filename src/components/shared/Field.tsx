import { cn } from '@/utils/format'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string
  children: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <label className={cn('flex flex-col gap-1.5 text-sm', className)}>
      <span className="font-medium text-neutral-400">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-[46px] w-full rounded-xl border border-border bg-white px-4 text-sm text-neutral-500 outline-none transition placeholder:text-neutral-500/50 focus:border-wine-400 focus:ring-2 focus:ring-wine-500/10',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-500/10',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-[46px] w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition focus:border-wine-400 focus:ring-2 focus:ring-wine-500/10',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
