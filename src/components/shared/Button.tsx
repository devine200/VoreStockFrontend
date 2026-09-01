import { cn } from '@/utils/format'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft' | 'pill' | 'success'

const styles: Record<Variant, string> = {
  primary: 'bg-wine-500 text-white hover:bg-wine-400',
  secondary: 'bg-white text-neutral-400 border border-border hover:bg-neutral-50',
  soft: 'bg-[#f5f5f6] text-neutral-400 border border-border',
  ghost: 'bg-transparent text-neutral-400 hover:bg-wine-50',
  danger: 'bg-accent-red text-white hover:opacity-90',
  pill: 'bg-wine-500 text-white hover:bg-wine-400 rounded-full',
  success: 'bg-[#2e9b57] text-white hover:bg-[#268a4b]',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  pill?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  pill,
  className,
  children,
  ...props
}: ButtonProps) {
  const sizes = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-10 px-6 text-sm',
    lg: 'h-11 px-6 text-sm',
  }
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',
        pill || variant === 'pill' ? 'rounded-full' : 'rounded-xl',
        styles[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
