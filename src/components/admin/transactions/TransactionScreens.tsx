import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKv,
  AdminModal,
  AdminSearch,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminDetailShell,
  AdminListShell,
  AdminNotFound,
  AdminStageTracker,
  AdminTablePanel,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { Icon } from '@/components/shared/Icon'
import { adminIcons } from '@/assets/admin'
import { cn } from '@/utils/format'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateTransaction } from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminTransaction } from '@/types/admin'

const TYPE_OPTIONS = [
  'All',
  'Refund',
  'Platform fee',
  'Settlement charge',
  'Bid hold lock',
  'Deposit credited',
  'Withdrawal',
]
const STATUS_OPTIONS = ['All', 'Completed', 'Active', 'Confirmed', 'Pending']

function amountClass(tone: AdminTransaction['amountTone'], surface: 'cell' | 'title' = 'cell') {
  if (tone === 'credit') return cn(surface === 'title' && 'text-[22px]', 'text-emerald-600')
  if (tone === 'hold') return cn(surface === 'title' && 'text-[22px]', 'text-amber-600')
  // Figma: list debit = slate/700; detail title = slate/800
  return cn(surface === 'title' ? 'text-[22px] text-slate-800' : 'text-slate-700')
}

function TxnStatusBadge({ status }: { status: string }) {
  // Transactions Figma: Active + Pending are amber; Confirmed is blue; Completed is green.
  // Global statusKind maps plain "Pending" to neutral (referrals), so override here.
  if (status === 'Active' || status === 'Pending') return <AdminBadge kind="warning" status={status} />
  return <AdminBadge status={status} />
}

function StatusStepper({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  const currentTone = steps[currentIndex]?.includes('Active') ? 'amber' : 'emerald'
  return (
    <AdminStageTracker
      stages={steps}
      currentIndex={currentIndex}
      currentTone={currentTone}
      complete={currentIndex >= steps.length - 1 && !steps[currentIndex]?.includes('Active')}
    />
  )
}

function RelatedRecords({ items }: { items: AdminTransaction['related'] }) {
  const navigate = useNavigate()
  if (!items.length) return null
  return (
    <AdminCard title="Related records" className="gap-2">
      {items.map((r) => (
        <button
          key={`${r.kind}-${r.label}`}
          type="button"
          onClick={() => (r.to ? navigate(r.to) : undefined)}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 px-3.5 py-2.5 text-left transition hover:border-slate-200 hover:bg-slate-50/80"
        >
          <span className="text-[13px] text-slate-700">
            <span className="text-slate-500">{r.kind}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-medium text-slate-800">{r.label}</span>
          </span>
          <Icon src={adminIcons.txnRelatedChevron} size={14} className="shrink-0" />
        </button>
      ))}
    </AdminCard>
  )
}

function TransactionHistory({ items }: { items: AdminTransaction['history'] }) {
  return (
    <AdminCard title="Transaction history">
      <ol className="mt-1 space-y-0">
        {items.map((ev, i) => (
          <li key={`${ev.title}-${i}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Icon src={adminIcons.referralHistDot} size={7} className="mt-1.5 shrink-0" />
              {i < items.length - 1 ? <span className="mt-1 w-px flex-1 bg-slate-200" /> : null}
            </div>
            <div className={cn('min-w-0 pb-4', i === items.length - 1 && 'pb-0')}>
              <p className="text-[13px] font-medium text-slate-800">{ev.title}</p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                {ev.at} · {ev.actor}
              </p>
              {ev.detail ? <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{ev.detail}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </AdminCard>
  )
}

function ModalBannerLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[12px] leading-normal text-amber-700">
      <Icon src={adminIcons.txnWarning} size={15} className="mt-0.5 shrink-0" />
      <p className="min-w-0 flex-1">{children}</p>
    </div>
  )
}

function refundAmountLabel(amount: string) {
  return amount.replace(/^[+-]/, '').replace(/ held$/, '')
}

export function TransactionsList() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.transactions)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')
  const [buyer, setBuyer] = useState('All')
  const buyers = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.buyer)))], [rows])

  const filtered = useMemo(() => {
    let list = rows.filter((r) => {
      if (!matchesQuery(`${r.id} ${r.buyer} ${r.type} ${r.reference}`, query)) return false
      if (type !== 'All' && r.type !== type) return false
      if (status !== 'All' && r.status !== status) return false
      if (buyer !== 'All' && r.buyer !== buyer) return false
      return true
    })
    return list
  }, [rows, query, type, status, buyer])

  return (
    <AdminListShell title="Transactions" subtitle="Every movement of money on the platform, linked to buyer and order.">
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch
              className="min-w-[200px] flex-1"
              value={query}
              onChange={setQuery}
              placeholder="Search by transaction ID"
            />
            <AdminFilter label="Type" value={type} onChange={setType} options={TYPE_OPTIONS} />
            <AdminFilter label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
            <AdminFilter label="Buyer" value={buyer} onChange={setBuyer} options={buyers} />
            <AdminFilter label="Date" value="All time" onChange={() => undefined} options={['All time']} />
            <AdminFilter value="Sort: Most recent" onChange={() => undefined} options={['Sort: Most recent']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          noun="transactions"
          rows={filtered}
          grid="0.85fr 0.95fr 1.1fr 1.1fr 0.85fr 0.9fr 0.85fr 56px"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/transactions/${r.id}`)}
          columns={[
            {
              header: 'Time',
              render: (r) => <span className="text-[11.5px] text-slate-500">{r.timeShort}</span>,
            },
            {
              header: 'Transaction ID',
              render: (r) => <span className="text-[11px] font-medium text-[#480516]">{r.id}</span>,
            },
            {
              header: 'Type',
              render: (r) => <span className="text-[11.5px] text-slate-700">{r.type}</span>,
            },
            {
              header: 'Buyer',
              render: (r) => <span className="text-[11.5px] text-slate-700">{r.buyer}</span>,
            },
            {
              header: 'Amount',
              render: (r) => (
                <span className={cn('text-[11.5px] font-medium', amountClass(r.amountTone, 'cell'))}>{r.amount}</span>
              ),
            },
            {
              header: 'Status',
              render: (r) => <TxnStatusBadge status={r.status} />,
            },
            {
              header: 'Reference',
              render: (r) => <span className="text-[10.5px] text-slate-500">{r.reference}</span>,
            },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function TransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const item = useAppSelector((s) => s.admin.transactions.find((r) => r.id === id))
  const [modal, setModal] = useState<'refund' | 'note' | null>(null)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')

  if (!item) return <AdminNotFound label="Back to Transactions" to="/admin/transactions" />

  const openModal = (kind: typeof modal) => {
    setReason('')
    setNote('')
    setModal(kind)
  }

  return (
    <AdminDetailShell
      backLabel="Back to Transactions"
      onBack={() => navigate('/admin/transactions')}
      title={item.amount}
      titleClassName={amountClass(item.amountTone, 'title')}
      badge={item.status}
      badgeKind={item.status === 'Active' ? 'warning' : undefined}
      subtitle={`${item.type} · ${item.buyer}`}
      actions={
        <>
          <AdminButton variant="outline" onClick={() => openModal('note')}>
            Add Note
          </AdminButton>
          {item.canRefund ? (
            <AdminButton variant="dangerOutline" onClick={() => openModal('refund')}>
              Initiate Refund
            </AdminButton>
          ) : null}
        </>
      }
    >
      <StatusStepper steps={item.steps} currentIndex={item.stepIndex} />

      <TwoCol>
        <AdminCard title="Transaction details" className="space-y-3">
          <AdminKv label="Transaction ID" value={item.id} tone="strong" />
          <AdminKv label="Type" value={item.type} />
          <AdminKv label="Direction" value={item.direction} />
          <AdminKv label="Status" value={<TxnStatusBadge status={item.status} />} />
          <AdminKv label="Buyer" value={item.buyer} />
          <AdminKv label="Date / time" value={item.at} />
          <AdminKv label="Reference" value={item.reference} />
        </AdminCard>

        {item.provider ? (
          <AdminCard title="Provider details" className="space-y-3">
            {item.provider.chain ? <AdminKv label="Chain" value={item.provider.chain} /> : null}
            {item.provider.hash ? <AdminKv label="Transaction hash" value={item.provider.hash} /> : null}
            {item.provider.moonpay ? <AdminKv label="MoonPay reference" value={item.provider.moonpay} /> : null}
          </AdminCard>
        ) : (
          <RelatedRecords items={item.related} />
        )}
      </TwoCol>

      {item.provider && item.related.length ? <RelatedRecords items={item.related} /> : null}

      <TransactionHistory items={item.history} />

      {modal === 'refund' ? (
        <AdminModal
          title="Initiate Refund"
          maxWidth={440}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                variant="danger"
                disabled={!reason.trim()}
                onClick={() => {
                  const refundAmt = refundAmountLabel(item.amount)
                  dispatch(
                    updateTransaction({
                      id: item.id,
                      status: 'Completed',
                      historyEntry: {
                        title: 'Refund initiated',
                        at: new Date().toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        }).replace(',', ' ·'),
                        actor: 'Ops Admin',
                        detail: reason.trim(),
                      },
                    }),
                  )
                  dispatch(showToast(`Refund of ${refundAmt} initiated`))
                  setModal(null)
                }}
              >
                Initiate Refund
              </AdminButton>
            </>
          }
        >
          <div className="flex flex-col gap-3.5">
            <ModalBannerLine>
              {`This returns ${refundAmountLabel(item.amount)} to ${item.buyer}'s wallet and cannot be reversed automatically.`}
            </ModalBannerLine>
            <div className="flex flex-col gap-2 rounded-lg bg-slate-50 px-3.5 py-3">
              <div className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="text-slate-500">Original transaction</span>
                <span className="font-medium text-slate-800">{item.id}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="text-slate-500">Refund amount</span>
                <span className="font-medium text-slate-800">{refundAmountLabel(item.amount)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="text-slate-500">Buyer</span>
                <span className="font-medium text-slate-800">{item.buyer}</span>
              </div>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-slate-600">Reason for refund (required)</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Failed B-Stock placement — lot could not be secured after payment"
                className="h-[60px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12.5px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-maroon-400"
              />
            </label>
          </div>
        </AdminModal>
      ) : null}

      {modal === 'note' ? (
        <AdminModal
          title="Add Note"
          maxWidth={440}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={!note.trim()}
                onClick={() => {
                  dispatch(updateTransaction({ id: item.id, note: note.trim() }))
                  dispatch(showToast('Note added'))
                  setModal(null)
                }}
              >
                Save note
              </AdminButton>
            </>
          }
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-slate-600">Note</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an internal note for this transaction"
              className="h-[80px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12.5px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-maroon-400"
            />
          </label>
        </AdminModal>
      ) : null}
    </AdminDetailShell>
  )
}
