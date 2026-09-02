import { cn } from '@/utils/format'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import checkIcon from '@/assets/icons/check.svg'

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

export function Checkbox({
  checked,
  onChange,
  children,
  required,
  className,
  align = 'center',
  name,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  required?: boolean
  className?: string
  align?: 'center' | 'start'
  name?: string
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer gap-3',
        align === 'start' ? 'items-start' : 'items-center',
        className,
      )}
    >
      <span className={cn('relative size-5 shrink-0', align === 'start' && 'mt-0.5')}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          required={required}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <span className="pointer-events-none flex size-5 items-center justify-center rounded-[6px] border-[1.5px] border-[#ebebec] bg-white peer-checked:border-[#480516] peer-checked:bg-[#480516] peer-focus-visible:ring-2 peer-focus-visible:ring-[#480516]/20">
          <img
            src={checkIcon}
            alt=""
            className={cn('h-[8px] w-[11px] max-w-none', checked ? 'block' : 'hidden')}
          />
        </span>
      </span>
      {children}
    </label>
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
