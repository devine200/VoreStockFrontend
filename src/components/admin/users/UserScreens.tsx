import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  AdminBack,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminFieldRow,
  AdminFilter,
  AdminKv,
  AdminModal,
  AdminSearch,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminListShell,
  AdminNotFound,
  AdminTablePanel,
  FieldInput,
  matchesQuery,
} from '@/components/admin/screens'
import { Icon } from '@/components/shared/Icon'
import { adminIcons } from '@/assets/admin'
import { cn } from '@/utils/format'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setRecordStatus, upsertAdminUser } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminUserRecord } from '@/types/admin'

type UserStatus = 'Active' | 'Suspended' | 'Deactivated'

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-[#f4f0f1] font-semibold text-[#480516]',
        size === 'lg' ? 'size-[52px] text-[15px]' : 'size-[26px] text-[10px]',
      )}
    >
      {initials(name)}
    </span>
  )
}

function OptionPill({
  selected,
  children,
  onClick,
}: {
  selected: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-4 py-2.5 text-[12.5px] font-medium transition-colors',
        selected
          ? 'border-[1.5px] border-[#a7878f] bg-[#f4f0f1] text-[#480516]'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
      )}
    >
      {children}
    </button>
  )
}

function ReviewKv({ label, value }: { label: string; value: string }) {
  return <AdminFieldRow label={label} value={value} />
}

function NoteBanner({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'amber' | 'red' }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-600',
    amber: 'bg-amber-50 text-amber-800',
    red: 'bg-red-50 text-red-700',
  }
  const dots = {
    slate: 'bg-slate-400',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }
  return (
    <div className={cn('flex gap-2.5 rounded-lg px-3 py-2.5 text-[12px] leading-snug', tones[tone])}>
      <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', dots[tone])} aria-hidden />
      <p>{children}</p>
    </div>
  )
}

function ModalIcon({ tone, children }: { tone: 'amber' | 'green' | 'red'; children: ReactNode }) {
  const tones = {
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className={cn('flex size-11 items-center justify-center rounded-[14px] text-[18px] font-semibold', tones[tone])}>
      {children}
    </div>
  )
}

/* ─── Create / Edit (2-step) ─────────────────────────────────────────────── */

function AdminUserEditorModal({
  existing,
  onClose,
}: {
  existing?: AdminUserRecord
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isEdit = Boolean(existing)
  const [step, setStep] = useState<'form' | 'review'>('form')
  const [name, setName] = useState(existing?.name ?? '')
  const [email, setEmail] = useState(existing?.email ?? '')
  const [status, setStatus] = useState<UserStatus>((existing?.status as UserStatus) ?? 'Active')

  const canContinue = name.trim().length > 1 && email.trim().includes('@')
  const emailChanged = isEdit && existing && email.trim() !== existing.email

  const save = () => {
    const record: AdminUserRecord = {
      id: existing?.id ?? `ADM-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim(),
      role: 'Administrator',
      status: isEdit ? (existing?.status ?? 'Active') : status,
      lastActive: existing?.lastActive ?? 'Just now',
      created: existing?.created ?? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
    dispatch(upsertAdminUser(record))
    dispatch(showToast(isEdit ? 'Admin user updated' : 'Admin user created'))
    onClose()
    navigate(`/admin/users/${record.id}`)
  }

  if (step === 'review') {
    return (
      <AdminModal
        title={isEdit ? 'Review changes' : 'Review new admin user'}
        subtitle={isEdit ? 'Step 2 of 2 — Confirm before saving' : 'Step 2 of 2 — Confirm before creating'}
        maxWidth={isEdit && emailChanged ? 560 : 512}
        showClose={false}
        onClose={onClose}
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setStep('form')}>
              Back
            </AdminButton>
            <AdminButton onClick={save}>{isEdit ? 'Save changes' : 'Create admin user'}</AdminButton>
          </>
        }
      >
        {isEdit && emailChanged && existing ? (
          <div className="flex items-stretch gap-3">
            <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-[11.5px] text-slate-500">Previous email</p>
              <p className="mt-1 truncate text-[12.5px] font-medium text-slate-800">{existing.email}</p>
            </div>
            <div className="flex shrink-0 items-center text-slate-400" aria-hidden>
              <Icon src={adminIcons.txnRelatedChevron} size={20} />
            </div>
            <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-[11.5px] text-slate-500">New email</p>
              <p className="mt-1 truncate text-[12.5px] font-medium text-slate-800">{email.trim()}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
            <ReviewKv label="Full name" value={name.trim()} />
            <ReviewKv label="Email" value={email.trim()} />
            <ReviewKv label="Role" value="Administrator" />
            {!isEdit ? <ReviewKv label="Account status" value={status} /> : null}
          </div>
        )}
        {!isEdit ? (
          <div className="mt-3.5">
            <NoteBanner>This will be recorded in the audit log as “Admin user created.”</NoteBanner>
          </div>
        ) : null}
      </AdminModal>
    )
  }

  return (
    <AdminModal
      title={isEdit ? 'Edit admin user' : 'Add admin user'}
      subtitle={isEdit ? 'Step 1 of 2 — Update their information' : 'Step 1 of 2 — Enter their details'}
      maxWidth={512}
      showClose={false}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton disabled={!canContinue} onClick={() => setStep('review')}>
            Review
          </AdminButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FieldInput label="Full name" value={name} onChange={setName} placeholder="Full name" />
        <FieldInput label="Email" value={email} onChange={setEmail} placeholder="name@bidbridge.africa" />
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-slate-600">Role</p>
          <div className="flex flex-wrap gap-2">
            <OptionPill selected onClick={() => undefined}>
              Administrator
            </OptionPill>
          </div>
          {!isEdit ? (
            <p className="mt-2 text-[11.5px] text-slate-400">
              V1: single administrator role — every admin has full access.
            </p>
          ) : null}
        </div>
        {!isEdit ? (
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-slate-600">Account status</p>
            <div className="flex flex-wrap gap-2">
              {(['Active', 'Suspended', 'Deactivated'] as const).map((s) => (
                <OptionPill key={s} selected={status === s} onClick={() => setStatus(s)}>
                  {s}
                </OptionPill>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AdminModal>
  )
}

/* ─── Status modals ──────────────────────────────────────────────────────── */

function SuspendUserModal({ item, onClose }: { item: AdminUserRecord; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const [reason, setReason] = useState('')
  return (
    <AdminModal bare maxWidth={512} onClose={onClose} showClose={false}>
      <div className="flex flex-col gap-4 px-7 py-6">
        <ModalIcon tone="amber">!</ModalIcon>
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">Suspend {item.name}?</h2>
          <p className="mt-2 text-[13px] leading-snug text-slate-500">
            They will immediately lose access to the admin dashboard until reactivated.
          </p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-medium text-slate-600">Reason (required)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Temporary suspension pending access review."
            className="h-[72px] w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-[12.5px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
          />
        </label>
        <div className="flex justify-end gap-2">
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="danger"
            disabled={!reason.trim()}
            onClick={() => {
              dispatch(
                setRecordStatus({
                  collection: 'users',
                  id: item.id,
                  status: 'Suspended',
                  historyTitle: `Suspended: ${reason.trim()}`,
                }),
              )
              dispatch(showToast(`${item.name} suspended`))
              onClose()
            }}
          >
            Suspend admin user
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  )
}

function ReactivateUserModal({ item, onClose }: { item: AdminUserRecord; onClose: () => void }) {
  const dispatch = useAppDispatch()
  return (
    <AdminModal bare maxWidth={440} onClose={onClose} showClose={false}>
      <div className="flex flex-col items-center gap-3.5 px-6 py-6 text-center">
        <ModalIcon tone="green">
          <Icon src={adminIcons.check} size={22} />
        </ModalIcon>
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">Reactivate {item.name}?</h2>
          <p className="mx-auto mt-2 max-w-[360px] text-[13px] leading-snug text-slate-500">
            Their account status will change from Suspended to Active and they will regain dashboard access
            immediately.
          </p>
        </div>
        <div className="mt-1 flex justify-center gap-2">
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            onClick={() => {
              dispatch(
                setRecordStatus({
                  collection: 'users',
                  id: item.id,
                  status: 'Active',
                  historyTitle: 'Admin user reactivated',
                }),
              )
              dispatch(showToast(`${item.name} reactivated`))
              onClose()
            }}
          >
            Reactivate admin user
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  )
}

function DeactivateUserModal({ item, onClose }: { item: AdminUserRecord; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const [reason, setReason] = useState('')
  return (
    <AdminModal bare maxWidth={512} onClose={onClose} showClose={false}>
      <div className="flex flex-col gap-4 px-7 py-6">
        <ModalIcon tone="red">!</ModalIcon>
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">Deactivate {item.name}?</h2>
          <p className="mt-2 text-[13px] leading-snug text-slate-500">
            This permanently revokes their admin access. This action is more severe than suspension and should only
            be used when the admin no longer needs access.
          </p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-medium text-slate-600">Reason (required)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Admin has left the organization."
            className="h-[72px] w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-[12.5px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
          />
        </label>
        <NoteBanner tone="red">
          This will be recorded in the audit log and cannot be undone from this screen.
        </NoteBanner>
        <div className="flex justify-end gap-2">
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="danger"
            disabled={!reason.trim()}
            onClick={() => {
              dispatch(
                setRecordStatus({
                  collection: 'users',
                  id: item.id,
                  status: 'Deactivated',
                  historyTitle: `Deactivated: ${reason.trim()}`,
                }),
              )
              dispatch(showToast(`${item.name} deactivated`))
              onClose()
            }}
          >
            Deactivate admin user
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  )
}

/* ─── List ───────────────────────────────────────────────────────────────── */

export function AdminUsersList({ openCreate = false }: { openCreate?: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()
  const rows = useAppSelector((s) => s.admin.users)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('All roles')
  const [status, setStatus] = useState('All statuses')
  const [created, setCreated] = useState('Any time')
  const [sort, setSort] = useState('Newest first')
  const [createOpen, setCreateOpen] = useState(openCreate || location.pathname.endsWith('/new'))

  useEffect(() => {
    if (openCreate || location.pathname.endsWith('/new')) setCreateOpen(true)
  }, [openCreate, location.pathname])

  const filtered = useMemo(() => {
    const list = rows.filter((r) => {
      if (!matchesQuery(`${r.name} ${r.email} ${r.role}`, query)) return false
      if (role !== 'All roles' && r.role !== role) return false
      if (status !== 'All statuses' && r.status !== status) return false
      return true
    })
    if (sort === 'Oldest first') return [...list].reverse()
    if (sort === 'Name A–Z') return [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [rows, query, role, status, sort])

  const closeCreate = () => {
    setCreateOpen(false)
    if (location.pathname.endsWith('/new')) navigate('/admin/users', { replace: true })
  }

  return (
    <AdminListShell
      title="Admin Users"
      subtitle="Manage internal admin accounts. Every admin has full platform access."
      actions={<AdminButton onClick={() => setCreateOpen(true)}>Add admin user</AdminButton>}
    >
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch
              className="w-full sm:w-[240px]"
              value={query}
              onChange={setQuery}
              placeholder="Search by name or email"
            />
            <AdminFilter
              label="Role"
              value={role}
              onChange={setRole}
              options={['All roles', 'Administrator']}
            />
            <AdminFilter
              label="Status"
              value={status}
              onChange={setStatus}
              options={['All statuses', 'Active', 'Suspended', 'Deactivated']}
            />
            <AdminFilter
              label="Created"
              value={created}
              onChange={setCreated}
              options={['Any time', 'Last 30 days', 'Last 90 days', 'This year']}
            />
            <span className="hidden flex-1 lg:block" />
            <AdminFilter
              label="Sort"
              value={sort}
              onChange={setSort}
              options={['Newest first', 'Oldest first', 'Name A–Z']}
            />
          </>
        }
      >
        <AdminDataTable
          embedded
          tall
          pageSize={8}
          noun="admin users"
          summary={`Showing ${filtered.length} of ${rows.length} admin users`}
          rows={filtered}
          grid="1.35fr 1.45fr 1fr 0.85fr 0.95fr 0.95fr 56px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/users/${r.id}`)}
          columns={[
            {
              header: 'Admin',
              render: (r) => (
                <span className="flex items-center gap-2.5">
                  <Avatar name={r.name} />
                  <span className="text-[13px] font-medium text-slate-800">{r.name}</span>
                </span>
              ),
            },
            {
              header: 'Email',
              render: (r) => <span className="text-[12.5px] text-slate-700">{r.email}</span>,
            },
            {
              header: 'Role',
              render: (r) => <span className="text-[12.5px] text-slate-700">{r.role}</span>,
            },
            {
              header: 'Status',
              render: (r) => <AdminBadge status={r.status} />,
            },
            {
              header: 'Last active',
              render: (r) => <span className="text-[12.5px] text-slate-700">{r.lastActive}</span>,
            },
            {
              header: 'Created',
              render: (r) => <span className="text-[12.5px] text-slate-700">{r.created}</span>,
            },
          ]}
        />
      </AdminTablePanel>

      {createOpen ? <AdminUserEditorModal onClose={closeCreate} /> : null}
    </AdminListShell>
  )
}

/* ─── Detail ─────────────────────────────────────────────────────────────── */

export function AdminUserDetail({ openEdit = false }: { openEdit?: boolean }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.users.find((u) => u.id === id))
  const [editOpen, setEditOpen] = useState(openEdit || location.pathname.endsWith('/edit'))
  const [modal, setModal] = useState<'suspend' | 'reactivate' | 'deactivate' | null>(null)

  useEffect(() => {
    if (openEdit || location.pathname.endsWith('/edit')) setEditOpen(true)
  }, [openEdit, location.pathname])

  if (!item) return <AdminNotFound label="Back to Admin users" to="/admin/users" />

  const closeEdit = () => {
    setEditOpen(false)
    if (location.pathname.endsWith('/edit')) navigate(`/admin/users/${item.id}`, { replace: true })
  }

  const isActive = item.status === 'Active'
  const isSuspended = item.status === 'Suspended'
  const isDeactivated = item.status === 'Deactivated'

  return (
    <div className="flex w-full max-w-full flex-col gap-4 animate-fade-in sm:gap-5">
      <AdminBack label="Back to Admin users" onClick={() => navigate('/admin/users')} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name={item.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">{item.name}</h1>
            <AdminBadge status={item.status} />
          </div>
          <p className="mt-1 text-[13px] text-slate-500">{item.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isDeactivated ? (
            <AdminButton variant="outline" onClick={() => setEditOpen(true)}>
              Edit
            </AdminButton>
          ) : null}
          {isActive ? (
            <>
              <AdminButton variant="dangerOutline" onClick={() => setModal('suspend')}>
                Suspend
              </AdminButton>
              <AdminButton variant="danger" onClick={() => setModal('deactivate')}>
                Deactivate
              </AdminButton>
            </>
          ) : null}
          {isSuspended ? (
            <AdminButton onClick={() => setModal('reactivate')}>Reactivate</AdminButton>
          ) : null}
          {isDeactivated ? (
            <AdminButton
              variant="outline"
              onClick={() => {
                dispatch(
                  setRecordStatus({
                    collection: 'users',
                    id: item.id,
                    status: 'Active',
                    historyTitle: 'Admin user reactivated',
                  }),
                )
                dispatch(showToast(`${item.name} reactivated`))
              }}
            >
              Reactivate
            </AdminButton>
          ) : null}
        </div>
      </div>

      <AdminCard title="Account information" className="space-y-3 px-6 py-5">
        <AdminKv label="Full name" value={item.name} tone="strong" />
        <AdminKv label="Email" value={item.email} tone="strong" />
        <AdminKv label="Role" value={item.role} tone="strong" />
        <AdminKv label="Account status" value={item.status} tone="strong" />
        <AdminKv label="Last active" value={item.lastActive} tone="strong" />
        <AdminKv label="Created" value={item.created} tone="strong" />
      </AdminCard>

      {editOpen ? <AdminUserEditorModal existing={item} onClose={closeEdit} /> : null}
      {modal === 'suspend' ? <SuspendUserModal item={item} onClose={() => setModal(null)} /> : null}
      {modal === 'reactivate' ? <ReactivateUserModal item={item} onClose={() => setModal(null)} /> : null}
      {modal === 'deactivate' ? <DeactivateUserModal item={item} onClose={() => setModal(null)} /> : null}
    </div>
  )
}
