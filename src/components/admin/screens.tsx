import { type ReactNode, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AdminBadge,
  AdminBack,
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKv,
  AdminModal,
  AdminPageHead,
  AdminPagination,
  AdminRow,
  AdminSearch,
  AdminTable,
  usePaged,
} from '@/components/admin/ui'
import { Icon } from '@/components/shared/Icon'
import { ActivityTimeline } from '@/components/shared/ActivityTimeline'
import { adminIcons } from '@/assets/admin'
import { cn } from '@/utils/format'

export function AdminListShell({
  title,
  subtitle,
  actions,
  kpis,
  toolbar,
  children,
  showExport,
}: {
  title: string
  subtitle: string
  actions?: ReactNode
  kpis?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  showExport?: boolean
}) {
  return (
    <div className="flex w-full max-w-full flex-col gap-4 animate-fade-in sm:gap-5">
      <AdminPageHead
        title={title}
        subtitle={subtitle}
        actions={
          actions ?? (showExport ? <AdminExportButton /> : undefined)
        }
      />
      {kpis}
      {toolbar}
      {children}
    </div>
  )
}

export function AdminExportButton({ label = 'Export' }: { label?: string }) {
  return <AdminButton variant="outline">{label}</AdminButton>
}

export function AdminSummaryGrid({
  cols = 5,
  children,
}: {
  cols?: 3 | 4 | 5
  children: ReactNode
}) {
  const gridClass =
    cols === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : cols === 4
        ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-5'
  return <div className={cn('grid gap-2.5 sm:gap-3', gridClass)}>{children}</div>
}

export function AdminTablePanel({
  toolbar,
  secondaryToolbar,
  children,
}: {
  toolbar?: ReactNode
  secondaryToolbar?: ReactNode
  children: ReactNode
}) {
  const toolbarClass =
    'flex flex-col gap-3 border-b border-slate-100 px-3.5 py-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5 sm:px-4 sm:py-4 [&>label]:w-full sm:[&>label]:w-auto'
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {toolbar ? <div className={toolbarClass}>{toolbar}</div> : null}
      {secondaryToolbar ? (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-3.5 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4 [&>label]:w-full sm:[&>label]:w-auto">
          {secondaryToolbar}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export function AdminDetailHeader({
  title,
  titleClassName,
  badge,
  badgeKind,
  badges,
  subtitle,
  actions,
}: {
  title: string
  titleClassName?: string
  badge?: string
  badgeKind?: import('@/types/admin').AdminStatusKind
  badges?: string[]
  subtitle?: string
  actions?: ReactNode
}) {
  const statusBadges = badges?.length ? badges : badge ? [badge] : []
  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className={cn('font-semibold leading-[normal]', titleClassName ?? 'text-[20px] text-slate-900')}>{title}</h1>
          {statusBadges.map((b) => (
            <AdminBadge key={b} status={b} kind={statusBadges.length === 1 ? badgeKind : undefined} />
          ))}
        </div>
        {subtitle ? <p className="mt-1 text-[13.5px] font-normal leading-[normal] text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <AdminActionBar>{actions}</AdminActionBar> : null}
    </div>
  )
}

export function AdminDetailShell({
  backLabel,
  onBack,
  title,
  titleClassName,
  badge,
  badgeKind,
  badges,
  subtitle,
  actions,
  children,
}: {
  backLabel: string
  onBack: () => void
  title: string
  titleClassName?: string
  badge?: string
  badgeKind?: import('@/types/admin').AdminStatusKind
  badges?: string[]
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex w-full max-w-full flex-col gap-4 animate-fade-in sm:gap-5">
      <AdminBack label={backLabel} onClick={onBack} />
      <AdminDetailHeader
        title={title}
        titleClassName={titleClassName}
        badge={badge}
        badgeKind={badgeKind}
        badges={badges}
        subtitle={subtitle}
        actions={actions}
      />
      {children}
    </div>
  )
}

export function AdminNotFound({
  label,
  to,
}: {
  label: string
  to: string
}) {
  const navigate = useNavigate()
  return (
    <div className="py-16 text-center text-slate-500">
      Record not found.{' '}
      <button type="button" className="font-medium text-maroon-600 hover:underline" onClick={() => navigate(to)}>
        {label}
      </button>
    </div>
  )
}

export function matchesQuery(haystack: string, query: string) {
  if (!query.trim()) return true
  return haystack.toLowerCase().includes(query.trim().toLowerCase())
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 [&>label]:w-full sm:[&>label]:w-auto">
      {children}
    </div>
  )
}

/** L2 decision actions — full-width stack on phone, row from sm. */
export function AdminActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:[&_.inline-flex]:w-auto [&_.inline-flex]:w-full',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * L3 stage / journey tracker — vertical on phone, horizontal rail from sm.
 * - progress: done = before current; current ring; pending hollow
 * - inclusive: current and prior show check (referral journey style)
 */
export function AdminStageTracker({
  stages,
  currentIndex,
  complete,
  currentTone = 'emerald',
  mode = 'progress',
  className,
}: {
  stages: readonly string[] | string[]
  currentIndex: number
  /** Force all stages complete (e.g. delivered) */
  complete?: boolean
  currentTone?: 'emerald' | 'amber'
  mode?: 'progress' | 'inclusive'
  className?: string
}) {
  const allDone = Boolean(complete) || (mode === 'progress' && currentIndex >= stages.length - 1)

  const lineTone = currentTone === 'amber' ? 'bg-amber-600' : 'bg-emerald-500'
  const lineToneStrong = currentTone === 'amber' ? 'bg-amber-600' : 'bg-emerald-600'
  const ringTone = currentTone === 'amber' ? 'border-amber-600' : 'border-emerald-600'
  const dotTone = currentTone === 'amber' ? 'bg-amber-600' : 'bg-emerald-600'
  const doneLabel = currentTone === 'amber' ? 'text-amber-700' : 'text-emerald-700'
  const fillBg = currentTone === 'amber' ? 'bg-amber-600' : 'bg-emerald-500'

  function stageState(i: number) {
    if (mode === 'inclusive') {
      const pending = i > currentIndex
      const done = i <= currentIndex
      const current = i === currentIndex && currentIndex < stages.length - 1
      return { done: done && !pending, current, pending, lineBefore: i <= currentIndex, lineAfter: i < currentIndex }
    }
    const done = allDone || i < currentIndex
    const current = !allDone && i === currentIndex
    return {
      done,
      current,
      pending: !done && !current,
      lineBefore: allDone || i <= currentIndex,
      lineAfter: allDone || i < currentIndex,
    }
  }

  function StageIcon({ i }: { i: number }) {
    const { done, current, pending } = stageState(i)
    if (mode === 'inclusive' && pending) {
      return <Icon src={adminIcons.referralStagePending} className="size-7 shrink-0" />
    }
    if (done) {
      return (
        <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', fillBg)}>
          <Icon src={adminIcons.referralCheck} size={14} />
        </div>
      )
    }
    if (current) {
      return (
        <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full border-2 bg-white', ringTone)}>
          <span className={cn('size-[9px] rounded-full', dotTone)} />
        </div>
      )
    }
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50">
        <span className="size-[9px] rounded-full bg-slate-300" />
      </div>
    )
  }

  function labelClass(i: number, size: 'sm' | 'md' = 'sm') {
    const { done, current, pending } = stageState(i)
    const base = size === 'md' ? 'text-[13px] leading-tight' : 'max-w-full px-0.5 text-center text-[11px] leading-tight'
    if (done) return cn(base, 'font-medium', doneLabel)
    if (current) return cn(base, mode === 'inclusive' ? 'font-semibold text-[#480516]' : 'font-semibold text-slate-800')
    if (pending && mode === 'inclusive') return cn(base, size === 'md' ? 'font-medium text-slate-500' : 'font-medium text-[#480516]')
    return cn(base, 'font-normal text-slate-400')
  }

  return (
    <div className={cn('w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 sm:px-6 sm:py-5', className)}>
      <ol className="flex flex-col gap-0 sm:hidden">
        {stages.map((label, i) => {
          const { lineAfter } = stageState(i)
          return (
            <li key={label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <StageIcon i={i} />
                {i < stages.length - 1 ? (
                  <div className={cn('my-1 min-h-[20px] w-0.5 flex-1', lineAfter ? lineToneStrong : 'bg-slate-200')} />
                ) : null}
              </div>
              <div className="min-w-0 pb-4 pt-1">
                <p className={labelClass(i, 'md')}>{label}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="hidden w-full items-start justify-center sm:flex">
        {stages.map((label, i) => {
          const { lineBefore, lineAfter } = stageState(i)
          return (
            <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                {i > 0 ? <div className={cn('h-0.5 flex-1', lineBefore ? lineTone : 'bg-slate-200')} /> : <div className="flex-1" />}
                <StageIcon i={i} />
                {i < stages.length - 1 ? (
                  <div className={cn('h-0.5 flex-1', lineAfter ? lineTone : 'bg-slate-200')} />
                ) : (
                  <div className="flex-1" />
                )}
              </div>
              <p className={labelClass(i)}>{label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type MobileColRole = 'title' | 'status' | 'meta' | 'value' | 'hide'

type Col<T> = {
  header: string
  render: (row: T) => ReactNode
  align?: 'right'
  /** How this column appears in the mobile list row. Inferred from the header when omitted. */
  mobile?: MobileColRole
}

function inferMobileRole(header: string, index: number): MobileColRole {
  const h = header.toLowerCase()
  if (/(^|\s)(status|stage|payment|kyc|hold|sla|priority|severity|sync)(\s|$)/.test(h) || h.includes('status')) {
    return 'status'
  }
  if (/(amount|total|fee|price|bid|payout|net|value|reward)/.test(h)) return 'value'
  if (index === 0) return 'title'
  if (/(action|open)/.test(h)) return 'hide'
  return 'meta'
}

function pickMobileLayout<T>(columns: Col<T>[]) {
  const roles = columns.map((col, i) => col.mobile ?? inferMobileRole(col.header, i))
  const titleIdx = roles.findIndex((r) => r === 'title')
  const statusIdx = roles.findIndex((r) => r === 'status')
  const valueIdx = roles.findIndex((r) => r === 'value')
  const metaIdxs = roles
    .map((r, i) => (r === 'meta' ? i : -1))
    .filter((i) => i >= 0)
    .slice(0, 2)

  return {
    title: columns[titleIdx >= 0 ? titleIdx : 0],
    status: statusIdx >= 0 ? columns[statusIdx] : undefined,
    value: valueIdx >= 0 ? columns[valueIdx] : undefined,
    meta: metaIdxs.map((i) => columns[i]),
  }
}

/**
 * Mobile record cards — separated bordered rows (not a flat hairline list).
 * title + status, meta, optional value, disclosure chevron.
 */
function AdminMobileRecordList<T extends { id: string }>({
  rows,
  columns,
  onRow,
}: {
  rows: T[]
  columns: Col<T>[]
  onRow?: (row: T) => void
  actionLabel?: string
}) {
  const layout = pickMobileLayout(columns)

  return (
    <ul className="flex flex-col gap-2.5 bg-slate-50 p-3 xl:hidden">
      {rows.map((row) => {
        const Comp = onRow ? 'button' : 'div'
        const titleNode = layout.title.render(row)
        const statusNode = layout.status?.render(row)
        const valueNode = layout.value?.render(row)
        const metaNodes = layout.meta.map((col) => col.render(row)).filter(Boolean)

        return (
          <li key={row.id}>
            <Comp
              type={onRow ? 'button' : undefined}
              onClick={onRow ? () => onRow(row) : undefined}
              className={cn(
                'flex w-full min-h-[72px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors',
                onRow && 'active:border-maroon-200 active:bg-maroon-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 text-[14px] font-semibold leading-snug text-slate-900 [&_*]:font-semibold [&_*]:text-slate-900">
                    {titleNode}
                  </p>
                  {statusNode ? <div className="shrink-0 pt-0.5">{statusNode}</div> : null}
                </div>

                {metaNodes.length > 0 ? (
                  <div className="mt-1.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[12.5px] leading-snug text-slate-500">
                    {metaNodes.map((node, i) => (
                      <span
                        key={i}
                        className="inline-flex min-w-0 max-w-[55%] items-center gap-1.5 overflow-hidden [&_*]:truncate [&_*]:text-[12.5px] [&_*]:font-normal [&_*]:text-slate-500"
                      >
                        {i > 0 ? (
                          <span className="shrink-0 text-slate-300" aria-hidden>
                            •
                          </span>
                        ) : null}
                        <span className="min-w-0 truncate">{node}</span>
                      </span>
                    ))}
                  </div>
                ) : null}

                {valueNode ? (
                  <p className="mt-1.5 text-[13px] font-semibold leading-snug text-slate-900 [&_*]:font-semibold [&_*]:text-slate-900">
                    {valueNode}
                  </p>
                ) : null}
              </div>

              {onRow ? <Icon src={adminIcons.chevronOpen} size={14} className="shrink-0 opacity-35" /> : null}
            </Comp>
          </li>
        )
      })}
    </ul>
  )
}

export function AdminDataTable<T extends { id: string }>({
  rows,
  columns,
  grid,
  onRow,
  actionLabel = 'Open',
  pageSize = 8,
  embedded = false,
  tall,
  noun = 'records',
  summary,
}: {
  rows: T[]
  columns: Col<T>[]
  grid: string
  onRow?: (row: T) => void
  actionLabel?: string
  pageSize?: number
  embedded?: boolean
  tall?: boolean
  noun?: string
  summary?: string
}) {
  const paging = usePaged(rows, pageSize)
  const showAction = Boolean(onRow)
  const headers = showAction ? [...columns.map((c) => c.header), ''] : columns.map((c) => c.header)
  const footer = (
    <AdminPagination
      page={paging.page}
      pages={paging.pages}
      total={paging.total}
      onPage={paging.setPage}
      noun={noun}
      summary={summary}
    />
  )

  return (
    <div className={cn('min-w-0', embedded ? '' : 'overflow-hidden rounded-xl border border-slate-200 bg-white')}>
      <AdminMobileRecordList
        rows={paging.slice}
        columns={columns}
        onRow={onRow}
      />
      <div className="hidden min-w-0 xl:block">
        <AdminTable embedded grid={grid} headers={headers} footer={footer}>
          {paging.slice.map((row) => (
            <AdminRow
              key={row.id}
              grid={grid}
              tall={tall}
              embedded
              onClick={onRow ? () => onRow(row) : undefined}
              columns={
                showAction
                  ? [
                      ...columns.map((c) => c.render(row)),
                      <span className="block text-right text-[13px] font-medium text-[#480516]">{actionLabel}</span>,
                    ]
                  : columns.map((c) => c.render(row))
              }
            />
          ))}
        </AdminTable>
      </div>
      <div className="xl:hidden">{footer}</div>
    </div>
  )
}

export function StatusCell({ status }: { status: string }) {
  return <AdminBadge status={status} />
}

export function ConfirmModal({
  title,
  body,
  confirmLabel,
  danger,
  onClose,
  onConfirm,
  children,
}: {
  title: string
  body?: string
  confirmLabel: string
  danger?: boolean
  onClose: () => void
  onConfirm: () => void
  children?: ReactNode
}) {
  return (
    <AdminModal
      title={title}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </AdminButton>
        </>
      }
    >
      {body ? <p className="leading-relaxed">{body}</p> : null}
      {children}
    </AdminModal>
  )
}

export function NotesPanel({
  notes,
  onAdd,
}: {
  notes: { id: string; body: string; at: string; author: string }[]
  onAdd: (body: string) => void
}) {
  const [value, setValue] = useState('')
  return (
    <AdminCard title="Internal Notes" className="flex-1">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a note visible to other admins reviewing this case"
        className="min-h-[133px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12.5px] leading-[normal] text-slate-700 outline-none placeholder:text-slate-400 focus:border-maroon-400"
      />
      <div className="mt-3 flex justify-start">
        <AdminButton
          variant="outline"
          className="h-[38px] px-4 py-2.5 text-[14px]"
          disabled={!value.trim()}
          onClick={() => {
            onAdd(value.trim())
            setValue('')
          }}
        >
          Add Note
        </AdminButton>
      </div>
      <div className="mt-4 space-y-3">
        {notes.map((n) => (
          <div key={n.id} className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[13px] text-slate-800">{n.body}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              {n.author} · {n.at}
            </p>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function HistoryPanel({
  title = 'History',
  items,
}: {
  title?: string
  items: { title: string; at: string; status: string; detail?: string }[]
}) {
  return (
    <ActivityTimeline
      title={title}
      items={items}
      className="flex-1"
    />
  )
}

export function useTextFilter<T>(rows: T[], query: string, toHaystack: (row: T) => string) {
  return useMemo(() => rows.filter((row) => matchesQuery(toHaystack(row), query)), [rows, query, toHaystack])
}

export function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px]">
      <span className="font-medium text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13.5px] text-slate-800 outline-none focus:border-maroon-400"
      />
    </label>
  )
}

export function DocRow({
  name,
  size,
  status,
  uploaded,
  onPreview,
  onApprove,
  onReject,
  onResubmit,
}: {
  name: string
  size: string
  status: string
  uploaded: string
  onPreview?: () => void
  onApprove?: () => void
  onReject?: () => void
  onResubmit?: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[10px] bg-slate-50 px-3.5 py-3 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <Icon src={adminIcons.file} size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-[normal] text-slate-800">{name}</p>
        <p className="text-[11.5px] font-normal leading-[normal] text-slate-500">
          Uploaded {uploaded} · {size}
        </p>
      </div>
      <AdminBadge status={status} />
      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
        <button type="button" aria-label="Preview document" className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400" onClick={onPreview}>
          <Icon src={adminIcons.view} size={14} />
        </button>
        <button type="button" aria-label="Approve document" className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400" onClick={onApprove}>
          <Icon src={adminIcons.approve} size={14} />
        </button>
        <button type="button" aria-label="Reject document" className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400" onClick={onReject}>
          <Icon src={adminIcons.reject} size={14} />
        </button>
        <button type="button" aria-label="Request resubmission" className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-400" onClick={onResubmit}>
          <Icon src={adminIcons.refresh} size={14} />
        </button>
      </div>
    </div>
  )
}

export function TwoCol({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4', className)}>{children}</div>
}

export { AdminKv }
