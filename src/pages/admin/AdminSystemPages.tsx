import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminBack,
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKpi,
  AdminKv,
  AdminSearch,
  AdminTabs,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminDetailShell,
  AdminListShell,
  AdminNotFound,
  AdminSummaryGrid,
  AdminTablePanel,
  ConfirmModal,
  FieldInput,
  StatusCell,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  issueReferralReward,
  reverseReferralReward,
  retrySync,
  setRecordStatus,
  updateFeeValue,
  updateTierValue,
  upsertAdminUser,
} from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminUserRecord } from '@/types/admin'

export function AdminReferralsPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.referrals)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('list')
  const [status, setStatus] = useState('All')
  const filtered = useMemo(
    () => rows.filter((r) => matchesQuery(`${r.referrer} ${r.buyer} ${r.code}`, query) && (status === 'All' || r.qualification === status)),
    [rows, query, status],
  )
  const queue = rows.filter((r) => r.qualification === 'Qualified')
  return (
    <AdminListShell
      title="Referrals & Rewards"
      subtitle="Monitor the referral program and issue or reverse rewards."
      kpis={
        <AdminSummaryGrid cols={3}>
          <AdminKpi label="Signups this month" value={8} hint="via referral code" />
          <AdminKpi label="Qualified referrals" value={queue.length} hint="awaiting reward" hintTone="warning" />
          <AdminKpi label="Rewards issued" value={rows.filter((r) => r.qualification === 'Rewarded').length} hint="this month" hintTone="success" />
        </AdminSummaryGrid>
      }
    >
      <AdminTabs
        tabs={[
          { id: 'list', label: 'Referrals' },
          { id: 'queue', label: 'Rewards queue' },
          { id: 'config', label: 'Config' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'list' ? (
        <AdminTablePanel
          toolbar={
            <>
              <AdminSearch className="w-full sm:w-[270px]" value={query} onChange={setQuery} placeholder="Search by referrer, buyer, or code" />
              <AdminFilter label="Status" value={status} onChange={setStatus} options={['All', 'Pending', 'Qualified', 'Rewarded']} />
            </>
          }
        >
          <AdminDataTable
            embedded
            rows={filtered}
            grid="1fr 1fr 0.8fr 1fr 1fr 72px"
            actionLabel="View"
            onRow={(r) => navigate(`/admin/referrals/${r.id}`)}
            columns={[
              { header: 'Referrer', render: (r) => r.referrer },
              { header: 'Referred buyer', render: (r) => r.buyer },
              { header: 'Code', render: (r) => r.code },
              { header: 'Qualification status', render: (r) => <StatusCell status={r.qualification} /> },
              { header: 'Reward', render: (r) => r.reward },
            ]}
          />
        </AdminTablePanel>
      ) : null}
      {tab === 'queue' ? (
        <AdminTablePanel>
          <AdminDataTable
            embedded
            rows={queue}
            grid="1fr 1fr 1fr 72px"
            actionLabel="Issue"
            onRow={(r) => navigate(`/admin/referrals/${r.id}`)}
            columns={[
              { header: 'Referrer', render: (r) => r.referrer },
              { header: 'Buyer', render: (r) => r.buyer },
              { header: 'Reward', render: (r) => r.reward },
            ]}
          />
        </AdminTablePanel>
      ) : null}
      {tab === 'config' ? (
        <AdminCard title="Program rules" className="space-y-3 max-w-xl">
          <AdminKv label="Reward" value="$20 wallet credit" />
          <AdminKv label="Qualification" value="First settled bid" />
          <AdminKv label="Cap per referrer" value="20 rewards / month" />
        </AdminCard>
      ) : null}
    </AdminListShell>
  )
}

export function AdminReferralDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.referrals.find((r) => r.id === id))
  const [modal, setModal] = useState<'issue' | 'reverse' | null>(null)
  if (!item) return <AdminNotFound label="Back to referrals" to="/admin/referrals" />
  return (
    <AdminDetailShell
      backLabel="Back to referrals"
      onBack={() => navigate('/admin/referrals')}
      title={item.buyer}
      badge={item.qualification}
      subtitle={`Referred by ${item.referrer} · ${item.code}`}
      actions={
        <>
          {item.qualification === 'Qualified' ? <AdminButton onClick={() => setModal('issue')}>Issue reward</AdminButton> : null}
          {item.qualification === 'Rewarded' ? <AdminButton variant="dangerOutline" onClick={() => setModal('reverse')}>Reverse reward</AdminButton> : null}
        </>
      }
    >
      <AdminCard title="Referral" className="space-y-3 max-w-xl">
        <AdminKv label="Code" value={item.code} />
        <AdminKv label="Date" value={item.date} />
        <AdminKv label="Reward" value={item.reward} />
      </AdminCard>
      {modal === 'issue' ? (
        <ConfirmModal title="Issue reward" body={`Issue $20 wallet credit to ${item.referrer}.`} confirmLabel="Issue reward" onClose={() => setModal(null)} onConfirm={() => { dispatch(issueReferralReward({ id: item.id })); dispatch(showToast('Reward issued')); setModal(null) }} />
      ) : null}
      {modal === 'reverse' ? (
        <ConfirmModal title="Reverse reward" body="Claw back the wallet credit. This is recorded in the audit log." confirmLabel="Reverse" danger onClose={() => setModal(null)} onConfirm={() => { dispatch(reverseReferralReward({ id: item.id })); dispatch(showToast('Reward reversed')); setModal(null) }} />
      ) : null}
    </AdminDetailShell>
  )
}

export function AdminFeesPage() {
  const dispatch = useAppDispatch()
  const rows = useAppSelector((s) => s.admin.fees)
  const [edit, setEdit] = useState<{ id: string; value: string; name: string } | null>(null)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  return (
    <AdminListShell title="Fees & pricing" subtitle="Buyer premium, bid holds, B-Stock markup, and payout fees.">
      <AdminTablePanel>
        <AdminDataTable
          embedded
          rows={rows}
          grid="1.2fr 1fr 1.2fr 1fr 1fr 72px"
          actionLabel="Edit"
          onRow={(r) => {
            setEdit({ id: r.id, value: r.value, name: r.name })
            setError('')
          }}
          columns={[
            { header: 'Fee', render: (r) => r.name },
            { header: 'Value', render: (r) => r.value },
            { header: 'Applies to', render: (r) => r.appliesTo },
            { header: 'Last changed', render: (r) => r.lastChanged },
            { header: 'Changed by', render: (r) => r.changedBy },
          ]}
        />
      </AdminTablePanel>
      {edit && !preview ? (
        <ConfirmModal
          title={`Edit value — ${edit.name}`}
          confirmLabel="Preview impact"
          onClose={() => setEdit(null)}
          onConfirm={() => {
            if (!edit.value.trim()) {
              setError('Enter a value before previewing.')
              return
            }
            setPreview(true)
          }}
        >
          <FieldInput label="Value" value={edit.value} onChange={(v) => { setEdit({ ...edit, value: v }); setError('') }} />
          {error ? <p className="mt-2 text-[12px] text-red-600">{error}</p> : null}
        </ConfirmModal>
      ) : null}
      {preview && edit ? (
        <ConfirmModal
          title={`Preview impact — ${edit.name}`}
          body={`New value ${edit.value} will apply to new lots and bids. Existing live holds are unchanged.`}
          confirmLabel="Save"
          onClose={() => setPreview(false)}
          onConfirm={() => {
            dispatch(updateFeeValue({ id: edit.id, value: edit.value }))
            dispatch(showToast('Fee updated'))
            setPreview(false)
            setEdit(null)
          }}
        />
      ) : null}
    </AdminListShell>
  )
}

export function AdminTiersPage() {
  const dispatch = useAppDispatch()
  const rows = useAppSelector((s) => s.admin.tiers)
  const buyers = useAppSelector((s) => s.admin.buyers)
  const [edit, setEdit] = useState<{ id: string; name: string; hold: string; limit: string } | null>(null)
  const [preview, setPreview] = useState(false)
  const [override, setOverride] = useState(false)
  const [error, setError] = useState('')
  return (
    <AdminListShell
      title="Tiers"
      subtitle="Hold percentages and lot limits by buyer tier."
      actions={<AdminButton variant="outline" onClick={() => setOverride(true)}>Buyer override</AdminButton>}
    >
      <AdminTablePanel>
        <AdminDataTable
          embedded
          rows={rows}
          grid="1fr 1fr 1.2fr 0.8fr 1fr 72px"
          actionLabel="Edit"
          onRow={(r) => setEdit({ id: r.id, name: r.name, hold: r.hold, limit: r.limit })}
          columns={[
            { header: 'Tier', render: (r) => r.name },
            { header: 'Bid hold', render: (r) => r.hold },
            { header: 'Lot limit', render: (r) => r.limit },
            { header: 'Buyers', render: (r) => String(r.buyers) },
            { header: 'Last changed', render: (r) => r.lastChanged },
          ]}
        />
      </AdminTablePanel>
      {edit && !preview ? (
        <ConfirmModal
          title={`Edit tier — ${edit.name}`}
          confirmLabel="Preview change"
          onClose={() => setEdit(null)}
          onConfirm={() => {
            if (!edit.hold.trim() || !edit.limit.trim()) {
              setError('Hold and limit are required.')
              return
            }
            setPreview(true)
          }}
        >
          <div className="space-y-3">
            <FieldInput label="Bid hold" value={edit.hold} onChange={(v) => setEdit({ ...edit, hold: v })} />
            <FieldInput label="Lot limit" value={edit.limit} onChange={(v) => setEdit({ ...edit, limit: v })} />
            {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
          </div>
        </ConfirmModal>
      ) : null}
      {preview && edit ? (
        <ConfirmModal
          title={`Preview tier change — ${edit.name}`}
          body={`${rows.find((r) => r.id === edit.id)?.buyers ?? 0} buyers will inherit the new hold of ${edit.hold}.`}
          confirmLabel="Save"
          onClose={() => setPreview(false)}
          onConfirm={() => {
            dispatch(updateTierValue({ id: edit.id, hold: edit.hold, limit: edit.limit }))
            dispatch(showToast('Tier updated'))
            setPreview(false)
            setEdit(null)
          }}
        />
      ) : null}
      {override ? (
        <ConfirmModal
          title="Buyer tier override — Ada Okonkwo"
          body="Move this buyer to a different tier without changing the global schedule."
          confirmLabel="Override"
          onClose={() => setOverride(false)}
          onConfirm={() => {
            const ada = buyers.find((b) => b.name === 'Ada Okonkwo')
            if (ada) dispatch(setRecordStatus({ collection: 'users', id: ada.id, status: ada.status }))
            dispatch(showToast('Override recorded'))
            setOverride(false)
          }}
        />
      ) : null}
    </AdminListShell>
  )
}

export function AdminSyncPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.syncs)
  return (
    <AdminListShell title="Sync & sources" subtitle="BidBridge and CSV ingest jobs, failed items, and publish status." showExport>
      <AdminTablePanel>
        <AdminDataTable
          embedded
          rows={rows}
          grid="1fr 1fr 1.2fr 0.6fr 0.6fr 0.9fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/sync/${r.id}`)}
          columns={[
            { header: 'Job', render: (r) => r.id },
            { header: 'Source', render: (r) => r.source },
            { header: 'Started', render: (r) => r.started },
            { header: 'Lots', render: (r) => String(r.lots) },
            { header: 'Failed', render: (r) => String(r.failed) },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminSyncDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.syncs.find((r) => r.id === id))
  const lots = useAppSelector((s) => s.admin.lots.filter((l) => l.source.includes('SYNC') || l.source === 'BidBridge'))
  const [modal, setModal] = useState<'retry' | 'publish' | null>(null)
  if (!item) return <AdminNotFound label="Back to sync" to="/admin/sync" />
  return (
    <AdminDetailShell
      backLabel="Back to sync"
      onBack={() => navigate('/admin/sync')}
      title={item.id}
      badge={item.status}
      subtitle={`${item.source} · ${item.started}`}
      actions={
        <>
          {item.failed > 0 ? <AdminButton variant="outline" onClick={() => setModal('retry')}>Retry failed</AdminButton> : null}
          <AdminButton onClick={() => setModal('publish')}>Publish</AdminButton>
        </>
      }
    >
      <TwoCol>
        <AdminCard title="Job" className="space-y-3">
          <AdminKv label="Lots" value={String(item.lots)} />
          <AdminKv label="Failed" value={String(item.failed)} />
          <AdminKv label="Finished" value={item.finished} />
        </AdminCard>
        <AdminCard title="Lots from this sync">
          {lots.slice(0, 4).map((lot) => (
            <button key={lot.id} type="button" className="flex w-full justify-between border-b border-slate-100 py-2 text-left last:border-0" onClick={() => navigate(`/admin/lots/${lot.id}`)}>
              <span className="text-[13px]">{lot.id}</span>
              <StatusCell status={lot.status} />
            </button>
          ))}
        </AdminCard>
      </TwoCol>
      {modal === 'retry' ? (
        <ConfirmModal title="Retry sync" body="Re-run failed items from this job." confirmLabel="Retry" onClose={() => setModal(null)} onConfirm={() => { dispatch(retrySync({ id: item.id })); dispatch(showToast('Sync retried')); setModal(null) }} />
      ) : null}
      {modal === 'publish' ? (
        <ConfirmModal title="Publish sync" body="Publish ingested lots to the marketplace." confirmLabel="Publish" onClose={() => setModal(null)} onConfirm={() => { dispatch(retrySync({ id: item.id })); dispatch(showToast('Lots published')); setModal(null) }} />
      ) : null}
    </AdminDetailShell>
  )
}

export function AdminAuditPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.audit)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => rows.filter((r) => matchesQuery(`${r.action} ${r.actor} ${r.target} ${r.id}`, query)), [rows, query])
  return (
    <AdminListShell title="Audit log" subtitle="Every admin action, with actor, target, and timestamp.">
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search actions, actors, or targets" />
            <AdminFilter value="All admins" onChange={() => undefined} options={['All admins', 'Ops Admin']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="0.9fr 1.4fr 1fr 1fr 1.2fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/audit/${r.id}`)}
          columns={[
            { header: 'ID', render: (r) => r.id },
            { header: 'Action', render: (r) => r.action },
            { header: 'Admin / Actor', render: (r) => r.actor },
            { header: 'Target', render: (r) => r.target },
            { header: 'When', render: (r) => r.at },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminAuditDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const item = useAppSelector((s) => s.admin.audit.find((r) => r.id === id))
  if (!item) return <AdminNotFound label="Back to audit log" to="/admin/audit" />
  return (
    <AdminDetailShell
      backLabel="Back to audit log"
      onBack={() => navigate('/admin/audit')}
      title={item.id}
      subtitle={`${item.action} · ${item.at}`}
    >
      <AdminCard title="Event" className="space-y-3 max-w-xl">
        <AdminKv label="Action" value={item.action} />
        <AdminKv label="Admin / Actor" value={item.actor} />
        <AdminKv label="Target" value={item.target} />
        <AdminKv label="When" value={item.at} />
        <AdminKv label="IP" value={item.ip} />
      </AdminCard>
    </AdminDetailShell>
  )
}

export function AdminUsersPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.users)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => rows.filter((r) => matchesQuery(`${r.name} ${r.email} ${r.role}`, query)), [rows, query])
  return (
    <AdminListShell
      title="Admin Users"
      subtitle="People who can operate this console."
      actions={<AdminButton onClick={() => navigate('/admin/users/new')}>Create admin</AdminButton>}
    >
      <AdminTablePanel toolbar={<AdminSearch className="w-full sm:w-[300px]" value={query} onChange={setQuery} placeholder="Search admin users" />}>
        <AdminDataTable
          embedded
          rows={filtered}
          grid="1.1fr 1.4fr 1fr 0.8fr 1.1fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/users/${r.id}`)}
          columns={[
            { header: 'Name', render: (r) => r.name },
            { header: 'Email', render: (r) => r.email },
            { header: 'Role', render: (r) => r.role },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'Last active', render: (r) => r.lastActive },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminUserFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const existing = useAppSelector((s) => s.admin.users.find((u) => u.id === id))
  const [step, setStep] = useState<'form' | 'review'>('form')
  const [name, setName] = useState(existing?.name ?? '')
  const [email, setEmail] = useState(existing?.email ?? '')
  const [role, setRole] = useState(existing?.role ?? 'Administrator')
  const [modal, setModal] = useState<'suspend' | 'reactivate' | 'deactivate' | null>(null)

  const save = () => {
    const record: AdminUserRecord = {
      id: existing?.id ?? `ADM-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role,
      status: existing?.status ?? 'Active',
      lastActive: existing?.lastActive ?? '—',
      created: existing?.created ?? 'Today',
    }
    dispatch(upsertAdminUser(record))
    dispatch(showToast(existing ? 'Admin user updated' : 'Admin user created'))
    navigate(`/admin/users/${record.id}`)
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <AdminBack label="Back to Admin users" onClick={() => navigate('/admin/users')} />
      <h1 className="text-[20px] font-semibold text-slate-900">{existing ? `Edit ${existing.name}` : 'Create admin user'}</h1>
      {step === 'form' ? (
        <AdminCard className="max-w-xl space-y-4">
          <FieldInput label="Full name" value={name} onChange={setName} />
          <FieldInput label="Email" value={email} onChange={setEmail} />
          <FieldInput label="Role" value={role} onChange={setRole} />
          <div className="flex justify-end gap-2">
            <AdminButton variant="outline" onClick={() => navigate('/admin/users')}>Cancel</AdminButton>
            <AdminButton onClick={() => setStep('review')}>Review</AdminButton>
          </div>
        </AdminCard>
      ) : (
        <AdminCard className="max-w-xl space-y-3">
          <AdminKv label="Name" value={name} />
          <AdminKv label="Email" value={email} />
          <AdminKv label="Role" value={role} />
          <p className="text-[12px] text-slate-400">This will be recorded in the audit log as “Admin user {existing ? 'updated' : 'created'}.”</p>
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="outline" onClick={() => setStep('form')}>Back</AdminButton>
            <AdminButton onClick={save}>{existing ? 'Save changes' : 'Create admin'}</AdminButton>
          </div>
        </AdminCard>
      )}
      {existing && step === 'form' ? (
        <div className="flex gap-2">
          {existing.status === 'Active' ? (
            <>
              <AdminButton variant="dangerOutline" onClick={() => setModal('suspend')}>Suspend</AdminButton>
              <AdminButton variant="danger" onClick={() => setModal('deactivate')}>Deactivate</AdminButton>
            </>
          ) : (
            <AdminButton onClick={() => setModal('reactivate')}>Reactivate</AdminButton>
          )}
        </div>
      ) : null}
      {modal === 'suspend' && existing ? (
        <ConfirmModal title={`Suspend ${existing.name}`} body="They will lose console access until reactivated." confirmLabel="Suspend" danger onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'users', id: existing.id, status: 'Suspended' })); setModal(null) }} />
      ) : null}
      {modal === 'deactivate' && existing ? (
        <ConfirmModal title={`Deactivate ${existing.name}`} body="Admin has left the organization." confirmLabel="Deactivate" danger onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'users', id: existing.id, status: 'Deactivated' })); setModal(null) }} />
      ) : null}
      {modal === 'reactivate' && existing ? (
        <ConfirmModal title={`Reactivate ${existing.name}`} body="Restore console access for this administrator." confirmLabel="Reactivate" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'users', id: existing.id, status: 'Active' })); setModal(null) }} />
      ) : null}
    </div>
  )
}

export function AdminUserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const item = useAppSelector((s) => s.admin.users.find((u) => u.id === id))
  if (!item) return <AdminNotFound label="Back to Admin users" to="/admin/users" />
  return (
    <AdminDetailShell
      backLabel="Back to Admin users"
      onBack={() => navigate('/admin/users')}
      title={item.name}
      badge={item.status}
      subtitle={item.email}
      actions={<AdminButton variant="outline" onClick={() => navigate(`/admin/users/${item.id}/edit`)}>Edit</AdminButton>}
    >
      <AdminCard title="Access" className="space-y-3 max-w-xl">
        <AdminKv label="Role" value={item.role} />
        <AdminKv label="Last active" value={item.lastActive} />
        <AdminKv label="Created" value={item.created} />
      </AdminCard>
    </AdminDetailShell>
  )
}
