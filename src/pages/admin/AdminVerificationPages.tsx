import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKpi,
  AdminKv,
  AdminSearch,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminDetailShell,
  AdminListShell,
  AdminNotFound,
  AdminSummaryGrid,
  AdminTablePanel,
  AdminToolbar,
  ConfirmModal,
  DocRow,
  HistoryPanel,
  NotesPanel,
  StatusCell,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addAdminNote, setVerificationStatus } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'

export function AdminVerificationPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.verifications)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [type, setType] = useState('All types')

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (!matchesQuery(`${r.applicant} ${r.verificationType} ${r.id}`, query)) return false
        if (status !== 'All statuses' && r.status !== status) return false
        if (type !== 'All types' && r.verificationType !== type) return false
        return true
      }),
    [rows, query, status, type],
  )

  return (
    <AdminListShell
      title="Verification"
      subtitle="Review buyer and business identity documents before granting marketplace access."
      showExport
      kpis={
        <AdminSummaryGrid>
          <AdminKpi label="Total requests" value={rows.length} hint="All time" />
          <AdminKpi label="Pending review" value={rows.filter((r) => r.status === 'Pending').length} hint="Awaiting admin" hintTone="warning" />
          <AdminKpi label="Approved" value={rows.filter((r) => r.status === 'Approved').length} hint="Verified accounts" hintTone="success" />
          <AdminKpi label="Rejected" value={rows.filter((r) => r.status === 'Rejected').length} hint="Did not pass review" hintTone="danger" />
          <AdminKpi
            label="Requires resubmission"
            value={rows.filter((r) => r.status === 'Requires Resubmission').length}
            hint="Waiting on applicant"
            hintTone="info"
          />
        </AdminSummaryGrid>
      }
    >
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search by applicant name" />
            <AdminFilter value={status} onChange={setStatus} options={['All statuses', 'Pending', 'Approved', 'Rejected', 'Requires Resubmission']} />
            <AdminFilter value={type} onChange={setType} options={['All types', 'Individual KYC', 'Business KYB']} />
            <AdminFilter value="Date range" onChange={() => undefined} options={['Date range']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="1.1fr 0.9fr 1.1fr 0.9fr 1fr 0.9fr 72px"
          actionLabel="Review"
          onRow={(row) => navigate(`/admin/verification/${row.id}`)}
          columns={[
            { header: 'Applicant', render: (r) => <span className="font-medium">{r.applicant}</span> },
            { header: 'Account type', render: (r) => r.accountType },
            { header: 'Verification type', render: (r) => r.verificationType },
            { header: 'Submitted', render: (r) => r.submitted },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'Last updated', render: (r) => r.lastUpdated },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminVerificationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.verifications.find((v) => v.id === id))
  const [modal, setModal] = useState<'approve' | 'reject' | 'resubmit' | 'preview' | null>(null)
  const [reason, setReason] = useState('')

  if (!item) {
    return <AdminNotFound label="Back to verification" to="/admin/verification" />
  }

  const pending = item.status === 'Pending' || item.status === 'Requires Resubmission'

  return (
    <AdminDetailShell
      backLabel="Back to verification"
      onBack={() => navigate('/admin/verification')}
      title={item.applicant}
      badge={item.status}
      subtitle={`${item.accountType} · ${item.verificationType} · Submitted ${item.submitted}`}
      actions={
        pending ? (
          <>
            <AdminButton variant="infoOutline" onClick={() => setModal('resubmit')}>
              Request Resubmission
            </AdminButton>
            <AdminButton variant="dangerOutline" onClick={() => setModal('reject')}>
              Reject
            </AdminButton>
            <AdminButton onClick={() => setModal('approve')}>Approve Verification</AdminButton>
          </>
        ) : undefined
      }
    >

      <TwoCol>
        <AdminCard title="Applicant Information" className="space-y-3">
          <AdminKv label="Full Name" value={item.applicant} />
          <AdminKv label="Account Type" value={item.accountType} />
          {item.businessName ? <AdminKv label="Business Name" value={item.businessName} /> : null}
          {item.registrationNo ? <AdminKv label="Registration No." value={item.registrationNo} /> : null}
          <AdminKv label="Email" value={item.email} />
          <AdminKv label="Phone" value={item.phone} />
          <AdminKv label="Address" value={item.address} />
        </AdminCard>
        <AdminCard title="Verification Summary" className="space-y-3">
          <AdminKv label="Verification Type" value={item.verificationType} />
          <AdminKv label="Status" value={item.status} badge={item.status} />
          <AdminKv label="Submitted Date" value={`${item.submitted}, 08:30`} />
          <AdminKv label="Last Updated" value={item.lastUpdated} />
          <AdminKv label="Reviewed By" value={item.reviewedBy} />
          <AdminKv label="Documents Submitted" value={`${item.documents.length} files`} />
        </AdminCard>
      </TwoCol>

      <AdminCard title="Submitted Documents" className="space-y-2">
        {item.documents.map((doc) => (
          <button key={doc.name} type="button" className="block w-full text-left" onClick={() => setModal('preview')}>
            <DocRow {...doc} />
          </button>
        ))}
      </AdminCard>

      <TwoCol>
        <NotesPanel
          notes={item.notes}
          onAdd={(body) => dispatch(addAdminNote({ collection: 'verifications', id: item.id, body }))}
        />
        <HistoryPanel title="Verification History" items={item.history} />
      </TwoCol>

      {modal === 'approve' ? (
        <ConfirmModal
          title="Approve verification"
          body={`Approve ${item.applicant} and grant marketplace access. This will be recorded in the audit log.`}
          confirmLabel="Approve Verification"
          onClose={() => setModal(null)}
          onConfirm={() => {
            dispatch(setVerificationStatus({ id: item.id, status: 'Approved' }))
            dispatch(showToast('Verification approved'))
            setModal(null)
          }}
        />
      ) : null}
      {modal === 'reject' ? (
        <ConfirmModal
          title="Reject verification"
          body="The applicant will be notified and will not receive marketplace access."
          confirmLabel="Reject"
          danger
          onClose={() => setModal(null)}
          onConfirm={() => {
            dispatch(setVerificationStatus({ id: item.id, status: 'Rejected', note: reason }))
            dispatch(showToast('Verification rejected'))
            setModal(null)
          }}
        >
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection"
            className="mt-3 min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none"
          />
        </ConfirmModal>
      ) : null}
      {modal === 'resubmit' ? (
        <ConfirmModal
          title="Request resubmission"
          body="Ask the applicant to upload clearer documents. Status will move to Requires Resubmission."
          confirmLabel="Send request"
          onClose={() => setModal(null)}
          onConfirm={() => {
            dispatch(setVerificationStatus({ id: item.id, status: 'Requires Resubmission', note: reason }))
            dispatch(showToast('Resubmission requested'))
            setModal(null)
          }}
        >
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="What should they fix?"
            className="mt-3 min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none"
          />
        </ConfirmModal>
      ) : null}
      {modal === 'preview' ? (
        <ConfirmModal
          title="Document preview"
          body={`${item.documents[0]?.name} — preview is shown as submitted. Use Approve or Reject on the case when ready.`}
          confirmLabel="Close"
          onClose={() => setModal(null)}
          onConfirm={() => setModal(null)}
        />
      ) : null}
    </AdminDetailShell>
  )
}

export { AdminToolbar }
