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
  ConfirmModal,
  HistoryPanel,
  NotesPanel,
  StatusCell,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addAdminNote, setRecordStatus } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'

function Missing({ label, to }: { label: string; to: string }) {
  return <AdminNotFound label={label} to={to} />
}

export function AdminSettlementsPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.settlements)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const filtered = useMemo(
    () => rows.filter((r) => matchesQuery(`${r.buyer} ${r.lot} ${r.id} ${r.orderRef}`, query) && (status === 'All statuses' || r.status === status)),
    [rows, query, status],
  )
  return (
    <AdminListShell
      title="Settlements"
      subtitle="Track, review, and process auction settlement payouts."
      showExport
      kpis={
        <AdminSummaryGrid>
          <AdminKpi label="Total settlement" value="$11,260" hint="8 records" />
          <AdminKpi label="Pending settlement" value="$1,840" hint="2 awaiting review" hintTone="warning" />
          <AdminKpi label="Processing settlement" value="$1,794" hint="1 in progress" hintTone="info" />
          <AdminKpi label="Completed settlement" value="$3,753" hint="3 paid out" hintTone="success" />
          <AdminKpi label="Failed settlement" value="$2,100" hint="1 needs retry" hintTone="danger" />
        </AdminSummaryGrid>
      }
    >
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search by settlement, order, or buyer" />
            <AdminFilter value={status} onChange={setStatus} options={['All statuses', 'Pending', 'Overdue', 'On Hold', 'Completed', 'Failed']} />
            <AdminFilter value="Date range" onChange={() => undefined} options={['Date range']} />
            <AdminFilter value="Newest first" onChange={() => undefined} options={['Newest first']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="0.9fr 0.8fr 1fr 1.2fr 0.7fr 0.6fr 0.7fr 0.8fr 0.8fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/settlements/${r.id}`)}
          columns={[
            { header: 'Settlement ID', render: (r) => r.id },
            { header: 'Order / txn', render: (r) => r.orderRef },
            { header: 'Buyer', render: (r) => r.buyer },
            { header: 'Auction / lot', render: (r) => r.lot },
            { header: 'Amount', render: (r) => r.amount },
            { header: 'Fees', render: (r) => r.fees },
            { header: 'Net amount', render: (r) => r.netAmount },
            { header: 'Date', render: (r) => r.date },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminSettlementDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.settlements.find((r) => r.id === id))
  const [modal, setModal] = useState<'approve' | 'reject' | 'retry' | 'adjust' | null>(null)
  if (!item) return <Missing label="Back to settlements" to="/admin/settlements" />
  return (
    <AdminDetailShell
      backLabel="Back to settlements"
      onBack={() => navigate('/admin/settlements')}
      title={item.buyer}
      badge={item.status}
      subtitle={`${item.lot} · ${item.amount} due`}
      actions={
        <>
          {item.status === 'Failed' ? <AdminButton variant="outline" onClick={() => setModal('retry')}>Retry</AdminButton> : null}
          {item.status !== 'Completed' ? (
            <>
              <AdminButton variant="outline" onClick={() => setModal('adjust')}>Adjust</AdminButton>
              <AdminButton variant="dangerOutline" onClick={() => setModal('reject')}>Reject</AdminButton>
              <AdminButton onClick={() => setModal('approve')}>Approve settlement</AdminButton>
            </>
          ) : null}
        </>
      }
    >
      <TwoCol>
        <AdminCard title="Settlement" className="space-y-3">
          <AdminKv label="Settlement ID" value={item.id} />
          <AdminKv label="Order / txn" value={item.orderRef} />
          <AdminKv label="Amount" value={item.amount} />
          <AdminKv label="Fees" value={item.fees} />
          <AdminKv label="Net amount" value={item.netAmount} />
          <AdminKv label="Remaining" value={item.remaining} />
          <AdminKv label="Date" value={item.date} />
          <AdminKv label="Due" value={item.due} />
          <AdminKv label="Won at" value={item.wonAt} />
          <AdminKv label="Method" value={item.method} />
        </AdminCard>
        <HistoryPanel items={item.history} />
      </TwoCol>
      <NotesPanel notes={item.notes} onAdd={(body) => dispatch(addAdminNote({ collection: 'settlements', id: item.id, body }))} />
      {modal === 'approve' ? (
        <ConfirmModal title="Approve settlement" body="Mark this settlement collected and release the lot to fulfillment." confirmLabel="Approve" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'settlements', id: item.id, status: 'Completed' })); dispatch(showToast('Settlement approved')); setModal(null) }} />
      ) : null}
      {modal === 'reject' ? (
        <ConfirmModal title="Reject settlement" body="The buyer will remain in default and the lot may be relisted." confirmLabel="Reject" danger onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'settlements', id: item.id, status: 'Failed' })); dispatch(showToast('Settlement rejected')); setModal(null) }} />
      ) : null}
      {modal === 'retry' ? (
        <ConfirmModal title="Retry settlement" body="Retry the collection against the buyer’s wallet and saved payment method." confirmLabel="Retry" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'settlements', id: item.id, status: 'Processing' })); dispatch(showToast('Settlement retry started')); setModal(null) }} />
      ) : null}
      {modal === 'adjust' ? (
        <ConfirmModal title="Adjust remaining balance" body="Record a manual adjustment. The new remaining balance will appear on the settlement." confirmLabel="Save adjustment" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'settlements', id: item.id, status: item.status, extra: { remaining: '$0' } })); dispatch(showToast('Adjustment saved')); setModal(null) }} />
      ) : null}
    </AdminDetailShell>
  )
}

export function AdminProxyPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.proxies)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const filtered = useMemo(
    () => rows.filter((r) => matchesQuery(`${r.lot} ${r.buyer} ${r.id} ${r.auctionLot}`, query) && (status === 'All statuses' || r.status === status)),
    [rows, query, status],
  )
  return (
    <AdminListShell
      title="Proxy Placement"
      subtitle="Monitor and manage proxy bids placed automatically on behalf of buyers."
      showExport
      kpis={
        <AdminSummaryGrid cols={4}>
          <AdminKpi label="Active proxy bids" value={rows.filter((r) => r.status === 'Active').length} hint="Currently bidding" />
          <AdminKpi label="Total proxy bids" value={rows.length} hint="All time" />
          <AdminKpi label="Won proxy bids" value={rows.filter((r) => r.status === 'Winning').length} hint="Total bids won" hintTone="success" />
          <AdminKpi label="Lost proxy bid" value={rows.filter((r) => r.status === 'Outbid').length} hint="Total lost bids" hintTone="danger" />
        </AdminSummaryGrid>
      }
    >
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search by proxy bid ID, buyer, or lot" />
            <AdminFilter value={status} onChange={setStatus} options={['All statuses', 'Active', 'Winning', 'Outbid', 'Placed', 'Refunded']} />
          </>
        }
        secondaryToolbar={
          <>
            <AdminFilter label="Buyer" value="Buyer" onChange={() => undefined} options={['Buyer']} />
            <AdminFilter label="Auction" value="Auction / Lot" onChange={() => undefined} options={['Auction / Lot']} />
            <AdminFilter value="Date range" onChange={() => undefined} options={['Date range']} />
            <AdminFilter value="Newest first" onChange={() => undefined} options={['Newest first']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="0.8fr 1fr 1.4fr 0.8fr 0.8fr 0.7fr 0.8fr 0.9fr 0.8fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/proxy-placement/${r.id}`)}
          columns={[
            { header: 'Proxy bid ID', render: (r) => r.id },
            { header: 'Buyer', render: (r) => r.buyer },
            { header: 'Auction / lot', render: (r) => r.auctionLot },
            { header: 'Current bid', render: (r) => r.current },
            { header: 'Max proxy', render: (r) => r.maxBid },
            { header: 'Increment', render: (r) => r.increment },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'Created', render: (r) => r.created },
            { header: 'Ends', render: (r) => r.ends },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminProxyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.proxies.find((r) => r.id === id))
  const [modal, setModal] = useState<'refund' | 'status' | null>(null)
  if (!item) return <Missing label="Back to proxy placement" to="/admin/proxy-placement" />
  return (
    <AdminDetailShell
      backLabel="Back to proxy placement"
      onBack={() => navigate('/admin/proxy-placement')}
      title={item.auctionLot}
      badge={item.status}
      subtitle={`${item.buyer} · ${item.id} · ${item.source}`}
      actions={
        <>
          <AdminButton variant="outline" onClick={() => setModal('status')}>Update status</AdminButton>
          {item.status === 'Outbid' ? <AdminButton variant="dangerOutline" onClick={() => setModal('refund')}>Initiate refund</AdminButton> : null}
        </>
      }
    >
      <TwoCol>
        <AdminCard title="Proxy bid" className="space-y-3">
          <AdminKv label="Proxy bid ID" value={item.id} />
          <AdminKv label="Max bid" value={item.maxBid} />
          <AdminKv label="Current bid" value={item.current} />
          <AdminKv label="Increment" value={item.increment} />
          <AdminKv label="T-30" value={item.t30} />
          <AdminKv label="Created" value={item.created} />
          <AdminKv label="Ends" value={item.ends} />
          <AdminKv label="Source" value={item.source} />
        </AdminCard>
        <HistoryPanel items={item.history} />
      </TwoCol>
      {modal === 'refund' ? (
        <ConfirmModal title="Initiate refund" body="Refund the locked bid hold to the buyer wallet." confirmLabel="Refund" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'proxies', id: item.id, status: 'Refunded' })); dispatch(showToast('Refund initiated')); setModal(null) }} />
      ) : null}
      {modal === 'status' ? (
        <ConfirmModal title="Update status" body="Mark this proxy bid as placed on B-Stock." confirmLabel="Mark placed" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'proxies', id: item.id, status: 'Placed' })); dispatch(showToast('Status updated')); setModal(null) }} />
      ) : null}
    </AdminDetailShell>
  )
}

export function AdminWithdrawalsPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.withdrawals)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const filtered = useMemo(
    () => rows.filter((r) => matchesQuery(`${r.buyer} ${r.id}`, query) && (status === 'All statuses' || r.status === status)),
    [rows, query, status],
  )
  return (
    <AdminListShell title="Withdrawals" subtitle="Buyers requesting payout from wallet.">
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search by buyer or withdrawal ID" />
            <AdminFilter value={status} onChange={setStatus} options={['All statuses', 'Pending', 'Completed', 'Rejected']} />
            <AdminFilter value="Date range" onChange={() => undefined} options={['Date range']} />
            <AdminFilter value="Pending first" onChange={() => undefined} options={['Pending first']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="1.1fr 0.9fr 0.7fr 1.2fr 0.8fr 72px"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/withdrawals/${r.id}`)}
          columns={[
            { header: 'Buyer', render: (r) => r.buyer },
            { header: 'Withdrawal ID', render: (r) => r.id },
            { header: 'Amount', render: (r) => r.amount },
            { header: 'Requested', render: (r) => r.requested },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminWithdrawalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.withdrawals.find((r) => r.id === id))
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null)
  if (!item) return <Missing label="Back to withdrawals" to="/admin/withdrawals" />
  return (
    <AdminDetailShell
      backLabel="Back to withdrawals"
      onBack={() => navigate('/admin/withdrawals')}
      title={item.buyer}
      badge={item.status}
      subtitle={`${item.id} · ${item.amount}`}
      actions={
        item.status === 'Pending' ? (
          <>
            <AdminButton variant="dangerOutline" onClick={() => setModal('reject')}>Reject</AdminButton>
            <AdminButton onClick={() => setModal('approve')}>Approve payout</AdminButton>
          </>
        ) : undefined
      }
    >
      <TwoCol>
        <AdminCard title="Payout details" className="space-y-3">
          <AdminKv label="Amount" value={item.amount} />
          <AdminKv label="Method" value={item.method} />
          <AdminKv label="Destination" value={item.destination} />
          <AdminKv label="Requested" value={item.requested} />
        </AdminCard>
        <HistoryPanel items={item.history} />
      </TwoCol>
      <NotesPanel notes={item.notes} onAdd={(body) => dispatch(addAdminNote({ collection: 'withdrawals', id: item.id, body }))} />
      {modal === 'approve' ? (
        <ConfirmModal title="Approve withdrawal" body={`Pay ${item.amount} to ${item.destination}.`} confirmLabel="Approve payout" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'withdrawals', id: item.id, status: 'Completed' })); dispatch(showToast('Withdrawal approved')); setModal(null) }} />
      ) : null}
      {modal === 'reject' ? (
        <ConfirmModal title="Reject withdrawal" body="The amount will remain in the buyer wallet." confirmLabel="Reject" danger onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'withdrawals', id: item.id, status: 'Rejected' })); dispatch(showToast('Withdrawal rejected')); setModal(null) }} />
      ) : null}
    </AdminDetailShell>
  )
}

export function AdminTplPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.tpl)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => rows.filter((r) => matchesQuery(`${r.orderId} ${r.buyer} ${r.device}`, query)), [rows, query])
  return (
    <AdminListShell title="3PL verification" subtitle="Orders requiring IMEI and serial number checks before shipping continues." showExport>
      <AdminTablePanel
        toolbar={<AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search by order or buyer" />}
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="0.8fr 1fr 1.2fr 1fr 0.8fr 72px"
          actionLabel="Review"
          onRow={(r) => navigate(`/admin/3pl-verification/${r.id}`)}
          columns={[
            { header: 'Order', render: (r) => r.orderId },
            { header: 'Buyer', render: (r) => r.buyer },
            { header: 'Device', render: (r) => r.device },
            { header: 'IMEI', render: (r) => r.imei },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminTplDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.tpl.find((r) => r.id === id))
  const [modal, setModal] = useState(false)
  if (!item) return <Missing label="Back to 3PL verification" to="/admin/3pl-verification" />
  return (
    <AdminDetailShell
      backLabel="Back to 3PL verification"
      onBack={() => navigate('/admin/3pl-verification')}
      title={item.orderId}
      badge={item.status}
      subtitle={`${item.buyer} · ${item.device}`}
      actions={item.status !== 'Verified' ? <AdminButton onClick={() => setModal(true)}>Mark verified</AdminButton> : undefined}
    >
      <TwoCol>
        <AdminCard title="Device" className="space-y-3">
          <AdminKv label="IMEI" value={item.imei} />
          <AdminKv label="Serial" value={item.serial} />
          <AdminKv label="Submitted" value={item.submitted} />
        </AdminCard>
        <HistoryPanel items={item.history} />
      </TwoCol>
      {modal ? (
        <ConfirmModal title="Mark verified" body="Confirm IMEI and serial. The order will continue to shipping." confirmLabel="Mark verified" onClose={() => setModal(false)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'tpl', id: item.id, status: 'Verified' })); dispatch(showToast('3PL verification recorded')); setModal(false) }} />
      ) : null}
    </AdminDetailShell>
  )
}

export function AdminSupportQueuePage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.tickets)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          matchesQuery(`${r.buyer} ${r.subject} ${r.id}`, query) &&
          (status === 'All' || r.status === status) &&
          (priority === 'All' || r.priority === priority),
      ),
    [rows, query, status, priority],
  )
  return (
    <AdminListShell title="Support" subtitle="Tickets approaching or past SLA are prioritized first.">
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="w-full sm:w-[280px]" value={query} onChange={setQuery} placeholder="Search by ticket ID, buyer, or subject" />
            <AdminFilter label="Status" value={status} onChange={setStatus} options={['All', 'Open', 'Resolved', 'Closed']} />
            <AdminFilter label="Priority" value={priority} onChange={setPriority} options={['All', 'Urgent', 'Normal', 'Low']} />
            <AdminFilter label="Category" value="All" onChange={() => undefined} options={['All']} />
          </>
        }
        secondaryToolbar={
          <>
            <AdminFilter label="SLA" value="All" onChange={() => undefined} options={['All']} />
            <AdminFilter label="Created" value="All time" onChange={() => undefined} options={['All time']} />
            <AdminFilter value="Sort: SLA urgency" onChange={() => undefined} options={['Sort: SLA urgency']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="0.7fr 0.9fr 1.2fr 0.8fr 0.7fr 0.8fr 0.7fr 0.8fr 0.8fr 72px"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/support/${r.id}`)}
          columns={[
            { header: 'Ticket', render: (r) => r.id },
            { header: 'Buyer', render: (r) => r.buyer },
            { header: 'Subject', render: (r) => r.subject },
            { header: 'Category', render: (r) => r.category },
            { header: 'Priority', render: (r) => <StatusCell status={r.priority} /> },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'SLA', render: (r) => r.sla },
            { header: 'Created', render: (r) => r.created },
            { header: 'Updated', render: (r) => r.updated },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AdminTicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.tickets.find((r) => r.id === id))
  const [modal, setModal] = useState<'assign' | 'status' | 'resolve' | 'close' | null>(null)
  const [reply, setReply] = useState('')
  if (!item) return <Missing label="Back to support" to="/admin/support" />
  return (
    <AdminDetailShell
      backLabel="Back to support"
      onBack={() => navigate('/admin/support')}
      title={item.subject}
      badge={item.status}
      subtitle={`${item.id} · ${item.buyer} · ${item.priority}`}
      actions={
        <>
          <AdminButton variant="outline" onClick={() => setModal('assign')}>Assign</AdminButton>
          <AdminButton variant="outline" onClick={() => setModal('status')}>Update status</AdminButton>
          {item.status === 'Open' ? <AdminButton onClick={() => setModal('resolve')}>Resolve</AdminButton> : null}
          {item.status === 'Resolved' ? <AdminButton variant="outline" onClick={() => setModal('close')}>Close</AdminButton> : null}
        </>
      }
    >
      <TwoCol>
        <AdminCard title="Conversation">
          <div className="space-y-3">
            {item.messages.map((m, i) => (
              <div key={i} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[12px] font-medium text-slate-800">{m.from} · {m.at}</p>
                <p className="mt-1 text-[13px] text-slate-600">{m.body}</p>
              </div>
            ))}
          </div>
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to the buyer…" className="mt-4 min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none" />
          <div className="mt-2 flex justify-end">
            <AdminButton disabled={!reply.trim()} onClick={() => { dispatch(showToast('Reply sent')); setReply('') }}>Send reply</AdminButton>
          </div>
        </AdminCard>
        <div className="space-y-4">
          <AdminCard title="Ticket" className="space-y-3">
            <AdminKv label="Category" value={item.category} />
            <AdminKv label="Priority" value={item.priority} badge={item.priority} />
            <AdminKv label="SLA" value={item.sla} />
            <AdminKv label="Assignee" value={item.assignee} />
            <AdminKv label="Opened" value={item.opened} />
            <AdminKv label="Created" value={item.created} />
            <AdminKv label="Updated" value={item.updated} />
            <AdminKv label="Last reply" value={item.lastReply} />
          </AdminCard>
          <NotesPanel notes={item.notes} onAdd={(body) => dispatch(addAdminNote({ collection: 'tickets', id: item.id, body }))} />
        </div>
      </TwoCol>
      {modal === 'assign' ? (
        <ConfirmModal title="Assign ticket" body="Assign this ticket to Ops Admin." confirmLabel="Assign" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'tickets', id: item.id, status: item.status, extra: { assignee: 'Ops Admin' } })); dispatch(showToast('Ticket assigned')); setModal(null) }} />
      ) : null}
      {modal === 'status' ? (
        <ConfirmModal title="Update status" body="Move this ticket to Open so it returns to the queue." confirmLabel="Set Open" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'tickets', id: item.id, status: 'Open' })); setModal(null) }} />
      ) : null}
      {modal === 'resolve' ? (
        <ConfirmModal title="Resolve ticket" body="Mark this ticket resolved. The buyer can still reply." confirmLabel="Resolve" onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'tickets', id: item.id, status: 'Resolved' })); dispatch(showToast('Ticket resolved')); setModal(null) }} />
      ) : null}
      {modal === 'close' ? (
        <ConfirmModal title="Close ticket" body="Close this ticket. No further replies will be accepted." confirmLabel="Close ticket" danger onClose={() => setModal(null)} onConfirm={() => { dispatch(setRecordStatus({ collection: 'tickets', id: item.id, status: 'Closed' })); dispatch(showToast('Ticket closed')); setModal(null) }} />
      ) : null}
    </AdminDetailShell>
  )
}
