import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKv,
  AdminSearch,
  AdminTabs,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminDetailShell,
  AdminListShell,
  AdminNotFound,
  AdminTablePanel,
  ConfirmModal,
  FieldInput,
  HistoryPanel,
  NotesPanel,
  StatusCell,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addAdminNote, overrideBuyerTier, setRecordStatus } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'

export function AdminBuyersPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.buyers)
  const [query, setQuery] = useState('')
  const [kyc, setKyc] = useState('All')
  const [tier, setTier] = useState('All')
  const [status, setStatus] = useState('All')
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (!matchesQuery(`${r.name} ${r.email} ${r.id}`, query)) return false
        if (kyc !== 'All' && r.kyc !== kyc) return false
        if (tier !== 'All' && r.tier !== tier) return false
        if (status !== 'All' && r.status !== status) return false
        return true
      }),
    [rows, query, kyc, tier, status],
  )
  return (
    <AdminListShell title="Buyers" subtitle="Search and open any buyer's full profile.">
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="w-full sm:w-[300px]" value={query} onChange={setQuery} placeholder="Search by buyer name, ID, or email" />
            <AdminFilter label="KYC status" value={kyc} onChange={setKyc} options={['All', 'Verified', 'Pending', 'Requires Resubmission']} />
            <AdminFilter label="Tier" value={tier} onChange={setTier} options={['All', 'Tier 1', 'Tier 2', 'Tier 3']} />
            <AdminFilter label="Status" value={status} onChange={setStatus} options={['All', 'Active', 'Restricted', 'Deactivated']} />
            <AdminFilter label="Joined" value="All time" onChange={() => undefined} options={['All time']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="1.2fr 0.8fr 1.4fr 0.9fr 0.7fr 0.9fr 0.9fr 0.8fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/buyers/${r.id}`)}
          columns={[
          {
            header: 'Buyer',
            render: (r) => (
              <span className="flex items-center gap-2">
                <span className="flex size-[30px] items-center justify-center rounded-full bg-maroon-50 text-[11px] font-semibold text-maroon-600">
                  {r.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                </span>
                <span>
                  <span className="block font-medium">{r.name}</span>
                  <span className="block text-[11px] text-slate-400">{r.type}</span>
                </span>
              </span>
            ),
          },
          { header: 'Buyer ID', render: (r) => r.id },
          { header: 'Email', render: (r) => r.email },
          { header: 'KYC status', render: (r) => <StatusCell status={r.kyc} /> },
          { header: 'Tier', render: (r) => r.tier },
          { header: 'Account status', render: (r) => <StatusCell status={r.status} /> },
          { header: 'Wallet balance', render: (r) => r.wallet },
          { header: 'Joined date', render: (r) => r.joined },
        ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminBuyerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const buyer = useAppSelector((s) => s.admin.buyers.find((b) => b.id === id))
  const orders = useAppSelector((s) => s.admin.orders.filter((o) => o.buyer === buyer?.name))
  const txns = useAppSelector((s) => s.admin.transactions.filter((t) => t.buyer === buyer?.name))
  const refs = useAppSelector((s) => s.admin.referrals.filter((r) => r.referrer === buyer?.name || r.buyer === buyer?.name))
  const tickets = useAppSelector((s) => s.admin.tickets.filter((t) => t.buyer === buyer?.name))
  const audit = useAppSelector((s) => s.admin.audit.filter((a) => a.target === buyer?.name))
  const [tab, setTab] = useState('overview')
  const [modal, setModal] = useState<'tier' | 'restrict' | null>(null)
  const [tier, setTier] = useState(buyer?.tier ?? 'Tier 1')

  if (!buyer) {
    return <AdminNotFound label="Back to buyers" to="/admin/buyers" />
  }

  return (
    <AdminDetailShell
      backLabel="Back to buyers"
      onBack={() => navigate('/admin/buyers')}
      title={buyer.name}
      badge={buyer.status}
      subtitle={`${buyer.id} · ${buyer.type} · ${buyer.tier}`}
      actions={
        <>
          <AdminButton variant="outline" onClick={() => setModal('tier')}>Override tier</AdminButton>
          {buyer.status === 'Active' ? (
            <AdminButton variant="dangerOutline" onClick={() => setModal('restrict')}>Restrict</AdminButton>
          ) : (
            <AdminButton onClick={() => dispatch(setRecordStatus({ collection: 'regulation', id: buyer.id, status: 'Active' }))}>Reactivate</AdminButton>
          )}
        </>
      }
    >
      <AdminTabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'wallet', label: 'Wallet' },
          { id: 'auctions', label: 'Auctions' },
          { id: 'orders', label: 'Orders' },
          { id: 'referrals', label: 'Referrals' },
          { id: 'documents', label: 'Documents' },
          { id: 'support', label: 'Support' },
          { id: 'audit', label: 'Audit' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'overview' ? (
        <TwoCol>
          <AdminCard title="Profile" className="space-y-3">
            <AdminKv label="Email" value={buyer.email} />
            <AdminKv label="Phone" value={buyer.phone} />
            <AdminKv label="Address" value={buyer.address} />
            <AdminKv label="KYC" value={buyer.kyc} badge={buyer.kyc} />
            <AdminKv label="Joined" value={buyer.joined} />
          </AdminCard>
          <NotesPanel notes={buyer.notes} onAdd={(body) => dispatch(addAdminNote({ collection: 'buyers', id: buyer.id, body }))} />
        </TwoCol>
      ) : null}
      {tab === 'wallet' ? (
        <AdminTablePanel>
          <AdminDataTable
            embedded
            rows={txns}
            grid="1fr 1fr 1fr 1fr"
            columns={[
              { header: 'ID', render: (t) => t.id },
              { header: 'Type', render: (t) => t.type },
              { header: 'Amount', render: (t) => t.amount },
              { header: 'Status', render: (t) => <StatusCell status={t.status} /> },
            ]}
          />
        </AdminTablePanel>
      ) : null}
      {tab === 'orders' || tab === 'auctions' ? (
        <AdminTablePanel>
          <AdminDataTable
            embedded
            rows={orders}
            grid="1fr 1.2fr 0.8fr 0.8fr"
            onRow={(o) => navigate(`/admin/orders/${o.id}`)}
            columns={[
              { header: 'Order', render: (o) => o.id },
              { header: 'Lot', render: (o) => o.lot },
              { header: 'Total', render: (o) => o.total },
              { header: 'Status', render: (o) => <StatusCell status={o.status} /> },
            ]}
          />
        </AdminTablePanel>
      ) : null}
      {tab === 'referrals' ? (
        <AdminTablePanel>
          <AdminDataTable
            embedded
            rows={refs}
            grid="1fr 1fr 0.8fr 0.8fr"
            columns={[
              { header: 'Referrer', render: (r) => r.referrer },
              { header: 'Buyer', render: (r) => r.buyer },
              { header: 'Code', render: (r) => r.code },
              { header: 'Status', render: (r) => <StatusCell status={r.qualification} /> },
            ]}
          />
        </AdminTablePanel>
      ) : null}
      {tab === 'documents' ? (
        <AdminCard title="Documents">
          <p className="text-[13px] text-slate-500">Identity documents are reviewed from the Verification queue.</p>
          <AdminButton className="mt-3" variant="outline" onClick={() => navigate('/admin/verification')}>
            Open verification
          </AdminButton>
        </AdminCard>
      ) : null}
      {tab === 'support' ? (
        <AdminTablePanel>
          <AdminDataTable
            embedded
            rows={tickets}
            grid="0.8fr 1.4fr 0.8fr"
            onRow={(t) => navigate(`/admin/support/${t.id}`)}
            columns={[
              { header: 'Ticket', render: (t) => t.id },
              { header: 'Subject', render: (t) => t.subject },
              { header: 'Status', render: (t) => <StatusCell status={t.status} /> },
            ]}
          />
        </AdminTablePanel>
      ) : null}
      {tab === 'audit' ? (
        <AdminTablePanel>
          <AdminDataTable
            embedded
            rows={audit}
            grid="1.2fr 1fr 1fr"
            columns={[
              { header: 'Action', render: (a) => a.action },
              { header: 'Actor', render: (a) => a.actor },
              { header: 'When', render: (a) => a.at },
            ]}
          />
        </AdminTablePanel>
      ) : null}

      {modal === 'tier' ? (
        <ConfirmModal
          title={`Buyer tier override — ${buyer.name}`}
          body="This override is recorded in the audit log."
          confirmLabel="Save override"
          onClose={() => setModal(null)}
          onConfirm={() => {
            dispatch(overrideBuyerTier({ id: buyer.id, tier }))
            dispatch(showToast('Tier updated'))
            setModal(null)
          }}
        >
          <FieldInput label="Tier" value={tier} onChange={setTier} />
        </ConfirmModal>
      ) : null}
      {modal === 'restrict' ? (
        <ConfirmModal
          title="Restrict buyer"
          body="The buyer will keep a wallet but cannot bid until reactivated."
          confirmLabel="Restrict"
          danger
          onClose={() => setModal(null)}
          onConfirm={() => {
            dispatch(setRecordStatus({ collection: 'regulation', id: `REG-${buyer.id.slice(-4)}`, status: 'Restricted' }))
            dispatch(showToast('Buyer restricted'))
            setModal(null)
          }}
        />
      ) : null}
    </AdminDetailShell>
  )
}

export function AdminRegulationPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.regulation)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => rows.filter((r) => matchesQuery(`${r.buyer} ${r.status} ${r.flags.join(' ')}`, query)), [rows, query])
  return (
    <AdminListShell title="Regulation" subtitle="Flags, restrictions, suspensions, and deactivations across buyer accounts.">
      <AdminTablePanel toolbar={<AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search by buyer or flag" />}>
        <AdminDataTable
          embedded
          rows={filtered}
          grid="1fr 1.4fr 0.8fr 0.9fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/regulation/${r.id}`)}
          columns={[
            { header: 'Buyer', render: (r) => r.buyer },
            { header: 'Flags', render: (r) => r.flags.join(', ') },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'Last review', render: (r) => r.lastReview },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminRegulationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.regulation.find((r) => r.id === id))
  const [modal, setModal] = useState<'flags' | 'suspend' | 'deactivate' | 'reactivate' | null>(null)
  if (!item) return <AdminNotFound label="Back to regulation" to="/admin/regulation" />
  return (
    <AdminDetailShell
      backLabel="Back to regulation"
      onBack={() => navigate('/admin/regulation')}
      title={item.buyer}
      badge={item.status}
      subtitle={item.reason}
      actions={
        <>
          <AdminButton variant="outline" onClick={() => setModal('flags')}>Update flags</AdminButton>
          {item.status === 'Active' || item.status === 'Restricted' ? (
            <AdminButton variant="dangerOutline" onClick={() => setModal('suspend')}>Suspend</AdminButton>
          ) : null}
          {item.status !== 'Deactivated' ? (
            <AdminButton variant="danger" onClick={() => setModal('deactivate')}>Deactivate</AdminButton>
          ) : (
            <AdminButton onClick={() => setModal('reactivate')}>Reactivate</AdminButton>
          )}
        </>
      }
    >
      <TwoCol>
        <AdminCard title="Flags" className="space-y-2">
          {item.flags.map((f) => (
            <p key={f} className="rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-700">{f}</p>
          ))}
        </AdminCard>
        <HistoryPanel items={item.history} />
      </TwoCol>
      {modal === 'flags' ? (
        <ConfirmModal title="Update regulation flags" body="Add a watch flag on this buyer." confirmLabel="Save flags" onClose={() => setModal(null)} onConfirm={() => { dispatch(showToast('Flags updated')); setModal(null) }} />
      ) : null}
      {modal === 'suspend' ? (
        <ConfirmModal title="Suspend buyer" body="The buyer cannot bid or withdraw until reactivated." confirmLabel="Suspend" danger onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'regulation', id: item.id, status: 'Suspended' })); setModal(null) }} />
      ) : null}
      {modal === 'deactivate' ? (
        <ConfirmModal title="Deactivate buyer" body="Admin has left the organization — or the account must be closed." confirmLabel="Deactivate" danger onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'regulation', id: item.id, status: 'Deactivated' })); setModal(null) }} />
      ) : null}
      {modal === 'reactivate' ? (
        <ConfirmModal title="Reactivate account" body="Restore bidding and withdrawals for this buyer." confirmLabel="Reactivate" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'regulation', id: item.id, status: 'Active' })); setModal(null) }} />
      ) : null}
    </AdminDetailShell>
  )
}
