import { createPortal } from 'react-dom'
import { useEffect, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Icon } from '@/components/shared/Icon'
import { AdminWeeklyBarChart } from '@/components/admin/AdminCharts'
import { adminIcons } from '@/assets/admin'
import { cn } from '@/utils/format'
import type { AdminStatusKind } from '@/types/admin'

export function statusKind(status: string): AdminStatusKind {
  const s = status.toLowerCase()
  if (s === 'synced' || s === 'published') return 'success'
  if (s === 'unpublished') return 'neutral'
  if (s === 'sync error') return 'danger'
  if (s === 'live') return 'success'
  if (s === 'active' || s === 'clear' || s === 'approved') return 'success'
  if (s === 'confirmed') return 'info'
  if (s === 'restricted') return 'warning'
  if (s === 'deactivated') return 'neutral'
  if (s === 'on hold') return 'danger'
  if (s === 'yes' || s === 'placed') return 'success'
  if (s === 'hold active') return 'info'
  if (s === 'open' || s === 'high') return 'warning'
  if (s === 'medium') return 'info'
  if (s === 'low' || s === 'waiting for buyer' || s === 'closed' || s === 'ended') return 'neutral'
  if (s === 'within sla') return 'success'
  if (s === 'scheduled' || s === 'upcoming') return 'info'
  if (s === 'outbid') return 'neutral'
  if (s === 'us 3pl' || s === 'awaiting verification' || s === 'pending verification') return 'warning'
  if (s === 'ship') return 'info'
  if (s === 'in transit') return 'info'
  if (s === 'customs' || s === 'customs clearance') return 'warning'
  if (s === 'out for delivery') return 'info'
  if (s === 'lot secured' || s === 'secured') return 'success'
  // Sync & sources (Figma: Connected/Healthy/Published=success; Warning/Pending/Sync warning=warning)
  if (s === 'connected' || s === 'healthy' || s === 'successful') return 'success'
  if (s === 'sync warning' || s === 'warning') return 'warning'
  if (s === 'failed') return 'danger'
  if (s === 'qualified') return 'info'
  if (s === 'rewarded' || s === 'issued') return 'success'
  if (s === 'reversed') return 'danger'
  if (s === 'pending issuance') return 'warning'
  if (s === 'pending') return 'neutral'
  if (/(verified|completed|complete|confirmed|matched|leading|delivered|credited|published|winning|won|healthy|packed|paid|resolved|synced)/.test(s)) return 'success'
  if (/(pending|approaching|hold|mismatch|in transit|customs|t-30|warning|delayed|ending soon|\bleft\b)/.test(s)) return 'warning'
  if (/(requires review|reject|fail|default|urgent|overdue|suspend|blacklist|breach|lost)/.test(s)) return 'danger'
  if (/(processing|resubmission|locked|tier|info|in progress)/.test(s)) return 'info'
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
  subtitleBold,
  actions,
}: {
  title: string
  subtitle?: string
  subtitleBold?: boolean
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[20px] font-semibold leading-[normal] text-slate-900">{title}</h1>
        {subtitle ? (
          <p className={cn('text-[13.5px] leading-[normal] text-slate-500', subtitleBold ? 'font-bold' : 'font-normal')}>{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:[&_.inline-flex]:w-auto [&_.inline-flex]:w-full">
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
  variant?:
    | 'primary'
    | 'outline'
    | 'secondary'
    | 'danger'
    | 'dangerOutline'
    | 'info'
    | 'infoOutline'
    | 'warningOutline'
    | 'maroonOutline'
    | 'link'
}) {
  const styles = {
    primary: 'bg-[#480516] text-white hover:bg-maroon-600',
    outline: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
    secondary: 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white',
    danger: 'bg-red-600 text-white hover:opacity-90',
    dangerOutline: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
    info: 'bg-blue-600 text-white hover:bg-blue-700',
    infoOutline: 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50',
    warningOutline: 'border border-amber-200 bg-white text-amber-600 hover:bg-amber-50',
    maroonOutline: 'border border-[#480516] bg-white text-[#480516] hover:bg-[#480516]/5',
    link: 'bg-transparent px-0 py-0 text-[13px] font-medium text-maroon-600 hover:underline',
  }
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-[14px] font-medium leading-[normal] transition disabled:pointer-events-none disabled:opacity-40',
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
    warning: 'text-amber-600',
    success: 'text-emerald-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
    muted: 'text-slate-500',
  }[hintTone ?? 'muted']
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 sm:gap-1.5 sm:p-4">
      <p className="text-[10px] font-medium uppercase leading-[normal] text-slate-500">{label}</p>
      <p className="text-[21px] font-semibold leading-[normal] text-slate-900">{value}</p>
      {hint ? <p className={cn('text-[11px] font-normal leading-[normal]', hintColor)}>{hint}</p> : null}
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
        'flex min-w-0 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white p-[5px] sm:h-8 sm:p-0 sm:px-3',
        className,
      )}
    >
      <Icon src={adminIcons.search} size={14} className="shrink-0 opacity-50" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 w-full bg-transparent text-[14px] leading-none text-slate-700 outline-none placeholder:text-slate-400 sm:text-[13px]"
      />
    </label>
  )
}

export function AdminFilter({
  label,
  value,
  options,
  onChange,
  compact,
  quiet,
}: {
  label?: string
  value: string
  options: string[]
  onChange: (value: string) => void
  compact?: boolean
  quiet?: boolean
}) {
  const compactWeight = quiet ? 'font-normal' : 'font-bold'
  const display = label ? `${label}: ${value}` : value
  return (
    <label
      className={cn(
        'relative inline-flex max-w-full items-center rounded-lg border border-slate-200 bg-white text-slate-600',
        compact
          ? cn('gap-[5px] py-[7px] pl-[11px] pr-[9px] text-[12px] leading-[normal]', compactWeight)
          : 'h-10 w-full gap-1.5 rounded-lg py-2 pl-3 pr-2.5 text-[14px] leading-none font-normal sm:h-8 sm:w-auto sm:text-[13px] sm:leading-[normal]',
      )}
    >
      {compact ? (
        <span className="relative min-w-0">
          <span className="invisible whitespace-nowrap" aria-hidden>
            {display}
          </span>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'absolute inset-0 w-full cursor-pointer appearance-none bg-transparent text-slate-600 outline-none',
              compactWeight,
            )}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {label ? `${label}: ${opt}` : opt}
              </option>
            ))}
          </select>
        </span>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full min-w-0 flex-1 appearance-none truncate bg-transparent text-[14px] leading-none text-slate-600 outline-none sm:text-[13px] sm:leading-[normal]"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {label ? `${label}: ${opt}` : opt}
            </option>
          ))}
        </select>
      )}
      <span
        className={cn(
          'pointer-events-none inline-flex shrink-0 items-center justify-center',
          compact ? 'col-start-2 row-start-1' : '',
        )}
      >
        <Icon src={adminIcons.chevronDown} size={10} />
      </span>
    </label>
  )
}

export function AdminTabs({
  tabs,
  value,
  onChange,
  quiet,
}: {
  tabs: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
  quiet?: boolean
}) {
  return (
    <div className="flex gap-0.5 overflow-x-auto border-b border-slate-200 scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className="-mb-px flex min-h-10 shrink-0 flex-col items-center gap-2 px-[3px]"
        >
          <span
            className={cn(
              'p-2.5 text-[12.5px] leading-[normal]',
              value === tab.id
                ? 'font-semibold text-maroon-600'
                : cn('text-slate-500 hover:text-slate-700', quiet ? 'font-normal' : 'font-bold'),
            )}
          >
            {tab.label}
          </span>
          <span className={cn('h-0.5 w-full', value === tab.id ? 'bg-maroon-600' : 'bg-transparent')} />
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
  pad = 'md',
  headerHeight = 'md',
}: {
  headers: ReactNode[]
  children: ReactNode
  footer?: ReactNode
  grid: string
  embedded?: boolean
  /** Figma Sync tables use 24px horizontal padding */
  pad?: 'md' | 'lg'
  headerHeight?: 'md' | 'sm'
}) {
  // Embedded tables are expected inside an xl+ gate (AdminDataTable) — no forced min-width.
  const headerClass = embedded
    ? 'grid w-full min-w-0 items-center border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500'
    : 'grid min-w-[520px] items-center border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:min-w-[640px]'
  return (
    <div className={embedded ? 'min-w-0' : 'overflow-hidden rounded-xl border border-slate-200 bg-white'}>
      <div className={cn('-mx-px', embedded ? 'min-w-0' : 'overflow-x-auto')}>
        <div className={embedded ? 'min-w-0' : 'min-w-max'}>
          <div
            className={cn(
              headerClass,
              headerHeight === 'sm' ? 'h-[29px]' : 'h-[34px]',
              pad === 'lg' ? 'px-6' : 'px-4',
            )}
            style={{ gridTemplateColumns: grid }}
          >
            {headers.map((h, i) => (
              <div key={i} className="min-w-0">
                {h}
              </div>
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
  tall,
  className,
  pad = 'md',
  embedded,
}: {
  columns: ReactNode[]
  onClick?: () => void
  grid: string
  tall?: boolean
  className?: string
  pad?: 'md' | 'lg'
  /** When true (AdminDataTable), drop forced min-widths */
  embedded?: boolean
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'grid w-full items-center border-b border-slate-100 text-left last:border-b-0',
        embedded ? 'min-w-0' : 'min-w-[520px] sm:min-w-[640px]',
        tall ? 'h-[54px]' : 'h-[43px]',
        pad === 'lg' ? 'px-6' : 'px-4',
        onClick && 'cursor-pointer hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none',
        className,
      )}
      style={{ gridTemplateColumns: grid }}
    >
      {columns.map((col, i) => (
        <div key={i} className="min-w-0 pr-2 text-[12px] leading-[normal] text-slate-800">
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
  noun = 'records',
  summary,
  prevLabel = 'Prev',
  nextLabel = 'Next',
  large,
  bare,
}: {
  page: number
  pages: number
  total: number
  onPage: (page: number) => void
  noun?: string
  /** When set, replaces the default "Page X of Y · N noun" label. */
  summary?: string
  prevLabel?: string
  nextLabel?: string
  /** Figma Sync pager: 38px Previous/Next */
  large?: boolean
  /** No top border — pager sits outside the table card */
  bare?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 text-[12px] leading-[normal] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:text-[11.5px]',
        bare ? 'px-0 py-0' : 'border-t border-slate-200 px-3.5 py-3.5 sm:px-4 sm:py-3',
      )}
    >
      <p className="text-center sm:text-left">{summary ?? `Page ${page} of ${pages} · ${total} ${noun}`}</p>
      <div className={cn('grid grid-cols-2 gap-2 sm:flex sm:w-auto', large ? 'sm:gap-2' : 'sm:gap-1.5')}>
        <AdminButton
          variant="outline"
          className={
            large
              ? 'h-10 w-full px-4 py-2.5 text-[14px] font-medium sm:h-[38px] sm:w-auto'
              : 'h-10 w-full px-3 py-0 text-[13px] font-medium sm:h-[27px] sm:w-auto sm:px-2.5 sm:text-[12px]'
          }
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          {prevLabel}
        </AdminButton>
        <AdminButton
          variant="outline"
          className={
            large
              ? 'h-10 w-full px-4 py-2.5 text-[14px] font-medium sm:h-[38px] sm:w-auto'
              : 'h-10 w-full px-3 py-0 text-[13px] font-medium sm:h-[27px] sm:w-auto sm:px-2.5 sm:text-[12px]'
          }
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          {nextLabel}
        </AdminButton>
      </div>
    </div>
  )
}

export function AdminCard({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-4 sm:gap-3 sm:p-5', className)}>
      {title ? <p className="text-[13.5px] font-semibold leading-[normal] text-slate-800">{title}</p> : null}
      {children}
    </div>
  )
}

export function AdminKv({
  label,
  value,
  badge,
  tone,
}: {
  label: string
  value?: ReactNode
  badge?: string
  tone?: 'strong' | 'muted' | 'danger' | 'emphasis'
}) {
  const valueClass =
    tone === 'muted'
      ? 'font-normal text-slate-400'
      : tone === 'danger'
        ? 'font-medium text-red-600'
        : tone === 'emphasis'
          ? 'text-[15px] font-semibold text-slate-900'
          : tone === 'strong'
            ? 'font-medium text-slate-800'
            : 'font-normal text-slate-700'
  return (
    <div className="flex flex-col gap-1 text-[13px] leading-[normal] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="shrink-0 text-slate-500">{label}</span>
      {badge ? (
        <AdminBadge status={badge} />
      ) : (
        <span className={cn('min-w-0 break-words sm:text-right', valueClass)}>{value}</span>
      )}
    </div>
  )
}

/** Compact label/value row for config cards — stacks on narrow viewports. */
export function AdminFieldRow({
  label,
  value,
  className,
}: {
  label: string
  value: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-0.5 text-[12.5px] leading-[normal] sm:flex-row sm:items-center sm:justify-between sm:gap-3',
        className,
      )}
    >
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 font-medium break-words text-slate-800 sm:text-right">{value}</span>
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
  subtitle,
  icon,
  children,
  footer,
  onClose,
  wide,
  maxWidth,
  bare,
  showClose = true,
  footerAlign = 'end',
}: {
  title?: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  wide?: boolean
  maxWidth?: 400 | 420 | 440 | 460 | 512 | 560
  bare?: boolean
  showClose?: boolean
  footerAlign?: 'end' | 'start'
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
          'relative z-10 flex max-h-[90vh] w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-[0px_10px_20px_rgba(72,5,22,0.12)] animate-scale-in',
          maxWidth === 400
            ? 'max-w-[400px]'
            : maxWidth === 420
              ? 'max-w-[420px]'
              : maxWidth === 460
                ? 'max-w-[460px]'
                : maxWidth === 512
                  ? 'max-w-[512px]'
                  : wide || maxWidth === 560
                    ? 'max-w-[560px]'
                    : 'max-w-[440px]',
          bare ? 'overflow-y-auto p-0' : 'overflow-hidden',
        )}
      >
        {bare ? (
          children
        ) : (
          <>
            {icon || title ? (
              <div className="flex shrink-0 items-start justify-between gap-3 px-6 pt-6">
                <div className="flex min-w-0 items-start gap-3">
                  {icon}
                  <div className="flex min-w-0 flex-col gap-1">
                    {title ? (
                      <h2 className={cn('font-semibold leading-[normal] text-slate-900', icon ? 'text-[15px]' : 'text-[18px] tracking-tight')}>
                        {title}
                      </h2>
                    ) : null}
                    {subtitle ? <p className="text-[12.5px] font-normal leading-[normal] text-slate-500">{subtitle}</p> : null}
                  </div>
                </div>
                {showClose && !icon ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400"
                    aria-label="Close"
                  >
                    <Icon src={adminIcons.close} size={16} />
                  </button>
                ) : null}
              </div>
            ) : null}
            <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 text-[13.5px] text-slate-600', icon || title ? 'pt-4' : 'pt-6')}>
              {children}
            </div>
            {footer ? (
              <div
                className={cn(
                  'flex w-full shrink-0 flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:[&_.inline-flex]:w-auto [&_.inline-flex]:w-full',
                  footerAlign === 'start' ? 'sm:justify-start' : 'sm:justify-end',
                )}
              >
                {footer}
              </div>
            ) : (
              <div className="shrink-0 pb-6" />
            )}
          </>
        )}
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
