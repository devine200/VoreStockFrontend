import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKpi,
  AdminKv,
  AdminModal,
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
  DocRow,
  HistoryPanel,
  NotesPanel,
  StatusCell,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { Icon } from '@/components/shared/Icon'
import { adminIcons } from '@/assets/admin'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addAdminNote, setVerificationDocumentStatus, setVerificationStatus } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminDoc, AdminVerification } from '@/types/admin'

const REJECT_REASON = 'Document does not match applicant details'
const RESUBMIT_DEFAULT = 'Image is blurry — please upload a clearer photo of the ID'
const TABLE_GRID = 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 60px'

function downloadCsv(rows: AdminVerification[]) {
  const header = ['Applicant', 'Account type', 'Verification type', 'Submitted', 'Status', 'Last updated']
  const body = rows.map((r) => [r.applicant, r.accountType, r.verificationType, r.submitted, r.status, r.lastUpdated].join(','))
  const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'verification.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function ModalIcon({ tone, children }: { tone: 'success' | 'danger' | 'info'; children: ReactNode }) {
  const wrap = {
    success: 'bg-emerald-50',
    danger: 'bg-red-50',
    info: 'bg-blue-50',
  }[tone]
  return <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${wrap}`}>{children}</div>
}

function DetailBox({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-[10px] bg-slate-50 px-4 py-3.5 text-[12.5px] leading-[normal]">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-4">
          <span className="font-normal text-slate-500">{row.label}</span>
          <span className="text-right font-medium text-slate-800">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export function AdminVerificationPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.verifications)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [type, setType] = useState('All types')
  const [range, setRange] = useState('Date range')

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (!matchesQuery(`${r.applicant} ${r.verificationType} ${r.id}`, query)) return false
        if (status !== 'All statuses' && r.status !== status) return false
        if (type !== 'All types' && r.verificationType !== type) return false
        if (range !== 'Date range') return true
        return true
      }),
    [rows, query, status, type, range],
  )

  return (
    <AdminListShell
      title="Verification"
      subtitle="Review buyer and business identity documents before granting marketplace access."
      actions={
        <AdminButton variant="outline" onClick={() => downloadCsv(filtered)}>
          Export
        </AdminButton>
      }
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
            <AdminFilter value={range} onChange={setRange} options={['Date range', 'Last 7 days', 'Last 30 days', 'Last 90 days']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid={TABLE_GRID}
          actionLabel="Review"
          onRow={(row) => navigate(`/admin/verification/${row.id}`)}
          columns={[
            { header: 'Applicant', mobile: 'title', render: (r) => <span className="font-medium text-slate-800">{r.applicant}</span> },
            { header: 'Account type', mobile: 'meta', render: (r) => r.accountType },
            { header: 'Verification type', mobile: 'meta', render: (r) => r.verificationType },
            { header: 'Submitted', mobile: 'hide', render: (r) => r.submitted },
            { header: 'Status', mobile: 'status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'Last updated', mobile: 'hide', render: (r) => r.lastUpdated },
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
  const buyer = useAppSelector((s) =>
    s.admin.buyers.find((b) => (item ? b.name === item.applicant || b.id === item.buyerId : false)),
  )
  const [modal, setModal] = useState<'approve' | 'reject' | 'resubmit' | 'preview' | null>(null)
  const [activeDoc, setActiveDoc] = useState<AdminDoc | null>(null)
  const [reason, setReason] = useState('')
  const [rejectChip] = useState(REJECT_REASON)

  if (!item) {
    return <AdminNotFound label="Back to verification" to="/admin/verification" />
  }

  const pending = item.status === 'Pending'
  const resubmission = item.status === 'Requires Resubmission'
  const rejected = item.status === 'Rejected'
  const approved = item.status === 'Approved'
  const detailStatus = approved ? 'Verified' : item.status
  const flaggedDoc = activeDoc?.name ?? item.flaggedDocument ?? item.documents[0]?.name ?? ''

  const openPreview = (doc: AdminDoc) => {
    setActiveDoc(doc)
    setModal('preview')
  }

  const openReject = (doc?: AdminDoc) => {
    setActiveDoc(doc ?? item.documents[0] ?? null)
    setReason('')
    setModal('reject')
  }

  const openResubmit = (doc?: AdminDoc) => {
    const fallback =
      item.documents.find((d) => /id|\.jpg|\.png/i.test(d.name) && d.status !== 'Approved') ??
      item.documents.find((d) => d.status !== 'Approved') ??
      item.documents[0] ??
      null
    setActiveDoc(doc ?? fallback)
    setReason(RESUBMIT_DEFAULT)
    setModal('resubmit')
  }

  const subtitle = resubmission
    ? `${item.accountType} · ${item.verificationType} · Flagged ${item.lastUpdated}`
    : rejected
      ? `${item.accountType} · ${item.verificationType} · Rejected ${item.lastUpdated}`
      : approved
        ? `${item.accountType} · ${item.verificationType} · Verified ${item.lastUpdated}`
        : `${item.accountType} · ${item.verificationType} · Submitted ${item.submitted}`

  return (
    <AdminDetailShell
      backLabel="Back to verification"
      onBack={() => navigate('/admin/verification')}
      title={item.applicant}
      badge={detailStatus}
      subtitle={subtitle}
      actions={
        pending ? (
          <>
            <AdminButton variant="infoOutline" onClick={() => openResubmit()}>
              Request Resubmission
            </AdminButton>
            <AdminButton variant="dangerOutline" onClick={() => openReject()}>
              Reject
            </AdminButton>
            <AdminButton onClick={() => setModal('approve')}>Approve Verification</AdminButton>
          </>
        ) : resubmission ? (
          <AdminButton
            variant="outline"
            onClick={() => dispatch(showToast('Reminder sent to the applicant'))}
          >
            Send Reminder
          </AdminButton>
        ) : approved && buyer ? (
          <AdminButton variant="maroonOutline" onClick={() => navigate(`/admin/buyers/${buyer.id}`)}>
            View Buyer Profile
          </AdminButton>
        ) : undefined
      }
    >
      {resubmission ? (
        <div className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5">
          <p className="text-[12.5px] font-normal leading-[normal] text-blue-700">
            Waiting on the applicant to re-upload the flagged document. No admin action needed until resubmission.
          </p>
        </div>
      ) : null}

      {rejected ? (
        <div className="w-full rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
          <p className="text-[12.5px] font-normal leading-[normal] text-red-600">
            Verification rejected: submitted ID does not match the name on file. The applicant may reapply once resolved.
          </p>
        </div>
      ) : null}

      {approved ? (
        <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
          <p className="text-[12.5px] font-normal leading-[normal] text-emerald-700">
            Identity verified. This applicant has full marketplace access.
          </p>
        </div>
      ) : null}

      {resubmission ? (
        <TwoCol>
          <AdminCard title="Resubmission Details">
            <AdminKv label="Status" value={item.status} badge={item.status} />
            <AdminKv label="Document Flagged" value={item.flaggedDocument ?? flaggedDoc} tone="strong" />
            <AdminKv label="Reason" value={item.resubmissionReason ?? '—'} />
            <AdminKv label="Date Requested" value={item.resubmissionAt ?? item.lastUpdated} />
            <AdminKv
              label="Waiting Since"
              value={<span className="font-medium text-amber-600">{item.waitingSince ?? item.lastUpdated}</span>}
            />
          </AdminCard>
          <AdminCard title="Applicant Information">
            <AdminKv label="Full Name" value={item.applicant} tone="strong" />
            <AdminKv label="Account Type" value={item.accountType} />
            <AdminKv label="Verification Type" value={item.verificationType} />
            <AdminKv label="Email" value={item.email} />
            <AdminKv label="Phone" value={item.phone} />
          </AdminCard>
        </TwoCol>
      ) : rejected ? (
        <TwoCol>
          <AdminCard title="Verification Summary">
            <AdminKv label="Status" value={item.status} badge={item.status} />
            <AdminKv label="Verification Type" value={item.verificationType} tone="strong" />
            <AdminKv label="Rejection Reason" value={item.rejectionReason ?? 'Rejected'} tone="danger" />
            <AdminKv label="Rejected Date" value={item.rejectedAt ?? item.updatedAt ?? item.lastUpdated} />
            <AdminKv label="Reviewed By" value={item.reviewedBy} tone="strong" />
          </AdminCard>
          <AdminCard title="Applicant Information">
            <AdminKv label="Full Name" value={item.applicant} tone="strong" />
            <AdminKv label="Account Type" value={item.accountType} />
            <AdminKv label="Email" value={item.email} />
            <AdminKv label="Phone" value={item.phone} />
            <AdminKv label="Documents Submitted" value={`${item.documents.length} files`} />
          </AdminCard>
        </TwoCol>
      ) : approved ? (
        <TwoCol>
          <AdminCard title="Verification Summary">
            <AdminKv label="Status" value={detailStatus} badge={detailStatus} />
            <AdminKv label="Verification Type" value={item.verificationType} tone="strong" />
            <AdminKv label="Verified Date" value={item.verifiedAt ?? item.updatedAt ?? item.lastUpdated} />
            <AdminKv label="Reviewed By" value={item.reviewedBy} />
            <AdminKv label="Documents Approved" value={`${item.documents.length} of ${item.documents.length}`} />
          </AdminCard>
          <AdminCard title="Applicant Information">
            <AdminKv label="Full Name" value={item.applicant} tone="strong" />
            <AdminKv label="Account Type" value={item.accountType} />
            <AdminKv label="Tier" value={item.tier ?? buyer?.tier ?? 'Tier 1'} />
            <AdminKv label="Email" value={item.email} />
            <AdminKv label="Phone" value={item.phone} />
          </AdminCard>
        </TwoCol>
      ) : (
        <TwoCol>
          <AdminCard title="Applicant Information">
            <AdminKv label="Full Name" value={item.applicant} tone="strong" />
            <AdminKv label="Account Type" value={item.accountType} />
            {item.businessName ? <AdminKv label="Business Name" value={item.businessName} /> : null}
            {item.registrationNo ? <AdminKv label="Registration No." value={item.registrationNo} /> : null}
            <AdminKv label="Email" value={item.email} />
            <AdminKv label="Phone" value={item.phone} />
            <AdminKv label="Address" value={item.address} />
          </AdminCard>
          <AdminCard title="Verification Summary">
            <AdminKv label="Verification Type" value={item.verificationType} tone="strong" />
            <AdminKv label="Status" value={item.status} badge={item.status} />
            <AdminKv label="Submitted Date" value={item.submittedAt ?? `${item.submitted}, 08:30`} />
            <AdminKv label="Last Updated" value={item.updatedAt ?? item.lastUpdated} />
            <AdminKv
              label="Reviewed By"
              value={item.reviewedBy}
              tone={item.reviewedBy === 'Not yet reviewed' ? 'muted' : undefined}
            />
            <AdminKv label="Documents Submitted" value={`${item.documents.length} files`} />
          </AdminCard>
        </TwoCol>
      )}

      {pending ? (
        <>
          <AdminCard title="Submitted Documents">
            {item.documents.map((doc) => (
              <DocRow
                key={doc.name}
                {...doc}
                onPreview={() => openPreview(doc)}
                onApprove={() => {
                  dispatch(setVerificationDocumentStatus({ id: item.id, name: doc.name, status: 'Approved' }))
                  dispatch(showToast(`${doc.name} approved`))
                }}
                onReject={() => openReject(doc)}
                onResubmit={() => openResubmit(doc)}
              />
            ))}
          </AdminCard>

          <TwoCol>
            <NotesPanel
              notes={item.notes}
              onAdd={(body) => dispatch(addAdminNote({ collection: 'verifications', id: item.id, body }))}
            />
            <HistoryPanel title="Verification History" items={item.history} />
          </TwoCol>
        </>
      ) : (
        <HistoryPanel title="Verification History" items={item.history} />
      )}

      {modal === 'approve' ? (
        <AdminModal
          title="Approve Verification"
          subtitle="This grants the applicant full marketplace access. This action is recorded in the audit trail."
          showClose={false}
          icon={
            <ModalIcon tone="success">
              <Icon src={adminIcons.check} size={18} />
            </ModalIcon>
          }
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                onClick={() => {
                  dispatch(setVerificationStatus({ id: item.id, status: 'Approved', historyTitle: 'Approved' }))
                  dispatch(showToast('Verification approved'))
                  setModal(null)
                }}
              >
                Approve Verification
              </AdminButton>
            </>
          }
        >
          <DetailBox
            rows={[
              { label: 'Applicant', value: item.applicant },
              { label: 'Verification Type', value: item.verificationType },
              { label: 'Documents Reviewed', value: `${item.documents.length} of ${item.documents.length}` },
            ]}
          />
        </AdminModal>
      ) : null}

      {modal === 'reject' ? (
        <AdminModal
          title="Reject Verification"
          subtitle="The applicant will be notified and must reapply. This cannot be undone."
          showClose={false}
          icon={
            <ModalIcon tone="danger">
              <span className="text-[16px] font-semibold leading-none text-red-600">!</span>
            </ModalIcon>
          }
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                variant="danger"
                onClick={() => {
                  const note = [rejectChip, reason.trim()].filter(Boolean).join(' — ')
                  dispatch(setVerificationStatus({ id: item.id, status: 'Rejected', note, historyTitle: 'Rejected' }))
                  dispatch(showToast('Verification rejected'))
                  setModal(null)
                  setReason('')
                }}
              >
                Confirm Rejection
              </AdminButton>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <DetailBox
              rows={[
                { label: 'Applicant', value: item.applicant },
                { label: 'Verification Type', value: item.verificationType },
              ]}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium leading-[normal] text-slate-600">Reason for rejection (required)</span>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] leading-[normal] text-slate-700">
                {rejectChip}
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add details for the applicant and audit trail"
                className="min-h-[52px] w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[12.5px] leading-[normal] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        </AdminModal>
      ) : null}

      {modal === 'resubmit' ? (
        <AdminModal
          title="Request Resubmission"
          subtitle="The applicant will be asked to re-upload the flagged document(s). Status moves to Requires Resubmission."
          showClose={false}
          icon={
            <ModalIcon tone="info">
              <Icon src={adminIcons.refreshBlue} size={18} />
            </ModalIcon>
          }
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                variant="info"
                disabled={!reason.trim()}
                onClick={() => {
                  dispatch(
                    setVerificationStatus({
                      id: item.id,
                      status: 'Requires Resubmission',
                      note: reason.trim(),
                      flaggedDocument: flaggedDoc,
                      historyTitle: 'Resubmission Requested',
                    }),
                  )
                  dispatch(showToast('Resubmission requested'))
                  setModal(null)
                }}
              >
                Send Resubmission Request
              </AdminButton>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <DetailBox
              rows={[
                { label: 'Applicant', value: item.applicant },
                { label: 'Document Flagged', value: flaggedDoc },
              ]}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium leading-[normal] text-slate-600">Reason for resubmission (required)</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[52px] w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[12.5px] leading-[normal] text-slate-700 outline-none"
              />
            </label>
          </div>
        </AdminModal>
      ) : null}

      {modal === 'preview' && activeDoc ? (
        <AdminModal bare wide onClose={() => setModal(null)}>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-[18px]">
            <div className="flex flex-col gap-0.5">
              <p className="text-[14px] font-semibold leading-[normal] text-slate-900">{activeDoc.name}</p>
              <p className="text-[11.5px] font-normal leading-[normal] text-slate-500">
                Uploaded {activeDoc.uploaded} · {activeDoc.size}
              </p>
            </div>
            <button type="button" aria-label="Close" onClick={() => setModal(null)}>
              <Icon src={adminIcons.close} size={16} />
            </button>
          </div>
          <div className="flex h-[380px] items-center justify-center bg-slate-50">
            <Icon src={adminIcons.filePreview} size={96} />
          </div>
          <div className="flex flex-col gap-3 px-5 pt-4 pb-5">
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-normal text-slate-500">Document status:</span>
              <AdminBadge status={activeDoc.status === 'Pending' ? 'Pending Review' : activeDoc.status} />
            </div>
            {pending ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:[&_.inline-flex]:w-auto [&_.inline-flex]:w-full">
                <AdminButton
                  variant="infoOutline"
                  onClick={() => {
                    setModal('resubmit')
                    setReason(RESUBMIT_DEFAULT)
                  }}
                >
                  Request Resubmission
                </AdminButton>
                <AdminButton variant="dangerOutline" onClick={() => openReject(activeDoc)}>
                  Reject Document
                </AdminButton>
                <AdminButton
                  onClick={() => {
                    dispatch(setVerificationDocumentStatus({ id: item.id, name: activeDoc.name, status: 'Approved' }))
                    dispatch(showToast(`${activeDoc.name} approved`))
                    setModal(null)
                  }}
                >
                  Approve Document
                </AdminButton>
              </div>
            ) : null}
          </div>
        </AdminModal>
      ) : null}
    </AdminDetailShell>
  )
}

export { AdminToolbar }
