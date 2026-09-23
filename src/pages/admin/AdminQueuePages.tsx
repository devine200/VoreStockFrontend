import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
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
  ConfirmModal,
  HistoryPanel,
  NotesPanel,
  StatusCell,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { Icon } from '@/components/shared/Icon'
import { adminIcons } from '@/assets/admin'
import { SettlementDetail, SettlementReconciliation } from '@/components/admin/settlements/SettlementScreens'
import { SupportQueue, TicketDetail } from '@/components/admin/support/SupportScreens'
import { TplDetail, TplList } from '@/components/admin/tpl/TplScreens'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addAdminNote, setRecordStatus } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminSettlement, AdminWithdrawal } from '@/types/admin'

function Missing({ label, to }: { label: string; to: string }) {
  return <AdminNotFound label={label} to={to} />
}

function cents(value: string) {
  if (!value || value === 'Pending' || /\.\d{2}$/.test(value)) return value
  return `${value}.00`
}

function ModalIcon({ tone, children }: { tone: 'success' | 'danger' | 'info' | 'warning'; children: ReactNode }) {
  const wrap = {
    success: 'bg-emerald-50',
    danger: 'bg-red-50',
    info: 'bg-blue-50',
    warning: 'bg-amber-50',
  }[tone]
  return <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${wrap}`}>{children}</div>
}

function DetailBox({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 text-[13px]">
            <span className="text-slate-500">{row.label}</span>
            <span className="text-right font-medium text-slate-800">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Banner({
  tone,
  children,
  compact,
}: {
  tone: 'danger' | 'success' | 'info' | 'hold' | 'neutral'
  children: ReactNode
  compact?: boolean
}) {
  const styles = {
    danger: 'border-red-100 bg-red-50 text-red-700',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    info: 'border-blue-100 bg-blue-50 text-blue-700',
    hold: 'border-amber-100 bg-amber-50 text-amber-800',
    neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  }[tone]
  return (
    <p className={`max-w-[640px] rounded-lg border px-3.5 ${compact ? 'py-2.5' : 'py-3'} text-[13px] leading-5 ${styles}`}>
      {children}
    </p>
  )
}

function downloadSettlementsCsv(rows: AdminSettlement[]) {
  const header = ['Settlement ID', 'Order', 'Buyer', 'Lot', 'Amount', 'Fees', 'Net', 'Date', 'Status']
  const body = rows.map((r) => [r.id, r.orderRef, r.buyer, r.lot, r.amount, r.fees, r.netAmount, r.date, r.status].join(','))
  const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'settlements.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function AdminSettlementsPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.settlements)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'CSV' | 'PDF'>('CSV')
  const filtered = useMemo(
    () => rows.filter((r) => matchesQuery(`${r.buyer} ${r.lot} ${r.id} ${r.orderRef}`, query) && (status === 'All statuses' || r.status === status)),
    [rows, query, status],
  )
  return (
    <AdminListShell
      title="Settlements"
      subtitle="Track, review, and process auction settlement payouts."
      actions={
        <>
          <AdminButton variant="outline" onClick={() => navigate('/admin/settlements/reconciliation')}>
            Reconciliation
          </AdminButton>
          <AdminButton variant="outline" onClick={() => setExportOpen(true)}>
            Export
          </AdminButton>
        </>
      }
      kpis={
        <AdminSummaryGrid>
          <AdminKpi label="Total Settlement" value="$11,260" hint="8 records" />
          <AdminKpi label="Pending Settlement" value="$1,840" hint="2 awaiting review" hintTone="warning" />
          <AdminKpi label="Processing Settlement" value="$1,794" hint="1 in progress" hintTone="info" />
          <AdminKpi label="Completed Settlement" value="$3,753" hint="3 paid out" hintTone="success" />
          <AdminKpi label="Failed Settlement" value="$2,100" hint="1 needs retry" hintTone="danger" />
        </AdminSummaryGrid>
      }
    >
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search by settlement, order, or buyer" />
            <AdminFilter value={status} onChange={setStatus} options={['All statuses', 'Pending', 'Processing', 'Completed', 'On Hold', 'Failed', 'Rejected', 'Cancelled']} />
            <AdminFilter value="Date range" onChange={() => undefined} options={['Date range']} />
            <AdminFilter value="Newest first" onChange={() => undefined} options={['Newest first']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          tall
          rows={filtered}
          grid="0.85fr 0.85fr 1fr 1.35fr 0.7fr 0.55fr 0.8fr 0.85fr 0.85fr 48px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/settlements/${r.id}`)}
          columns={[
            { header: 'Settlement ID', render: (r) => <span className="font-medium text-[#480516]">{r.id}</span> },
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
      {exportOpen ? (
        <AdminModal
          title="Export settlements"
          subtitle={`Exports the ${filtered.length} records currently in view, including any active filters.`}
          showClose={false}
          maxWidth={400}
          onClose={() => setExportOpen(false)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setExportOpen(false)}>
                Cancel
              </AdminButton>
              <AdminButton
                onClick={() => {
                  if (exportFormat === 'CSV') downloadSettlementsCsv(filtered)
                  else {
                    const url = URL.createObjectURL(new Blob([['Settlements export'].join('\n')], { type: 'application/pdf' }))
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'settlements.pdf'
                    a.click()
                    URL.revokeObjectURL(url)
                  }
                  setExportOpen(false)
                }}
              >
                Download export
              </AdminButton>
            </>
          }
        >
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-medium text-slate-600">File format</p>
            {(['CSV', 'PDF'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setExportFormat(fmt)}
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left ${
                  exportFormat === fmt ? 'border-[#480516] bg-[#480516]/5' : 'border-slate-200 bg-white'
                }`}
              >
                <span className="mt-0.5 flex size-4 items-center justify-center rounded-full border border-slate-300">
                  {exportFormat === fmt ? <span className="size-2 rounded-full bg-[#480516]" /> : null}
                </span>
                <span>
                  <span className="block text-[13px] font-medium text-slate-800">{fmt}</span>
                  <span className="block text-[11.5px] text-slate-500">
                    {fmt === 'CSV' ? 'Best for spreadsheets and accounting tools' : 'Formatted summary for record-keeping'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </AdminModal>
      ) : null}
    </AdminListShell>
  )
}

export function AdminSettlementReconciliationPage() {
  return <SettlementReconciliation />
}

export function AdminSettlementDetailPage() {
  const { id } = useParams()
  const item = useAppSelector((s) => s.admin.settlements.find((r) => r.id === id))
  if (!item) return <Missing label="Back to settlements" to="/admin/settlements" />
  return <SettlementDetail item={item} />
}

export function AdminProxyPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.proxies)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [buyer, setBuyer] = useState('Buyer')
  const [auction, setAuction] = useState('Auction / Lot')
  const [sort, setSort] = useState('Newest first')
  const buyers = useMemo(
    () => ['Buyer', ...Array.from(new Set(rows.map((r) => r.buyer))).sort()],
    [rows],
  )
  const auctions = useMemo(
    () => ['Auction / Lot', ...Array.from(new Set(rows.map((r) => r.auctionLot))).sort()],
    [rows],
  )
  const filtered = useMemo(() => {
    const list = rows.filter(
      (r) =>
        matchesQuery(`${r.lot} ${r.buyer} ${r.id} ${r.auctionLot}`, query) &&
        (status === 'All statuses' || r.status === status) &&
        (buyer === 'Buyer' || r.buyer === buyer) &&
        (auction === 'Auction / Lot' || r.auctionLot === auction),
    )
    if (sort === 'Oldest first') return [...list].reverse()
    return list
  }, [rows, query, status, buyer, auction, sort])
  const liveCount = rows.filter((r) => r.status === 'Live').length
  const wonCount = rows.filter((r) => r.status === 'Won').length
  const lostCount = rows.filter((r) => r.status === 'Outbid').length
  return (
    <AdminListShell
      title="Proxy Placement"
      subtitle="Monitor and manage proxy bids placed automatically on behalf of buyers."
      showExport
      kpis={
        <AdminSummaryGrid cols={4}>
          <AdminKpi label="Active proxy bids" value={liveCount} hint="Currently bidding" hintTone="info" />
          <AdminKpi label="Total proxy bids" value={rows.length} hint="All time" />
          <AdminKpi label="Won proxy bids" value={wonCount} hint="Total bids won" hintTone="success" />
          <AdminKpi label="Lost proxy bid" value={lostCount} hint="Total lost bids" hintTone="danger" />
        </AdminSummaryGrid>
      }
    >
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search by proxy bid ID, buyer, or lot" />
            <AdminFilter value={status} onChange={setStatus} options={['All statuses', 'Pending', 'Live', 'Won', 'Outbid']} />
          </>
        }
        secondaryToolbar={
          <>
            <AdminFilter value={buyer} onChange={setBuyer} options={buyers} />
            <AdminFilter value={auction} onChange={setAuction} options={auctions} />
            <AdminFilter value="Date range" onChange={() => undefined} options={['Date range']} />
            <AdminFilter value={sort} onChange={setSort} options={['Newest first', 'Oldest first']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          pageSize={8}
          grid="0.75fr 1fr 1.6fr 0.7fr 0.7fr 0.65fr 0.7fr 0.85fr 0.85fr 56px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/proxy-placement/${r.id}`)}
          columns={[
            {
              header: 'Proxy bid ID',
              render: (r) => <span className="font-medium text-[#480516]">{r.id}</span>,
            },
            { header: 'Buyer', render: (r) => <span className="text-slate-700">{r.buyer}</span> },
            { header: 'Auction / lot', render: (r) => <span className="text-slate-700">{r.auctionLot}</span> },
            {
              header: 'Current bid',
              render: (r) => <span className="block text-right text-slate-700">{r.current}</span>,
            },
            {
              header: 'Max proxy',
              render: (r) => <span className="block text-right font-medium text-slate-900">{r.maxBid}</span>,
            },
            {
              header: 'Increment',
              render: (r) => <span className="block text-right text-slate-500">{r.increment}</span>,
            },
            { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
            {
              header: 'Created',
              render: (r) => <span className="text-[12.5px] text-slate-500">{r.created}</span>,
            },
            {
              header: 'Ends',
              render: (r) => <span className="text-[12.5px] text-slate-500">{r.ends}</span>,
            },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

function proxyCreatedLabel(created: string) {
  const bare = created.replace(/,.*/, '').trim()
  return bare.startsWith('Created') ? bare : `Created ${bare}`
}

function proxyMoney(value: string) {
  if (!value || /\.\d{2}$/.test(value)) return value
  return `${value}.00`
}

export function AdminProxyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.proxies.find((r) => r.id === id))
  const [modal, setModal] = useState<'refund' | 'status' | null>(null)
  const [nextStatus, setNextStatus] = useState('Live')
  if (!item) return <Missing label="Back to proxy placement" to="/admin/proxy-placement" />

  const live = item.status === 'Live'
  const pending = item.status === 'Pending'
  const won = item.status === 'Won'
  const outbid = item.status === 'Outbid'
  const bidLabel = `${item.buyer} · ${item.auctionLot} · ${proxyCreatedLabel(item.created)}`

  return (
    <AdminDetailShell
      backLabel="Back to proxy placement"
      onBack={() => navigate('/admin/proxy-placement')}
      title={item.id}
      badge={item.status}
      subtitle={bidLabel}
      actions={
        live || pending ? (
          <AdminButton
            onClick={() => {
              setNextStatus(item.status)
              setModal('status')
            }}
          >
            Update status
          </AdminButton>
        ) : outbid ? (
          <AdminButton onClick={() => setModal('refund')}>Initiate Refund</AdminButton>
        ) : undefined
      }
    >
      <TwoCol>
        <AdminCard title="Proxy Bid Summary" className="space-y-3">
          <AdminKv label="Status" badge={item.status} />
          <AdminKv label="Current Highest Bid" value={proxyMoney(item.current)} />
          <AdminKv
            label="Maximum Proxy Amount"
            value={proxyMoney(item.maxBid)}
            tone={outbid ? 'danger' : 'strong'}
          />
          <AdminKv label="Bid Increment" value={proxyMoney(item.increment)} />
          <AdminKv label="Number of Bids Placed" value={item.bidsPlaced ?? '—'} />
          <AdminKv label="Created Date/Time" value={item.createdAt ?? (item.created.includes(',') ? item.created : `${item.created}, 09:00`)} />
          <AdminKv label="Last Bid Date/Time" value={item.lastBid ?? '—'} />
          <AdminKv
            label="Auction End Date/Time"
            value={item.auctionEnd ?? (item.ends.includes('2026') ? item.ends : item.ends.replace(/^(\d+ \w+)/, '$1 2026,'))}
          />
        </AdminCard>

        {live || pending ? (
          <AdminCard className="gap-5">
            <div className="space-y-3">
              <p className="text-[13.5px] font-semibold leading-[normal] text-slate-800">Buyer Information</p>
              <AdminKv label="Name" value={item.buyer} tone="strong" />
              <AdminKv label="Tier" value={item.tier ?? '—'} />
              <AdminKv label="Wallet Available" value={item.walletAvailable ?? '—'} />
              <AdminKv label="Email" value={item.email ?? '—'} />
              <AdminKv label="Phone" value={item.phone ?? '—'} />
            </div>
            <div className="space-y-3">
              <p className="text-[13.5px] font-semibold leading-[normal] text-slate-800">Auction / Lot</p>
              <AdminKv label="Lot" value={item.auctionLot} />
              <AdminKv label="Auction ID" value={item.auctionId ?? '—'} />
              <AdminKv label="Tier Band" value={item.tierBand ?? item.tier ?? '—'} />
            </div>
          </AdminCard>
        ) : (
          <AdminCard title="Buyer & Lot" className="space-y-3">
            <AdminKv label="Buyer" value={item.buyer} tone="strong" />
            <AdminKv label="Tier" value={item.tier ?? '—'} />
            <AdminKv label="Lot" value={item.auctionLot} />
            <AdminKv label="Auction ID" value={item.auctionId ?? '—'} />
            {won && item.orderId ? (
              <AdminKv
                label="Order Created"
                value={<span className="font-medium text-[#480516]">{item.orderId}</span>}
              />
            ) : null}
            {outbid && item.outcome ? <AdminKv label="Outcome" value={item.outcome} /> : null}
          </AdminCard>
        )}
      </TwoCol>

      <HistoryPanel title="Proxy Bid History" items={item.history} />

      {modal === 'refund' ? (
        <ConfirmModal
          title="Initiate Refund"
          body="Refund the locked bid hold to the buyer wallet."
          confirmLabel="Refund"
          onClose={() => setModal(null)}
          onConfirm={() => {
            dispatch(setRecordStatus({ collection: 'proxies', id: item.id, status: 'Refunded' }))
            dispatch(showToast('Refund initiated'))
            setModal(null)
          }}
        />
      ) : null}
      {modal === 'status' ? (
        <AdminModal
          title="Update status"
          subtitle={`Update the status of this bid “${bidLabel}”`}
          maxWidth={400}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={nextStatus === item.status}
                onClick={() => {
                  dispatch(setRecordStatus({ collection: 'proxies', id: item.id, status: nextStatus }))
                  dispatch(showToast('Status updated'))
                  setModal(null)
                }}
              >
                Update status
              </AdminButton>
            </>
          }
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-medium leading-[normal] text-slate-700">Status</span>
            <div className="relative">
              <select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
                className="h-[38px] w-full appearance-none rounded-lg border-[1.5px] border-[#a7878f] bg-white px-3 pr-9 text-[12.5px] font-medium leading-[normal] text-slate-900 outline-none"
              >
                {['Pending', 'Live', 'Won', 'Outbid'].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <Icon src={adminIcons.chevronDown} size={14} />
              </span>
            </div>
          </label>
        </AdminModal>
      ) : null}
    </AdminDetailShell>
  )
}

const WITHDRAWAL_STATUS_ORDER: Record<string, number> = {
  Pending: 0,
  Approved: 1,
  Completed: 2,
  Rejected: 3,
}

const REJECT_REASONS = [
  'Payout details could not be verified',
  'Insufficient available balance',
  'Suspicious activity detected',
  'Buyer requested cancellation',
]

function withdrawalSubtitle(item: AdminWithdrawal) {
  return `${item.buyer} · Requested ${item.requested}`
}

export function AdminWithdrawalsPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.withdrawals)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [sort, setSort] = useState('Pending first')
  const filtered = useMemo(() => {
    const list = rows.filter(
      (r) => matchesQuery(`${r.buyer} ${r.id}`, query) && (status === 'All statuses' || r.status === status),
    )
    if (sort === 'Pending first') {
      return [...list].sort(
        (a, b) =>
          (WITHDRAWAL_STATUS_ORDER[a.status] ?? 9) - (WITHDRAWAL_STATUS_ORDER[b.status] ?? 9) ||
          b.requested.localeCompare(a.requested),
      )
    }
    if (sort === 'Newest first') return [...list].sort((a, b) => b.requested.localeCompare(a.requested))
    if (sort === 'Oldest first') return [...list].sort((a, b) => a.requested.localeCompare(b.requested))
    return list
  }, [rows, query, status, sort])
  return (
    <AdminListShell title="Withdrawals" subtitle="Buyers requesting payout from wallet.">
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch className="flex-1" value={query} onChange={setQuery} placeholder="Search by buyer or withdrawal ID" />
            <AdminFilter value={status} onChange={setStatus} options={['All statuses', 'Pending', 'Approved', 'Completed', 'Rejected']} />
            <AdminFilter value="Date range" onChange={() => undefined} options={['Date range']} />
            <AdminFilter value={sort} onChange={setSort} options={['Pending first', 'Newest first', 'Oldest first']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={filtered}
          grid="1fr 1fr 1fr 1fr 1fr 1fr"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/withdrawals/${r.id}`)}
          columns={[
            { header: 'Buyer', render: (r) => <span className="font-medium text-slate-800">{r.buyer}</span> },
            { header: 'Withdrawal ID', render: (r) => <span className="font-normal text-[#480516]">{r.id}</span> },
            { header: 'Amount', render: (r) => <span className="font-medium text-slate-900">{r.amount}</span> },
            { header: 'Requested', render: (r) => <span className="text-[12.5px] text-slate-500">{r.requested}</span> },
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
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0])
  const [rejectDetail, setRejectDetail] = useState('')
  if (!item) return <Missing label="Back to withdrawals" to="/admin/withdrawals" />

  const pending = item.status === 'Pending'
  const approved = item.status === 'Approved'
  const completed = item.status === 'Completed'
  const rejected = item.status === 'Rejected'
  const buyerProfile = item.buyerId ? `/admin/buyers/${item.buyerId}` : '/admin/buyers'

  return (
    <AdminDetailShell
      backLabel="Back to withdrawals"
      onBack={() => navigate('/admin/withdrawals')}
      title={item.id}
      badge={item.status}
      subtitle={withdrawalSubtitle(item)}
      actions={
        pending ? (
          <>
            <AdminButton
              variant="dangerOutline"
              onClick={() => {
                setRejectReason(REJECT_REASONS[0])
                setRejectDetail('')
                setModal('reject')
              }}
            >
              Reject
            </AdminButton>
            <AdminButton onClick={() => setModal('approve')}>Approve Withdrawal</AdminButton>
          </>
        ) : completed || approved ? (
          <AdminButton variant="maroonOutline" onClick={() => navigate(buyerProfile)}>
            View Buyer Profile
          </AdminButton>
        ) : undefined
      }
    >
      {rejected ? (
        <Banner tone="danger">This withdrawal was rejected. The funds remain in the buyer&apos;s wallet.</Banner>
      ) : null}
      {completed ? (
        <Banner tone="success">Withdrawal completed. Funds have been paid out to the buyer.</Banner>
      ) : null}
      {approved ? (
        <Banner tone="info" compact>
          Withdrawal approved — payout is with the banking partner and has not yet completed.
        </Banner>
      ) : null}

      {pending ? (
        <>
          <TwoCol>
            <AdminCard title="Buyer Information">
              <AdminKv label="Name" value={item.buyer} tone="strong" />
              <AdminKv label="Tier" value={item.tier ?? '—'} />
              <AdminKv label="Account Type" value={item.accountType ?? '—'} />
              <AdminKv label="Email" value={item.email ?? '—'} />
              <AdminKv label="Phone" value={item.phone ?? '—'} />
            </AdminCard>
            <AdminCard title="Withdrawal Summary">
              <AdminKv label="Withdrawal ID" value={item.id} tone="strong" />
              <AdminKv label="Status" badge={item.status} />
              <AdminKv label="Requested Amount" value={cents(item.amount)} tone="strong" />
              <AdminKv label="Request Date/Time" value={item.requested} />
            </AdminCard>
          </TwoCol>
          <TwoCol>
            <AdminCard title="Buyer Wallet Information">
              <AdminKv label="Available Balance" value={item.availableBalance ?? '—'} />
              <AdminKv label="Held Balance" value={item.heldBalance ?? '—'} />
              <AdminKv label="Balance After Withdrawal" value={item.balanceAfter ?? '—'} tone="strong" />
            </AdminCard>
            <AdminCard title="Payout Details">
              <AdminKv label="Payout Method" value={item.method} />
              <AdminKv label="Destination" value={item.destination} />
              <AdminKv
                label="Related Transaction"
                value={<span className="font-medium text-[#480516]">{item.id}</span>}
              />
            </AdminCard>
          </TwoCol>
        </>
      ) : rejected ? (
        <TwoCol>
          <AdminCard title="Withdrawal Summary">
            <AdminKv label="Withdrawal ID" value={item.id} tone="strong" />
            <AdminKv label="Status" badge={item.status} />
            <AdminKv label="Requested Amount" value={cents(item.amount)} />
            <AdminKv label="Rejection Reason" value={item.rejectionReason ?? '—'} tone="danger" />
            <AdminKv label="Rejected Date/Time" value={item.rejectedAt ?? '—'} />
            <AdminKv label="Reviewed By" value={item.reviewedBy ?? '—'} />
          </AdminCard>
          <AdminCard title="Wallet & Payout">
            <AdminKv label="Available Balance" value={item.availableBalance ?? '—'} />
            <AdminKv label="Held Balance" value={item.heldBalance ?? '—'} />
            <AdminKv label="Payout Method" value={item.method} />
            <AdminKv label="Destination" value={item.destination} />
            <AdminKv
              label="Related Transaction"
              value={<span className="font-medium text-[#480516]">{item.id}</span>}
            />
          </AdminCard>
        </TwoCol>
      ) : (
        <TwoCol>
          <AdminCard title="Withdrawal Summary">
            <AdminKv label="Withdrawal ID" value={item.id} tone="strong" />
            <AdminKv label="Status" badge={item.status} />
            <AdminKv label="Requested Amount" value={cents(item.amount)} tone="strong" />
            {approved ? <AdminKv label="Approved Date/Time" value={item.approvedAt ?? '—'} /> : null}
            {completed ? (
              <>
                <AdminKv label="Approved Date/Time" value={item.approvedAt ?? '—'} />
                <AdminKv label="Payout Date/Time" value={item.payoutAt ?? '—'} />
              </>
            ) : null}
            <AdminKv label="Reviewed By" value={item.reviewedBy ?? '—'} />
          </AdminCard>
          <AdminCard title="Wallet & Payout">
            <AdminKv label="Available Balance" value={item.availableBalance ?? '—'} />
            <AdminKv label="Held Balance" value={item.heldBalance ?? '—'} />
            <AdminKv label="Payout Method" value={item.method} />
            <AdminKv label="Destination" value={item.destination} />
            <AdminKv
              label="Related Transaction"
              value={<span className="font-medium text-[#480516]">{item.id}</span>}
            />
          </AdminCard>
        </TwoCol>
      )}

      <HistoryPanel title="Withdrawal History" items={item.history} />

      {modal === 'approve' ? (
        <AdminModal
          title="Approve Withdrawal"
          subtitle="This releases the requested amount to the buyer's payout method. This action is recorded in the audit trail."
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
                  dispatch(
                    setRecordStatus({
                      collection: 'withdrawals',
                      id: item.id,
                      status: 'Completed',
                      extra: {
                        reviewedBy: 'Ops Admin',
                        approvedAt: new Date().toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                        payoutAt: new Date().toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      },
                    }),
                  )
                  dispatch(showToast('Withdrawal approved'))
                  setModal(null)
                }}
              >
                Approve Withdrawal
              </AdminButton>
            </>
          }
        >
          <DetailBox
            rows={[
              { label: 'Buyer', value: item.buyer },
              { label: 'Withdrawal ID', value: item.id },
              { label: 'Withdrawal Amount', value: cents(item.amount) },
              { label: 'Payout Method', value: `${item.method} · ${item.destination}` },
            ]}
          />
        </AdminModal>
      ) : null}

      {modal === 'reject' ? (
        <AdminModal
          title="Reject Withdrawal"
          subtitle="The buyer will be notified and the funds will remain in their wallet. This cannot be undone."
          showClose={false}
          icon={
            <ModalIcon tone="danger">
              <span className="text-[16px] font-semibold text-red-600">!</span>
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
                  dispatch(
                    setRecordStatus({
                      collection: 'withdrawals',
                      id: item.id,
                      status: 'Rejected',
                      extra: {
                        rejectionReason: rejectReason,
                        reviewedBy: 'Ops Admin',
                        rejectedAt: new Date().toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      },
                    }),
                  )
                  dispatch(showToast('Withdrawal rejected'))
                  setModal(null)
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
                { label: 'Buyer', value: item.buyer },
                { label: 'Withdrawal ID', value: item.id },
                { label: 'Withdrawal Amount', value: cents(item.amount) },
              ]}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium leading-[normal] text-slate-600">
                Reason for rejection (required)
              </span>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="h-[34px] w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] leading-[normal] text-slate-700 outline-none"
              >
                {REJECT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <textarea
                value={rejectDetail}
                onChange={(e) => setRejectDetail(e.target.value)}
                placeholder="Add details for the buyer and audit trail"
                className="min-h-[52px] w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[12.5px] leading-[normal] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        </AdminModal>
      ) : null}
    </AdminDetailShell>
  )
}

export function AdminTplPage() {
  return <TplList />
}

export function AdminTplDetailPage() {
  return <TplDetail />
}

export function AdminSupportQueuePage() {
  return <SupportQueue />
}

export function AdminTicketDetailPage() {
  const { id } = useParams()
  const item = useAppSelector((s) => s.admin.tickets.find((r) => r.id === id))
  if (!item) return <Missing label="Back to support" to="/admin/support" />
  return <TicketDetail key={item.id} item={item} />
}
