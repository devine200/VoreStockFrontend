import { createPortal } from 'react-dom'
import { useEffect, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Icon } from '@/components/shared/Icon'
import { AdminWeeklyBarChart } from '@/components/admin/AdminCharts'
import { adminIcons } from '@/assets/admin'
import { cn } from '@/utils/format'
import type { AdminStatusKind } from '@/types/admin'

export function statusKind(status: string): AdminStatusKind {
  const s = status.toLowerCase()
  if (/(approved|verified|completed|rewarded|qualified|live|delivered|credited|active|published|winning)/.test(s)) return 'success'
  if (/(pending|approaching|hold|upcoming|in transit|customs)/.test(s)) return 'warning'
  if (/(reject|fail|default|urgent|overdue|suspend|deactivat|blacklist|breach|outbid)/.test(s)) return 'danger'
  if (/(processing|resubmission|locked|tier|restricted|info)/.test(s)) return 'info'
  return 'neutral'
}

const badgeStyles: Record<AdminStatusKind, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  danger: 'bg-red-50 border-red-200 text-red-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  neutral: 'bg-slate-100 border-slate-200 text-slate-600',
}

export function AdminBadge({
  children,
  kind,
  status,
}: {
  children?: ReactNode
  kind?: AdminStatusKind
  status?: string
}) {
  const resolved = kind ?? (status ? statusKind(status) : 'neutral')
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[12px] font-medium leading-normal whitespace-nowrap',
        badgeStyles[resolved],
      )}
    >
      {children ?? status}
    </span>
  )
}

export function AdminPageHead({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[20px] font-semibold leading-normal text-slate-900">{title}</h1>
        {subtitle ? <p className="text-[13.5px] leading-normal text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:items-center sm:justify-end [&_.inline-flex]:w-full sm:[&_.inline-flex]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export function AdminButton({
  variant = 'primary',
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'secondary' | 'danger' | 'dangerOutline' | 'infoOutline' | 'link'
}) {
  const styles = {
    primary: 'bg-[#480516] text-white hover:bg-maroon-600',
    outline: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
    secondary: 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white',
    danger: 'bg-red-600 text-white hover:opacity-90',
    dangerOutline: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
    infoOutline: 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50',
    link: 'bg-transparent px-0 py-0 text-[13px] font-medium text-maroon-600 hover:underline',
  }
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-[14px] font-medium leading-normal transition disabled:pointer-events-none disabled:opacity-40',
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminKpi({
  label,
  value,
  hint,
  hintTone,
}: {
  label: string
  value: string | number
  hint?: string
  hintTone?: 'warning' | 'success' | 'danger' | 'info' | 'muted'
}) {
  const hintColor = {
    warning: 'text-amber-700',
    success: 'text-emerald-700',
    danger: 'text-red-700',
    info: 'text-blue-700',
    muted: 'text-slate-500',
  }[hintTone ?? 'muted']
  return (
    <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-[18px]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-[20px] font-semibold leading-[26px] text-slate-900">{value}</p>
      {hint ? <p className={cn('mt-1.5 text-[12px] leading-[14px]', hintColor)}>{hint}</p> : null}
    </div>
  )
}

export function AdminSearch({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <label
      className={cn(
        'flex h-8 min-w-0 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3',
        className,
      )}
    >
      <Icon src={adminIcons.search} size={13} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full bg-transparent text-[13.5px] text-slate-700 outline-none placeholder:text-slate-400"
      />
    </label>
  )
}

export function AdminFilter({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="relative inline-flex h-8 max-w-full items-center rounded-lg border border-slate-200 bg-white pr-7 pl-3 text-[13.5px] text-slate-600">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full max-w-full appearance-none truncate bg-transparent pr-1 text-[13.5px] text-slate-600 outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {label ? `${label}: ${opt}` : opt}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
        <Icon src={adminIcons.chevronDown} size={10} />
      </span>
    </label>
  )
}

export function AdminTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'shrink-0 px-3.5 py-2.5 text-[13.5px] font-medium leading-normal',
            value === tab.id
              ? 'border-b-2 border-[#480516] text-maroon-800'
              : 'border-b-2 border-transparent text-slate-400 hover:text-slate-600',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function AdminTable({
  headers,
  children,
  footer,
  grid,
  embedded,
}: {
  headers: ReactNode[]
  children: ReactNode
  footer?: ReactNode
  grid: string
  embedded?: boolean
}) {
  return (
    <div className={embedded ? '' : 'overflow-hidden rounded-xl border border-slate-200 bg-white'}>
      <div className="-mx-px overflow-x-auto">
        <div className="min-w-max">
          <div
            className="grid min-w-[520px] items-center border-b border-slate-200 bg-slate-50 px-3 py-3 text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:min-w-[640px] sm:px-4"
            style={{ gridTemplateColumns: grid }}
          >
            {headers.map((h, i) => (
              <div key={i}>{h}</div>
            ))}
          </div>
          <div>{children}</div>
        </div>
      </div>
      {footer}
    </div>
  )
}

export function AdminRow({
  columns,
  onClick,
  grid,
}: {
  columns: ReactNode[]
  onClick?: () => void
  grid: string
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'grid w-full min-w-[520px] items-center border-b border-slate-100 px-3 py-[11px] text-left last:border-b-0 sm:min-w-[640px] sm:px-4',
        onClick && 'cursor-pointer hover:bg-slate-50',
      )}
      style={{ gridTemplateColumns: grid }}
    >
      {columns.map((col, i) => (
        <div key={i} className="min-w-0 pr-2 text-[12px] text-slate-700">
          {col}
        </div>
      ))}
    </Comp>
  )
}

export function AdminPagination({
  page,
  pages,
  total,
  onPage,
}: {
  page: number
  pages: number
  total: number
  onPage: (page: number) => void
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page {page} of {pages} · {total} records
      </p>
      <div className="flex gap-2">
        <AdminButton variant="outline" className="h-8 px-3 py-1 text-[12px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Prev
        </AdminButton>
        <AdminButton variant="outline" className="h-8 px-3 py-1 text-[12px]" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </AdminButton>
      </div>
    </div>
  )
}

export function AdminCard({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-4 sm:p-5', className)}>
      {title ? <p className="mb-3 text-[13.5px] font-semibold text-slate-800">{title}</p> : null}
      {children}
    </div>
  )
}

export function AdminKv({ label, value, badge }: { label: string; value: ReactNode; badge?: string }) {
  return (
    <div className="flex flex-col gap-1 text-[13px] leading-normal sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-slate-500">{label}</span>
      {badge ? <AdminBadge status={badge} /> : <span className="font-medium text-slate-800">{value}</span>}
    </div>
  )
}

export function AdminBack({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-800">
      <Icon src={adminIcons.back} size={14} />
      {label}
    </button>
  )
}

export function AdminModal({
  title,
  children,
  footer,
  onClose,
  wide,
}: {
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center sm:p-6 animate-fade-in">
      <button type="button" aria-label="Close dialog backdrop" className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className={cn(
          'relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-[0px_10px_20px_rgba(72,5,22,0.12)] animate-scale-in sm:p-6',
          wide ? 'max-w-[560px]' : 'max-w-[440px]',
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-[18px] font-semibold tracking-tight text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-50" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="text-[13.5px] text-slate-600">{children}</div>
        {footer ? <div className="mt-6 flex w-full justify-end gap-2">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

export function AdminBarChart({ points }: { points: { label: string; value: number }[] }) {
  return <AdminWeeklyBarChart points={points} />
}

export function usePaged<T>(rows: T[], pageSize = 8) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, pages)
  const slice = useMemo(() => rows.slice((safePage - 1) * pageSize, safePage * pageSize), [rows, safePage, pageSize])
  return { page: safePage, pages, setPage, slice, total: rows.length }
}
