import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AdminBack,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKv,
  AdminModal,
  AdminPageHead,
  statusKind,
} from '@/components/admin/ui'
import { AdminDataTable, AdminSummaryGrid, AdminTablePanel } from '@/components/admin/screens'
import { useAppDispatch } from '@/store/hooks'
import { setRecordStatus } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminSettlement } from '@/types/admin'
import { cn } from '@/utils/format'

function cents(value: string) {
  if (!value.startsWith('$')) return value
  return /\.\d{2}/.test(value) ? value : `${value}.00`
}

function IconBubble({ tone, children }: { tone: 'success' | 'danger' | 'neutral'; children: string }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-600',
    danger: 'bg-red-50 text-red-600',
    neutral: 'bg-slate-100 text-slate-500',
  }
  return (
    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-[16px]', styles[tone])}>
      {children}
    </span>
  )
}

function KvList({ rows }: { rows: { label: string; value: string; tone?: 'strong' | 'emphasis' | 'danger' | 'muted'; badge?: string }[] }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <AdminKv key={row.label} label={row.label} value={row.value} tone={row.tone} badge={row.badge} />
      ))}
    </div>
  )
}

function Activity({ items }: { items: { title: string; at: string; body: string; status: string }[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, index) => {
        const kind = statusKind(item.status)
        const dot =
          item.status === 'Processing'
            ? 'bg-slate-900'
            : kind === 'success'
              ? 'bg-emerald-500'
              : kind === 'warning'
                ? 'bg-amber-500'
                : kind === 'danger'
                  ? 'bg-red-500'
                  : 'bg-slate-900'
        return (
          <li key={`${item.title}-${item.at}`} className="flex gap-3">
            <span className="flex w-2.5 shrink-0 flex-col items-center">
              <span className={cn('mt-1 size-2.5 rounded-full', dot)} />
              {index < items.length - 1 ? <span className="mt-1 w-px flex-1 bg-slate-200" /> : null}
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-medium text-slate-800">{item.title}</p>
                <AdminBadge status={item.status} />
              </div>
              <p className="mt-0.5 text-[12px] text-slate-400">{item.at}</p>
              {item.body ? <p className="mt-0.5 text-[12.5px] text-slate-500">{item.body}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function bannerClass(tone: 'amber' | 'blue' | 'green' | 'red') {
  if (tone === 'amber') return 'border-amber-100 bg-amber-50 text-amber-800'
  if (tone === 'blue') return 'border-blue-100 bg-blue-50 text-blue-700'
  if (tone === 'green') return 'border-emerald-100 bg-emerald-50 text-emerald-700'
  return 'border-red-100 bg-red-50 text-red-700'
}

type ModalKind = 'approve' | 'reject' | 'retry' | 'adjust' | null

export function SettlementDetail({ item }: { item: AdminSettlement }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [modal, setModal] = useState<ModalKind>(null)
  const net = cents(item.netAmount)
  const amount = cents(item.amount)
  const fees = cents(item.fees)
  const lot = item.detailLot || item.lot
  const seller = item.seller || 'BidBridge Africa'
  const payment = item.paymentStatus || (item.status === 'Failed' ? 'Failed' : 'Confirmed')

  const setStatus = (status: string, extra?: Record<string, string>, toast?: string) => {
    dispatch(setRecordStatus({ collection: 'settlements', id: item.id, status, extra }))
    dispatch(showToast(toast ?? `Settlement marked ${status}`))
    setModal(null)
  }

  const subtitle =
    item.status === 'On Hold'
      ? `${item.buyer} · ${lot} · Placed on hold ${item.holdAt?.split(',')[0] ?? item.date}`
      : item.status === 'Processing'
        ? `${item.buyer} · ${lot} · Approved ${item.date}`
        : item.status === 'Completed'
          ? `${item.buyer} · ${lot} · Completed ${item.completionDate?.split(',')[0] ?? item.date}`
          : item.status === 'Failed'
            ? `${item.buyer} · ${lot} · Failed ${item.failedAt?.split(',')[0] ?? item.date}`
            : `${item.buyer} · ${lot} · Created ${item.createdAt?.split(',')[0] ?? item.date}`

  const activity = item.history?.length
    ? item.history.map((h) => ({ title: h.title, at: h.at, body: h.detail ?? '', status: h.status }))
    : activityFor(item)

  return (
    <div className="flex w-full max-w-full flex-col gap-4 animate-fade-in sm:gap-5">
      <AdminBack label="Back to settlements" onClick={() => navigate('/admin/settlements')} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-slate-900">{item.id}</h1>
            <AdminBadge status={item.status} />
          </div>
          <p className="mt-1 text-[13.5px] text-slate-500">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.status === 'Pending' ? (
            <>
              <AdminButton variant="warningOutline" onClick={() => setStatus('On Hold', { holdAt: new Date().toLocaleString('en-GB'), holdReason: 'Manual hold by admin' }, 'Settlement placed on hold')}>
                Put on Hold
              </AdminButton>
              <AdminButton variant="dangerOutline" onClick={() => setModal('reject')}>
                Reject
              </AdminButton>
              <AdminButton onClick={() => setModal('approve')}>Approve Settlement</AdminButton>
            </>
          ) : null}
          {item.status === 'On Hold' ? (
            <>
              <AdminButton variant="dangerOutline" onClick={() => setModal('reject')}>
                Reject
              </AdminButton>
              <AdminButton onClick={() => setStatus('Pending', undefined, 'Settlement resumed')}>Resume Processing</AdminButton>
            </>
          ) : null}
          {item.status === 'Completed' ? (
            <>
              <AdminButton variant="outline" onClick={() => dispatch(showToast('Receipt download started'))}>
                Download Receipt
              </AdminButton>
              <AdminButton onClick={() => navigate(`/admin/orders/${item.orderRef}`)}>
                View Order
              </AdminButton>
            </>
          ) : null}
          {item.status === 'Failed' ? <AdminButton onClick={() => setModal('retry')}>Retry Settlement</AdminButton> : null}
        </div>
      </div>

      {item.status === 'On Hold' ? (
        <p className={cn('max-w-[640px] rounded-lg border px-3.5 py-2.5 text-[13px] leading-5', bannerClass('amber'))}>
          This settlement is on hold and will not proceed until an admin resumes processing.
        </p>
      ) : null}
      {item.status === 'Processing' ? (
        <p className={cn('rounded-lg border px-3.5 py-2.5 text-[13px] leading-5', bannerClass('blue'))}>
          Approved and initiated — payout is with the banking partner and has not yet completed. Typically 1–2 business days.
        </p>
      ) : null}
      {item.status === 'Completed' ? (
        <p className={cn('rounded-lg border px-3.5 py-2.5 text-[13px] leading-5', bannerClass('green'))}>
          Settlement completed and funds delivered to the buyer&apos;s payout method.
        </p>
      ) : null}
      {item.status === 'Failed' ? (
        <p className={cn('rounded-lg border px-3.5 py-2.5 text-[13px] leading-5', bannerClass('red'))}>
          {`Settlement failed: Bank transfer rejected — ${(item.failureReason || 'invalid recipient account details')
            .replace(/\.$/, '')
            .replace(/^./, (c) => c.toLowerCase())}.`}
        </p>
      ) : null}
      {item.status === 'Rejected' ? (
        <p className={cn('rounded-lg border px-3.5 py-2.5 text-[13px] leading-5', bannerClass('red'))}>
          Settlement rejected: {item.failureReason || 'This settlement will not be paid out.'}
        </p>
      ) : null}
      {item.status === 'Cancelled' ? (
        <p className="max-w-[640px] rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px] leading-5 text-slate-600">
          This settlement was cancelled and will not be paid out.
        </p>
      ) : null}

      {item.status === 'On Hold' ? (
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          <AdminCard title="Hold Details">
            <KvList
              rows={[
                { label: 'Status', value: '', badge: item.status },
                { label: 'Settlement Amount', value: amount, tone: 'strong' },
                { label: 'Reason for Hold', value: item.holdReason || 'Buyer disputed delivery condition' },
                { label: 'Date Placed on Hold', value: item.holdAt || item.date },
                { label: 'Related Transaction', value: item.orderRef, tone: 'strong' },
                { label: 'Notes', value: item.holdNotes || item.notes[0]?.body || 'Awaiting resolution from support' },
              ]}
            />
          </AdminCard>
          <AdminCard title="Transaction Information">
            <KvList
              rows={[
                { label: 'Order / Transaction ID', value: item.orderRef, tone: 'strong' },
                { label: 'Auction / Lot', value: lot },
                { label: 'Buyer', value: item.buyer },
                { label: 'Seller', value: seller },
                { label: 'Fees', value: fees },
                { label: 'Net Amount', value: net, tone: 'emphasis' },
              ]}
            />
          </AdminCard>
        </div>
      ) : item.status === 'Processing' || item.status === 'Completed' || item.status === 'Failed' ? (
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          <AdminCard title="Settlement Summary">
            <KvList rows={summaryRows(item, amount, fees, net)} />
          </AdminCard>
          <AdminCard title="Transaction Information">
            <KvList rows={transactionRows(item, lot, seller, amount, fees, net, payment)} />
          </AdminCard>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          <AdminCard title="Settlement Summary">
            <KvList
              rows={[
                { label: 'Settlement ID', value: item.id, tone: 'strong' },
                { label: 'Status', value: '', badge: item.status },
                { label: 'Settlement Amount', value: amount, tone: 'strong' },
                { label: 'Fees', value: fees },
                { label: 'Net Settlement Amount', value: net, tone: 'emphasis' },
                { label: 'Created Date', value: item.createdAt || item.date },
                { label: 'Settlement Date', value: item.settlementDate || 'Pending', tone: item.settlementDate ? 'strong' : 'muted' },
                { label: 'Last Updated', value: item.lastUpdated || item.createdAt || item.date },
              ]}
            />
          </AdminCard>
          <AdminCard title="Transaction Information">
            <KvList
              rows={[
                { label: 'Order / Transaction ID', value: item.orderRef, tone: 'strong' },
                { label: 'Auction / Lot', value: lot },
                { label: 'Buyer', value: item.buyer },
                { label: 'Seller', value: seller },
                { label: 'Transaction Amount', value: amount, tone: 'strong' },
                { label: 'Payment Status', value: '', badge: payment },
              ]}
            />
          </AdminCard>
          <AdminCard title="Financial Breakdown">
            <KvList
              rows={[
                { label: 'Gross Amount', value: cents(item.grossAmount || item.amount) },
                { label: `− ${item.platformFeeLabel || 'Platform Fee (2.5%)'}`, value: cents(item.platformFee || item.fees) },
                { label: '− Applicable Charges', value: cents(item.charges || '$0') },
              ]}
            />
            <div className="mt-4 border-t border-slate-200 pt-3">
              <AdminKv label="Net Settlement Amount" value={net} tone="emphasis" />
            </div>
            <button
              type="button"
              onClick={() => setModal('adjust')}
              className="mt-3 text-[13px] font-medium text-[#480516] hover:underline"
            >
              Adjust amount
            </button>
          </AdminCard>
          <AdminCard title="Settlement Activity">
            <Activity items={activity} />
          </AdminCard>
        </div>
      )}

      {item.status === 'Pending' ? null : (
        <AdminCard title="Settlement Activity">
          <Activity items={activity} />
        </AdminCard>
      )}

      {modal === 'approve' ? (
        <AdminModal
          title="Approve Settlement"
          subtitle="This releases the net amount to the buyer's linked payout method. This action is recorded in the audit trail."
          icon={<IconBubble tone="success">✓</IconBubble>}
          showClose={false}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>Cancel</AdminButton>
              <AdminButton onClick={() => setStatus('Processing', undefined, 'Settlement approved')}>Approve Settlement</AdminButton>
            </>
          }
        >
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <KvList
              rows={[
                { label: 'Settlement ID', value: item.id, tone: 'strong' },
                { label: 'Amount', value: `${net} (net)`, tone: 'strong' },
                { label: 'Related Transaction', value: item.orderRef, tone: 'strong' },
                { label: 'Recipient', value: item.buyer },
              ]}
            />
          </div>
        </AdminModal>
      ) : null}
      {modal === 'reject' ? <RejectModal item={item} net={net} onClose={() => setModal(null)} onConfirm={(note) => setStatus('Rejected', { failureReason: note }, 'Settlement rejected')} /> : null}
      {modal === 'retry' ? (
        <AdminModal
          title="Retry Settlement"
          subtitle="A new payout attempt will be made using the buyer's updated account details. This is recorded in the audit trail."
          icon={<IconBubble tone="neutral">↻</IconBubble>}
          showClose={false}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>Cancel</AdminButton>
              <AdminButton onClick={() => setStatus('Processing', undefined, 'Settlement retry started')}>Retry Settlement</AdminButton>
            </>
          }
        >
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <KvList
              rows={[
                { label: 'Settlement Amount', value: `${net} (net)`, tone: 'strong' },
                { label: 'Previous Failure Reason', value: item.failureReason || 'Invalid account details', tone: 'danger' },
                { label: 'Transaction', value: item.relatedOrder || item.orderRef, tone: 'strong' },
                { label: 'Recipient', value: item.buyer },
                { label: 'Previous Attempt', value: item.failedAt ? `${item.failedAt} (1 of 1)` : item.previousAttempts || item.date },
              ]}
            />
          </div>
          <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[12.5px] leading-5 text-amber-800">
            Only one retry can be in progress at a time to prevent duplicate payouts.
          </p>
        </AdminModal>
      ) : null}
      {modal === 'adjust' ? <AdjustModal item={item} net={net} onClose={() => setModal(null)} onConfirm={(next, reason) => setStatus(item.status, { netAmount: next, remaining: next, holdNotes: reason }, 'Settlement adjusted')} /> : null}
    </div>
  )
}

function summaryRows(item: AdminSettlement, amount: string, fees: string, net: string) {
  if (item.status === 'Completed') {
    return [
      { label: 'Status', value: '', badge: item.status },
      { label: 'Final Settlement Amount', value: amount, tone: 'strong' as const },
      { label: 'Net Amount', value: net, tone: 'emphasis' as const },
      { label: 'Settlement Reference', value: item.id, tone: 'strong' as const },
      { label: 'Completion Date', value: item.completionDate || item.date },
    ]
  }
  if (item.status === 'Failed') {
    return [
      { label: 'Status', value: '', badge: item.status },
      { label: 'Settlement Amount', value: amount, tone: 'strong' as const },
      { label: 'Failure Reason', value: item.failureReason || 'Invalid recipient account details', tone: 'danger' as const },
      { label: 'Date / Time', value: item.failedAt || item.date },
      { label: 'Previous Attempts', value: item.previousAttempts || item.attempts || '1 attempt (failed)' },
    ]
  }
  return [
    { label: 'Status', value: '', badge: item.status },
    { label: 'Settlement Amount', value: amount, tone: 'strong' as const },
    { label: 'Fees', value: fees },
    { label: 'Net Settlement Amount', value: net, tone: 'emphasis' as const },
    { label: 'Settlement Reference', value: item.id, tone: 'strong' as const },
    { label: 'Processing Date', value: item.processingDate || item.date },
    { label: 'Current Stage', value: item.currentStage || item.stage || 'Bank transfer initiated' },
  ]
}

function transactionRows(item: AdminSettlement, lot: string, seller: string, amount: string, fees: string, net: string, payment: string) {
  if (item.status === 'Completed') {
    return [
      { label: 'Transaction Reference', value: item.orderRef, tone: 'strong' as const },
      { label: 'Related Order', value: item.relatedOrder || item.orderRef, tone: 'strong' as const },
      { label: 'Related Auction / Lot', value: lot },
      { label: 'Buyer', value: item.buyer },
      { label: 'Fees', value: fees },
    ]
  }
  if (item.status === 'Failed') {
    return [
      { label: 'Transaction Reference', value: item.orderRef, tone: 'strong' as const },
      { label: 'Related Order', value: item.relatedOrder || item.orderRef, tone: 'strong' as const },
      { label: 'Auction / Lot', value: lot },
      { label: 'Buyer', value: item.buyer },
      { label: 'Net Amount (attempted)', value: net, tone: 'emphasis' as const },
    ]
  }
  return [
    { label: 'Transaction Reference', value: item.orderRef, tone: 'strong' as const },
    { label: 'Auction / Lot', value: lot },
    { label: 'Buyer', value: item.buyer },
    { label: 'Seller', value: seller },
    { label: 'Transaction Amount', value: amount, tone: 'strong' as const },
    { label: 'Payment Status', value: '', badge: payment },
  ]
}

function activityFor(item: AdminSettlement) {
  const designed = DESIGN_ACTIVITY[item.id]
  if (designed && designed.status === item.status) return designed.items
  if (item.history.length) {
    return item.history.map((entry) => ({
      title: entry.title,
      at: entry.at,
      body: entry.detail || '',
      status: entry.status,
    }))
  }
  return [{ title: item.status, at: item.date, body: '', status: item.status }]
}

const DESIGN_ACTIVITY: Record<string, { status: string; items: { title: string; at: string; body: string; status: string }[] }> = {
  'STL-8822': {
    status: 'Pending',
    items: [
      { title: 'Settlement Created', at: '14 Aug 2026 · 09:12', body: 'Settlement record generated after auction win', status: 'Completed' },
      { title: 'Payment Confirmed', at: '14 Aug 2026 · 09:15', body: 'Buyer payment verified via wallet hold', status: 'Completed' },
      { title: 'Settlement Pending', at: '14 Aug 2026 · 09:15', body: 'Awaiting admin review and approval', status: 'Pending' },
    ],
  },
  'STL-5510': {
    status: 'On Hold',
    items: [
      { title: 'Settlement Created', at: '2 Aug 2026 · 11:30', body: 'Settlement record generated after order delivery', status: 'Completed' },
      { title: 'Payment Confirmed', at: '2 Aug 2026 · 11:32', body: 'Buyer payment verified', status: 'Completed' },
      { title: 'Settlement Pending', at: '2 Aug 2026 · 11:32', body: 'Awaited admin review', status: 'Completed' },
      { title: 'Settlement On Hold', at: '3 Aug 2026 · 11:40', body: 'Buyer disputed delivery condition — paused pending support resolution', status: 'On Hold' },
    ],
  },
  'STL-7733': {
    status: 'Processing',
    items: [
      { title: 'Settlement Created', at: '12 Aug 2026 · 09:40', body: 'Settlement record generated after order completion', status: 'Completed' },
      { title: 'Payment Confirmed', at: '12 Aug 2026 · 09:42', body: 'Buyer payment verified', status: 'Completed' },
      { title: 'Settlement Approved', at: '12 Aug 2026 · 10:05', body: 'Approved by Ops Admin', status: 'Completed' },
      { title: 'Settlement Processing', at: '12 Aug 2026 · 10:05', body: 'Bank transfer initiated, awaiting confirmation', status: 'Processing' },
    ],
  },
  'STL-8821': {
    status: 'Completed',
    items: [
      { title: 'Settlement Created', at: '12 Aug 2026 · 14:10', body: 'Settlement record generated after order completion', status: 'Completed' },
      { title: 'Payment Confirmed', at: '12 Aug 2026 · 14:12', body: 'Buyer payment verified', status: 'Completed' },
      { title: 'Settlement Approved', at: '12 Aug 2026 · 14:30', body: 'Approved by Ops Admin', status: 'Completed' },
      { title: 'Settlement Processing', at: '12 Aug 2026 · 14:31', body: 'Bank transfer initiated', status: 'Completed' },
      { title: 'Settlement Completed', at: '12 Aug 2026 · 15:20', body: "Funds delivered to buyer's payout method", status: 'Completed' },
    ],
  },
  'STL-4499': {
    status: 'Failed',
    items: [
      { title: 'Settlement Created', at: '14 Aug 2026 · 09:02', body: 'Settlement record generated after order completion', status: 'Completed' },
      { title: 'Payment Confirmed', at: '14 Aug 2026 · 09:05', body: 'Buyer payment verified', status: 'Completed' },
      { title: 'Settlement Approved', at: '14 Aug 2026 · 16:40', body: 'Approved by Ops Admin', status: 'Completed' },
      { title: 'Settlement Processing', at: '14 Aug 2026 · 16:41', body: 'Bank transfer initiated', status: 'Completed' },
      { title: 'Settlement Failed', at: '14 Aug 2026 · 16:44', body: 'Bank rejected transfer — invalid recipient account details', status: 'Failed' },
    ],
  },
}

function RejectModal({
  item,
  net,
  onClose,
  onConfirm,
}: {
  item: AdminSettlement
  net: string
  onClose: () => void
  onConfirm: (note: string) => void
}) {
  const [reason, setReason] = useState('Payment discrepancy detected')
  const [details, setDetails] = useState('')
  return (
    <AdminModal
      title="Reject Settlement"
      subtitle="The buyer will be notified and the settlement will be marked Rejected. This cannot be undone."
      icon={<IconBubble tone="danger">!</IconBubble>}
      showClose={false}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant="danger" disabled={!details.trim()} onClick={() => onConfirm(`${reason}. ${details.trim()}`)}>
            Confirm Rejection
          </AdminButton>
        </>
      }
    >
      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <KvList
          rows={[
            { label: 'Settlement ID', value: item.id, tone: 'strong' },
            { label: 'Amount', value: `${net} (net)`, tone: 'strong' },
            { label: 'Related Transaction', value: item.orderRef, tone: 'strong' },
          ]}
        />
      </div>
      <label className="mt-4 block text-[13px] text-slate-700">
        Reason for rejection
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-[13.5px] text-slate-800 outline-none">
          <option>Payment discrepancy detected</option>
          <option>Invalid recipient account</option>
          <option>Buyer defaulted</option>
          <option>Duplicate settlement</option>
        </select>
      </label>
      <label className="mt-3 block text-[13px] text-slate-700">
        <span className="sr-only">Details</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Add details for the audit trail (required)"
          className="mt-1.5 min-h-16 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13.5px] outline-none placeholder:text-slate-400"
        />
      </label>
    </AdminModal>
  )
}

function AdjustModal({
  item,
  net,
  onClose,
  onConfirm,
}: {
  item: AdminSettlement
  net: string
  onClose: () => void
  onConfirm: (next: string, reason: string) => void
}) {
  const [delta, setDelta] = useState('+ 60.00')
  const [reason, setReason] = useState('')
  const base = Number(net.replace(/[^0-9.-]/g, '')) || 0
  const change = Number(delta.replace(/[^0-9.-]/g, '')) || 0
  const signed = delta.trim().startsWith('-') ? -Math.abs(change) : Math.abs(change)
  const next = base + signed
  const nextLabel = `$${next.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const deltaLabel = `${signed >= 0 ? '+' : '−'}$${Math.abs(signed).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return (
    <AdminModal
      title="Adjust Settlement"
      subtitle="Correct the settlement amount before it is approved. The change is recorded in the activity history."
      showClose={false}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton disabled={!reason.trim()} onClick={() => onConfirm(nextLabel, reason.trim())}>Confirm Adjustment</AdminButton>
        </>
      }
    >
      <div className="grid grid-cols-1 items-end gap-3 rounded-xl bg-slate-50 px-3 py-3 text-center sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-2">
        <div>
          <p className="text-[11px] text-slate-500">Original Amount</p>
          <p className="text-[16px] font-semibold text-slate-900">{net}</p>
        </div>
        <span className="hidden pb-1 text-slate-400 sm:inline">→</span>
        <div>
          <p className="text-[11px] text-slate-500">Adjustment</p>
          <p className={cn('text-[16px] font-semibold', signed >= 0 ? 'text-emerald-600' : 'text-red-600')}>{deltaLabel}</p>
        </div>
        <span className="hidden pb-1 text-slate-400 sm:inline">=</span>
        <div>
          <p className="text-[11px] text-slate-500">New Amount</p>
          <p className="text-[16px] font-semibold text-[#480516]">{nextLabel}</p>
        </div>
      </div>
      <label className="mt-4 block text-[13px] text-slate-700">
        Adjustment amount
        <input value={delta} onChange={(e) => setDelta(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-[13.5px] outline-none" />
      </label>
      <label className="mt-3 block text-[13px] text-slate-700">
        Reason for adjustment (required)
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Freight cost correction — buyer overcharged on original invoice"
          className="mt-1.5 min-h-16 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13.5px] outline-none placeholder:text-slate-400"
        />
      </label>
      <span className="sr-only">{item.id}</span>
    </AdminModal>
  )
}

const RECON_ROWS = [
  { id: 'STL-8821', expected: '$1,640.00', actual: '$1,640.00', fees: '$41.00', net: '$1,599.00', difference: '$0.00', status: 'Matched', action: '' },
  { id: 'STL-7733', expected: '$1,840.00', actual: '$1,840.00', fees: '$46.00', net: '$1,794.00', difference: '$0.00', status: 'Matched', action: '' },
  { id: 'STL-6602', expected: '$990.00', actual: '$965.00', fees: '$25.00', net: '$965.00', difference: '-$25.00', status: 'Mismatch', action: 'Resolve' },
  { id: 'STL-5510', expected: '$1,220.00', actual: '$1,220.00', fees: '$31.00', net: '$1,189.00', difference: '$0.00', status: 'Matched', action: '' },
  { id: 'STL-4499', expected: '$2,100.00', actual: '$0.00', fees: '$53.00', net: '$0.00', difference: '-$2,100.00', status: 'Requires Review', action: 'Review' },
  { id: 'STL-2201', expected: '$1,220.00', actual: '$1,195.00', fees: '$31.00', net: '$1,189.00', difference: '-$25.00', status: 'Mismatch', action: 'Resolve' },
]

export function SettlementReconciliation() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('All statuses')
  const rows = useMemo(
    () => RECON_ROWS.filter((row) => status === 'All statuses' || row.status === status),
    [status],
  )
  const matched = RECON_ROWS.filter((row) => row.status === 'Matched').length
  const mismatch = RECON_ROWS.filter((row) => row.status === 'Mismatch').length
  const review = RECON_ROWS.filter((row) => row.status === 'Requires Review').length
  return (
    <div className="flex w-full flex-col gap-4 animate-fade-in sm:gap-5">
      <AdminPageHead title="Settlement Reconciliation" subtitle="Verify settlement payouts against expected amounts and resolve mismatches." />
      <AdminSummaryGrid cols={3}>
        <ReconKpi label="Matched" value={matched} badge="Matched" />
        <ReconKpi label="Mismatch" value={mismatch} badge="Mismatch" />
        <ReconKpi label="Requires Review" value={review} badge="Requires Review" />
      </AdminSummaryGrid>
      <AdminTablePanel
        toolbar={
          <>
            <p className="text-[13px] text-slate-700">Batch: 12 Aug – 16 Aug 2026</p>
            <span className="flex-1" />
            <AdminFilter value={status} onChange={setStatus} options={['All statuses', 'Matched', 'Mismatch', 'Requires Review']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          rows={rows}
          pageSize={8}
          grid="1fr 1fr 1fr 0.8fr 1fr 1fr 1.1fr 80px"
          onRow={(row) => navigate(`/admin/settlements/${row.id}`)}
          actionLabel=""
          columns={[
            { header: 'Settlement ID', render: (row) => <span className="font-medium text-[#480516]">{row.id}</span> },
            { header: 'Expected', render: (row) => row.expected },
            { header: 'Actual', render: (row) => row.actual },
            { header: 'Fees', render: (row) => row.fees },
            { header: 'Net amount', render: (row) => <span className="font-semibold">{row.net}</span> },
            {
              header: 'Difference',
              render: (row) => (
                <span
                  className={
                    row.difference.startsWith('-')
                      ? 'font-medium text-red-600'
                      : row.difference === '$0.00'
                        ? 'text-slate-400'
                        : undefined
                  }
                >
                  {row.difference}
                </span>
              ),
            },
            { header: 'Recon. status', render: (row) => <AdminBadge status={row.status} /> },
            {
              header: '',
              render: (row) =>
                row.action ? <span className="font-medium text-[#480516]">{row.action}</span> : <span />,
            },
          ]}
        />
      </AdminTablePanel>
    </div>
  )
}

function ReconKpi({ label, value, badge }: { label: string; value: number; badge: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <AdminBadge status={badge} />
      </div>
      <p className="mt-2 text-[28px] font-semibold leading-none text-slate-900">{value}</p>
    </div>
  )
}

export function ExportSettlementsModal({
  count,
  onClose,
}: {
  count: number
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const [format, setFormat] = useState<'CSV' | 'PDF'>('CSV')
  return (
    <AdminModal
      title="Export settlements"
      subtitle={`Exports the ${count} records currently in view, including any active filters.`}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Cancel</AdminButton>
          <AdminButton
            onClick={() => {
              dispatch(showToast(`${format} export started for ${count} records`))
              onClose()
            }}
          >
            Export {count} records
          </AdminButton>
        </>
      }
    >
      <p className="mb-2 text-[13px] text-slate-700">File format</p>
      {([
        ['CSV', 'Best for spreadsheets and accounting tools'],
        ['PDF', 'Formatted summary for record-keeping'],
      ] as const).map(([id, hint]) => (
        <label
          key={id}
          className={cn(
            'mb-2 flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3',
            format === id ? 'border-[#480516] bg-[#f9f5f6]' : 'border-slate-200 bg-white',
          )}
        >
          <input type="radio" name="export-format" checked={format === id} onChange={() => setFormat(id)} className="mt-1 accent-[#480516]" />
          <span>
            <span className="block text-[14px] font-medium text-slate-900">{id}</span>
            <span className="block text-[12.5px] text-slate-500">{hint}</span>
          </span>
        </label>
      ))}
    </AdminModal>
  )
}
