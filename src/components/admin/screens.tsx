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
    <div className="flex w-full max-w-full flex-col gap-5 animate-fade-in">
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
  return <div className={cn('grid gap-3', gridClass)}>{children}</div>
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
    'flex flex-col gap-2 border-b border-slate-200 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4 sm:py-4'
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {toolbar ? <div className={toolbarClass}>{toolbar}</div> : null}
      {secondaryToolbar ? (
        <div className="flex flex-col gap-2 border-b border-slate-200 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4">
          {secondaryToolbar}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export function AdminDetailHeader({
  title,
  badge,
  subtitle,
  actions,
}: {
  title: string
  badge?: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[20px] font-semibold text-slate-900">{title}</h1>
          {badge ? <AdminBadge status={badge} /> : null}
        </div>
        {subtitle ? <p className="mt-1 text-[13.5px] text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:justify-end [&_.inline-flex]:w-full sm:[&_.inline-flex]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export function AdminDetailShell({
  backLabel,
  onBack,
  title,
  badge,
  subtitle,
  actions,
  children,
}: {
  backLabel: string
  onBack: () => void
  title: string
  badge?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex w-full max-w-full flex-col gap-5 animate-fade-in">
      <AdminBack label={backLabel} onClick={onBack} />
      <AdminDetailHeader title={title} badge={badge} subtitle={subtitle} actions={actions} />
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
  return <div className="flex flex-wrap items-center gap-2">{children}</div>
}

type Col<T> = { header: string; render: (row: T) => ReactNode; align?: 'right' }

function AdminMobileRecordList<T extends { id: string }>({
  rows,
  columns,
  onRow,
  actionLabel = 'Open',
}: {
  rows: T[]
  columns: Col<T>[]
  onRow?: (row: T) => void
  actionLabel?: string
}) {
  return (
    <div className="divide-y divide-slate-100 xl:hidden">
      {rows.map((row) => {
        const Comp = onRow ? 'button' : 'div'
        return (
          <Comp
            key={row.id}
            type={onRow ? 'button' : undefined}
            onClick={onRow ? () => onRow(row) : undefined}
            className={cn('block w-full px-4 py-3.5 text-left', onRow && 'hover:bg-slate-50')}
          >
            <dl className="space-y-2">
              {columns.map((col) => (
                <div key={col.header} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {col.header}
                  </dt>
                  <dd className="min-w-0 text-right text-[13px] text-slate-700">{col.render(row)}</dd>
                </div>
              ))}
            </dl>
            {onRow ? (
              <span className="mt-2.5 block text-[13px] font-medium text-[#480516]">{actionLabel}</span>
            ) : null}
          </Comp>
        )
      })}
    </div>
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
}: {
  rows: T[]
  columns: Col<T>[]
  grid: string
  onRow?: (row: T) => void
  actionLabel?: string
  pageSize?: number
  embedded?: boolean
}) {
  const paging = usePaged(rows, pageSize)
  const headers = [...columns.map((c) => c.header), '']
  const footer = (
    <AdminPagination page={paging.page} pages={paging.pages} total={paging.total} onPage={paging.setPage} />
  )

  return (
    <div className={cn('min-w-0', embedded ? '' : 'overflow-hidden rounded-xl border border-slate-200 bg-white')}>
      <AdminMobileRecordList
        rows={paging.slice}
        columns={columns}
        onRow={onRow}
        actionLabel={actionLabel}
      />
      <div className="hidden min-w-0 xl:block">
        <AdminTable embedded grid={grid} headers={headers} footer={footer}>
          {paging.slice.map((row) => (
            <AdminRow
              key={row.id}
              grid={grid}
              onClick={onRow ? () => onRow(row) : undefined}
              columns={[
                ...columns.map((c) => c.render(row)),
                onRow ? (
                  <span className="block text-right text-[13px] font-medium text-[#480516]">{actionLabel}</span>
                ) : (
                  ''
                ),
              ]}
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
        placeholder="Add a note visible to other admins reviewing this case."
        className="min-h-[88px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-maroon-400"
      />
      <div className="mt-3 flex justify-end">
        <AdminButton
          variant="outline"
          className="h-9 px-3 py-1.5 text-[13px]"
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
}: {
  name: string
  size: string
  status: string
  uploaded: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
      <Icon src={adminIcons.file} size={18} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-slate-800">{name}</p>
        <p className="text-[11.5px] text-slate-400">
          {size} · {uploaded}
        </p>
      </div>
      <AdminBadge status={status} />
      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <Icon src={adminIcons.view} size={16} />
        <Icon src={adminIcons.approve} size={16} />
        <Icon src={adminIcons.reject} size={16} />
        <Icon src={adminIcons.refresh} size={16} />
      </div>
    </div>
  )
}

export function TwoCol({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-2', className)}>{children}</div>
}

export { AdminKv }
