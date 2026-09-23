import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminBadge,
  AdminButton,
  AdminFilter,
  AdminKv,
  AdminModal,
  AdminSearch,
  AdminTabs,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminDetailShell,
  AdminListShell,
  AdminNotFound,
  AdminTablePanel,
  StatusCell,
  TwoCol,
  matchesQuery,
} from '@/components/admin/screens'
import { Icon } from '@/components/shared/Icon'
import { adminIcons } from '@/assets/admin'
import { cn } from '@/utils/format'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addAdminNote,
  overrideBuyerTier,
  setBuyerStatus,
  updateBuyerControls,
  updateRegulation,
} from '@/store/slices/adminSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { AdminBuyer, AdminRegulation } from '@/types/admin'

const BUYER_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'auctions', label: 'Auctions' },
  { id: 'orders', label: 'Orders' },
  { id: 'referrals', label: 'Referrals' },
  { id: 'documents', label: 'Documents' },
  { id: 'support', label: 'Support' },
  { id: 'audit', label: 'Audit' },
]

const TIER_OPTIONS = ['Tier 1', 'Tier 2', 'Tier 3'] as const

const PRODUCT_TIERS = [
  { name: 'Tier 1', range: '$0 – $5,000', hint: 'New buyers start here' },
  { name: 'Tier 2', range: '$5,000 – $15,000', hint: 'After 1–2 paid wins' },
  { name: 'Tier 3', range: '$15,000+', hint: 'Trusted buyers, multiple wins' },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
}

function tierShort(tier: string) {
  return tier.replace(/^Tier\s+/i, 'T')
}

function buyerSubtitle(buyer: AdminBuyer) {
  return `${buyer.type} · ${buyer.tier} · KYC ${buyer.kyc} · Buyer ID ${buyer.id} · Joined ${buyer.joined}`
}

function Banner({
  tone,
  children,
}: {
  tone: 'info' | 'danger' | 'hold' | 'success' | 'neutral'
  children: ReactNode
}) {
  const styles = {
    info: 'border-blue-100 bg-blue-50 text-blue-700',
    danger: 'border-red-100 bg-red-50 text-red-700',
    hold: 'border-amber-100 bg-amber-50 text-amber-800',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  }[tone]
  return <p className={`rounded-lg border px-3.5 py-3 text-[13px] leading-5 ${styles}`}>{children}</p>
}

function BuyerKpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-slate-200 bg-white px-[18px] py-4">
      <p className="text-[12px] font-medium leading-normal text-slate-500">{label}</p>
      <p className="text-[22px] font-semibold leading-normal text-slate-900">{value}</p>
    </div>
  )
}

function SectionPanel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-slate-200 bg-white', className)}>
      <div className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold leading-normal text-slate-800">{title}</p>
          {subtitle ? <p className="mt-0.5 text-[12px] leading-normal text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean
  onChange?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled || !onChange}
      onClick={onChange}
      className={cn(
        'relative h-[22px] w-[38px] shrink-0 rounded-full transition',
        on ? 'bg-[#480516]' : 'bg-slate-200',
        (disabled || !onChange) && 'cursor-default opacity-90',
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] size-[18px] rounded-full bg-white shadow transition',
          on ? 'left-[18px]' : 'left-[2px]',
        )}
      />
    </button>
  )
}

function ControlRow({
  title,
  hint,
  on,
  onChange,
  disabled,
}: {
  title: string
  hint: string
  on: boolean
  onChange?: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-4">
      <div>
        <p className="text-[13px] font-medium text-slate-800">{title}</p>
        <p className="mt-0.5 text-[12px] text-slate-500">{hint}</p>
      </div>
      <Toggle on={on} onChange={onChange} disabled={disabled} />
    </div>
  )
}

function EmbeddedTable<T extends { id: string }>({
  rows,
  grid,
  columns,
}: {
  rows: T[]
  grid: string
  columns: { header: string; render: (row: T) => ReactNode; align?: 'right' }[]
}) {
  return (
    <AdminDataTable
      embedded
      pageSize={10}
      rows={rows}
      grid={grid}
      columns={columns.map((c) => ({
        header: c.header,
        render: (row: T) =>
          c.align === 'right' ? <span className="block text-right">{c.render(row)}</span> : c.render(row),
      }))}
    />
  )
}

function KycBadge({ status }: { status: string }) {
  if (status === 'Approved') return <AdminBadge kind="success" status={status} />
  return <StatusCell status={status} />
}

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
            <AdminSearch
              className="w-full sm:w-[300px]"
              value={query}
              onChange={setQuery}
              placeholder="Search by buyer name, ID, or email"
            />
            <AdminFilter
              label="KYC status"
              value={kyc}
              onChange={setKyc}
              options={['All', 'Approved', 'Pending']}
            />
            <AdminFilter label="Tier" value={tier} onChange={setTier} options={['All', 'Tier 1', 'Tier 2', 'Tier 3']} />
            <AdminFilter
              label="Status"
              value={status}
              onChange={setStatus}
              options={['All', 'Active', 'Restricted', 'Deactivated']}
            />
            <AdminFilter label="Joined" value="All time" onChange={() => undefined} options={['All time']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          tall
          pageSize={8}
          rows={filtered}
          grid="1.35fr 0.7fr 1.45fr 0.95fr 0.55fr 1.05fr 0.95fr 0.9fr 72px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/buyers/${r.id}`)}
          columns={[
            {
              header: 'Buyer',
              render: (r) => (
                <span className="flex items-center gap-2.5">
                  <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#480516] text-[11px] font-semibold text-white">
                    {initials(r.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-slate-800">{r.name}</span>
                    <span className="block text-[11px] text-slate-400">{r.type}</span>
                  </span>
                </span>
              ),
            },
            { header: 'Buyer ID', render: (r) => <span className="text-[13px] text-slate-700">{r.id}</span> },
            { header: 'Email', render: (r) => <span className="truncate text-[12.5px] text-slate-600">{r.email}</span> },
            { header: 'KYC status', render: (r) => <KycBadge status={r.kyc} /> },
            { header: 'Tier', render: (r) => <span className="text-[13px] text-slate-700">{tierShort(r.tier)}</span> },
            { header: 'Account status', render: (r) => <StatusCell status={r.status} /> },
            {
              header: 'Wallet balance',
              render: (r) => <span className="block text-right text-[13px] font-medium text-slate-800">{r.wallet}</span>,
            },
            {
              header: 'Joined date',
              render: (r) => <span className="block text-right text-[12.5px] text-slate-500">{r.joined}</span>,
            },
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
  const [tab, setTab] = useState('overview')
  const [modal, setModal] = useState<'tier' | 'suspend' | 'deactivate' | 'reactivate' | 'controls' | 'note' | null>(
    null,
  )
  const [tier, setTier] = useState(buyer?.tier ?? 'Tier 1')
  const [reason, setReason] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [draftControls, setDraftControls] = useState({
    restrictBidding: false,
    restrictWithdrawals: false,
    restrictDeposits: false,
    complianceHold: false,
  })

  if (!buyer) {
    return <AdminNotFound label="Back to buyers" to="/admin/buyers" />
  }

  const deactivated = buyer.status === 'Deactivated'
  const openModal = (kind: typeof modal) => {
    setReason('')
    setNoteBody('')
    setTier(buyer.tier)
    setDraftControls({
      restrictBidding: buyer.restrictBidding,
      restrictWithdrawals: buyer.restrictWithdrawals,
      restrictDeposits: buyer.restrictDeposits,
      complianceHold: buyer.complianceHold,
    })
    setModal(kind)
  }

  return (
    <AdminDetailShell
      backLabel="Back to buyers"
      onBack={() => navigate('/admin/buyers')}
      title={buyer.name}
      badge={buyer.status}
      subtitle={buyerSubtitle(buyer)}
      actions={
        deactivated ? (
          <>
            <AdminButton variant="outline" onClick={() => openModal('note')}>
              Add note
            </AdminButton>
            <AdminButton onClick={() => openModal('reactivate')}>Reactivate Account</AdminButton>
          </>
        ) : (
          <>
            <AdminButton variant="outline" onClick={() => openModal('note')}>
              Add note
            </AdminButton>
            <AdminButton variant="outline" onClick={() => openModal('tier')}>
              Override Tier
            </AdminButton>
            <AdminButton variant="dangerOutline" onClick={() => openModal('suspend')}>
              Suspend
            </AdminButton>
            <AdminButton variant="danger" onClick={() => openModal('deactivate')}>
              Deactivate
            </AdminButton>
          </>
        )
      }
    >
      {deactivated && buyer.deactivatedAt ? (
        <Banner tone="info">
          This account was deactivated on {buyer.deactivatedAt} by {buyer.deactivatedBy ?? 'an admin'}. Reason:{' '}
          {buyer.deactivatedReason ?? '—'}. Reactivating restores full access to bidding, deposits, and withdrawals.
        </Banner>
      ) : null}

      <AdminTabs quiet tabs={BUYER_TABS} value={tab} onChange={setTab} />

      {tab === 'overview' ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <BuyerKpi label="Active bids" value={buyer.activeBids} />
            <BuyerKpi label="Wins" value={buyer.wins} />
            <BuyerKpi label="Open orders" value={buyer.openOrdersCount} />
          </div>

          {!deactivated ? (
            <SectionPanel title="Product tiers">
              <div className="grid grid-cols-1 gap-3 p-5 pt-3 sm:grid-cols-3">
                {PRODUCT_TIERS.map((t) => {
                  const active = buyer.tier === t.name
                  return (
                    <div
                      key={t.name}
                      className={cn(
                        'rounded-xl border px-3.5 py-3',
                        active ? 'border-[#480516]/40 bg-[#480516]/[0.04]' : 'border-slate-200 bg-slate-50/60',
                      )}
                    >
                      <p className="text-[13px] font-semibold text-slate-800">{t.name}</p>
                      <p className="mt-1 text-[12px] text-slate-600">{t.range}</p>
                      <p className="mt-1 text-[12px] text-slate-400">{t.hint}</p>
                    </div>
                  )
                })}
              </div>
            </SectionPanel>
          ) : null}

          <SectionPanel
            title="Regulation controls"
            subtitle={
              deactivated ? undefined : 'Restrict specific account capabilities beyond KYC. Every change is logged.'
            }
            action={
              <AdminButton variant="outline" className="h-[38px]" onClick={() => openModal('controls')}>
                Update controls
              </AdminButton>
            }
          >
            <div className="mt-2">
              {!deactivated ? (
                <>
                  <ControlRow
                    title="Restrict bidding"
                    hint="Buyer cannot place new bids"
                    on={buyer.restrictBidding}
                  />
                  <ControlRow
                    title="Restrict withdrawals"
                    hint="Buyer cannot request payouts"
                    on={buyer.restrictWithdrawals}
                  />
                  <ControlRow
                    title="Restrict deposits"
                    hint="Buyer cannot fund wallet"
                    on={buyer.restrictDeposits}
                  />
                </>
              ) : null}
              <ControlRow
                title="Compliance hold"
                hint="Freezes all account activity pending review"
                on={buyer.complianceHold}
              />
            </div>
          </SectionPanel>
        </div>
      ) : null}

      {tab === 'wallet' ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <BuyerKpi label="Available balance" value={buyer.availableBalance} />
            <BuyerKpi label="Held balance" value={buyer.heldBalance} />
            <BuyerKpi label="Escrow balance" value={buyer.escrowBalance} />
          </div>
          <SectionPanel
            title="Wallet activity"
            subtitle="Deposits, holds, charges, and withdrawals linked to this buyer's wallet."
          >
            <div className="mt-3 border-t border-slate-100">
              <EmbeddedTable
                rows={buyer.walletActivity}
                grid="1.2fr 1.2fr 1fr 0.9fr 0.9fr"
                columns={[
                  { header: 'Date / time', render: (r) => <span className="text-[12.5px] text-slate-600">{r.dateTime}</span> },
                  { header: 'Type', render: (r) => r.type },
                  { header: 'Amount', render: (r) => <span className="font-medium text-slate-800">{r.amount}</span> },
                  { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
                  { header: 'Ref', render: (r) => <span className="font-medium text-[#480516]">{r.ref}</span> },
                ]}
              />
            </div>
          </SectionPanel>
        </div>
      ) : null}

      {tab === 'auctions' ? (
        <div className="flex flex-col gap-4">
          <SectionPanel title={`Active bids (${buyer.bids.length})`} subtitle="Lots this buyer is currently bidding on.">
            <div className="mt-3 border-t border-slate-100">
              <EmbeddedTable
                rows={buyer.bids}
                grid="1.6fr 1fr 1fr"
                columns={[
                  { header: 'Lot', render: (r) => <span className="font-medium text-slate-800">{r.lot}</span> },
                  { header: 'Current bid', render: (r) => r.currentBid },
                  { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
                ]}
              />
            </div>
          </SectionPanel>
          <SectionPanel title={`Wins (${buyer.winsList.length})`} subtitle="Auctions this buyer has won.">
            <div className="mt-3 border-t border-slate-100">
              <EmbeddedTable
                rows={buyer.winsList}
                grid="1.6fr 1fr 1fr"
                columns={[
                  { header: 'Lot', render: (r) => <span className="font-medium text-slate-800">{r.lot}</span> },
                  { header: 'Winning bid', render: (r) => r.winningBid },
                  { header: 'Order stage', render: (r) => <StatusCell status={r.orderStage} /> },
                ]}
              />
            </div>
          </SectionPanel>
        </div>
      ) : null}

      {tab === 'orders' ? (
        <div className="flex flex-col gap-4">
          <SectionPanel
            title={`Open orders (${buyer.openOrdersList.length})`}
            subtitle="Orders in progress toward settlement or delivery."
          >
            <div className="mt-3 border-t border-slate-100">
              <EmbeddedTable
                rows={buyer.openOrdersList}
                grid="0.9fr 1.5fr 0.8fr 0.9fr"
                columns={[
                  { header: 'Order', render: (r) => <span className="font-medium text-[#480516]">{r.id}</span> },
                  { header: 'Lot', render: (r) => r.lot },
                  { header: 'Amount', render: (r) => r.amount },
                  { header: 'Stage', render: (r) => <StatusCell status={r.stage} /> },
                ]}
              />
            </div>
          </SectionPanel>
          <SectionPanel
            title={`Completed orders (${buyer.completedOrders.length})`}
            subtitle="Orders that have been delivered and closed."
          >
            <div className="mt-3 border-t border-slate-100">
              <EmbeddedTable
                rows={buyer.completedOrders}
                grid="0.9fr 1.5fr 0.8fr 0.9fr"
                columns={[
                  { header: 'Order', render: (r) => <span className="font-medium text-[#480516]">{r.id}</span> },
                  { header: 'Lot', render: (r) => r.lot },
                  { header: 'Amount', render: (r) => r.amount },
                  { header: 'Stage', render: (r) => <StatusCell status={r.stage} /> },
                ]}
              />
            </div>
          </SectionPanel>
        </div>
      ) : null}

      {tab === 'referrals' ? (
        <SectionPanel
          title="Referral activity"
          subtitle={
            buyer.referralCode
              ? `Buyers referred by ${buyer.name} using their referral code ${buyer.referralCode}.`
              : `Buyers referred by ${buyer.name}.`
          }
        >
          <div className="mt-3 border-t border-slate-100">
            <EmbeddedTable
              rows={buyer.referrals}
              grid="1.2fr 1fr 1.1fr 1.2fr"
              columns={[
                { header: 'Referred buyer', render: (r) => <span className="font-medium text-slate-800">{r.referredBuyer}</span> },
                { header: 'Code', render: (r) => r.code },
                { header: 'Qualification status', render: (r) => <StatusCell status={r.qualification} /> },
                { header: 'Reward', render: (r) => <span className="text-slate-600">{r.reward}</span> },
              ]}
            />
          </div>
        </SectionPanel>
      ) : null}

      {tab === 'documents' ? (
        <div className="flex flex-col gap-4">
          <SectionPanel title="Verification summary">
            <div className="space-y-3 px-5 pb-5 pt-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-slate-500">Status</span>
                <KycBadge status={buyer.verification.status} />
              </div>
              <AdminKv label="Verified Date" value={buyer.verification.verifiedDate} />
              <AdminKv label="Reviewed By" value={buyer.verification.reviewedBy} />
              <AdminKv label="Verification Type" value={buyer.verification.type} />
            </div>
          </SectionPanel>
          <SectionPanel title="Submitted documents" subtitle="Documents provided during KYC onboarding.">
            <div className="divide-y divide-slate-100 px-5 pb-2 pt-2">
              {buyer.documents.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-slate-400">No documents on file.</p>
              ) : (
                buyer.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-3 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                        <Icon src={adminIcons.file} size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-slate-800">{doc.name}</p>
                        <p className="text-[11.5px] text-slate-500">
                          Uploaded {doc.uploaded} · {doc.size}
                        </p>
                      </div>
                    </div>
                    <button type="button" className="shrink-0 text-[13px] font-medium text-[#480516] hover:underline">
                      Review
                    </button>
                  </div>
                ))
              )}
            </div>
          </SectionPanel>
        </div>
      ) : null}

      {tab === 'support' ? (
        <SectionPanel title="Support history" subtitle="Tickets this buyer has raised with support.">
          <div className="mt-3 border-t border-slate-100">
            <EmbeddedTable
              rows={buyer.supportTickets}
              grid="0.8fr 1.8fr 1fr 0.9fr"
              columns={[
                { header: 'Ticket', render: (r) => <span className="font-medium text-[#480516]">{r.id}</span> },
                { header: 'Subject', render: (r) => r.subject },
                { header: 'Opened', render: (r) => <span className="text-[12.5px] text-slate-500">{r.opened}</span> },
                { header: 'Status', render: (r) => <StatusCell status={r.status} /> },
              ]}
            />
          </div>
        </SectionPanel>
      ) : null}

      {tab === 'audit' ? (
        <SectionPanel title="Account history" subtitle="Administrative actions and status changes for this buyer.">
          <div className="mt-3 border-t border-slate-100">
            <EmbeddedTable
              rows={buyer.accountHistory}
              grid="1.15fr 1.3fr 0.8fr 0.8fr 1fr 1.3fr"
              columns={[
                { header: 'Date / time', render: (r) => <span className="text-[12.5px] text-slate-600">{r.dateTime}</span> },
                { header: 'Action', render: (r) => <span className="font-medium text-slate-800">{r.action}</span> },
                { header: 'Before', render: (r) => r.before },
                { header: 'After', render: (r) => r.after },
                { header: 'Admin', render: (r) => r.admin },
                { header: 'Notes', render: (r) => <span className="text-slate-600">{r.notes}</span> },
              ]}
            />
          </div>
        </SectionPanel>
      ) : null}

      {modal === 'tier' ? (
        <AdminModal
          title="Override Tier"
          maxWidth={440}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={!reason.trim()}
                onClick={() => {
                  dispatch(overrideBuyerTier({ id: buyer.id, tier, reason: reason.trim() }))
                  dispatch(showToast('Tier updated'))
                  setModal(null)
                }}
              >
                Override Tier
              </AdminButton>
            </>
          }
        >
          <p className="text-[13px] leading-relaxed text-slate-600">
            Manually change {buyer.name}&apos;s product tier. This bypasses automatic tier rules.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {TIER_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTier(opt)}
                className={cn(
                  'h-9 rounded-lg border text-[13px] font-medium transition',
                  tier === opt
                    ? 'border-[#480516] bg-[#480516] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <label className="mt-4 flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium text-slate-600">Reason for override (required)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. 3 consecutive paid wins, upgrade approved"
              className="min-h-[70px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-maroon-400"
            />
          </label>
        </AdminModal>
      ) : null}

      {modal === 'suspend' ? (
        <AdminModal
          title="Suspend Buyer"
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
                  dispatch(setBuyerStatus({ id: buyer.id, status: 'Restricted', reason: reason.trim() }))
                  dispatch(showToast('Buyer suspended'))
                  setModal(null)
                }}
              >
                Suspend Buyer
              </AdminButton>
            </>
          }
        >
          <Banner tone="hold">
            {buyer.name} will be temporarily unable to bid, deposit, or withdraw until reactivated. This is recorded in
            the audit trail.
          </Banner>
          <label className="mt-4 flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium text-slate-600">Reason for suspension (required)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Suspicious bidding pattern under review"
              className="min-h-[70px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-maroon-400"
            />
          </label>
        </AdminModal>
      ) : null}

      {modal === 'deactivate' ? (
        <AdminModal
          title="Deactivate Account"
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
                  dispatch(setBuyerStatus({ id: buyer.id, status: 'Deactivated', reason: reason.trim() }))
                  dispatch(showToast('Account deactivated'))
                  setModal(null)
                }}
              >
                Deactivate Account
              </AdminButton>
            </>
          }
        >
          <Banner tone="danger">
            This closes {buyer.name}&apos;s account. They will be signed out and unable to access BidBridge until
            reactivated by an admin.
          </Banner>
          <label className="mt-4 flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium text-slate-600">Reason for deactivation (required)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Buyer requested account closure"
              className="min-h-[70px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-maroon-400"
            />
          </label>
        </AdminModal>
      ) : null}

      {modal === 'reactivate' ? (
        <AdminModal
          title="Reactivate Account"
          maxWidth={440}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                onClick={() => {
                  dispatch(setBuyerStatus({ id: buyer.id, status: 'Active', note: reason.trim() || undefined }))
                  dispatch(showToast('Account reactivated'))
                  setModal(null)
                }}
              >
                Reactivate Account
              </AdminButton>
            </>
          }
        >
          <Banner tone="info">
            {buyer.name} will regain full access to bidding, deposits, and withdrawals immediately.
          </Banner>
          <label className="mt-4 flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium text-slate-600">Note (optional)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Reactivation request reviewed and approved"
              className="min-h-[70px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-maroon-400"
            />
          </label>
        </AdminModal>
      ) : null}

      {modal === 'controls' ? (
        <AdminModal
          title="Update Regulation Controls"
          maxWidth={440}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={!reason.trim()}
                onClick={() => {
                  dispatch(
                    updateBuyerControls({
                      id: buyer.id,
                      ...draftControls,
                      reason: reason.trim(),
                    }),
                  )
                  dispatch(showToast('Controls updated'))
                  setModal(null)
                }}
              >
                Confirm
              </AdminButton>
            </>
          }
        >
          <p className="text-[13px] leading-relaxed text-slate-600">
            Restrict specific capabilities for {buyer.name} beyond KYC. Every change is logged.
          </p>
          <div className="mt-3 -mx-1">
            <ControlRow
              title="Restrict bidding"
              hint="Buyer cannot place new bids"
              on={draftControls.restrictBidding}
              onChange={() => setDraftControls((c) => ({ ...c, restrictBidding: !c.restrictBidding }))}
            />
            <ControlRow
              title="Restrict withdrawals"
              hint="Buyer cannot request payouts"
              on={draftControls.restrictWithdrawals}
              onChange={() => setDraftControls((c) => ({ ...c, restrictWithdrawals: !c.restrictWithdrawals }))}
            />
            <ControlRow
              title="Restrict deposits"
              hint="Buyer cannot fund wallet"
              on={draftControls.restrictDeposits}
              onChange={() => setDraftControls((c) => ({ ...c, restrictDeposits: !c.restrictDeposits }))}
            />
            <ControlRow
              title="Compliance hold"
              hint="Freezes all account activity pending review"
              on={draftControls.complianceHold}
              onChange={() => setDraftControls((c) => ({ ...c, complianceHold: !c.complianceHold }))}
            />
          </div>
          <label className="mt-3 flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium text-slate-600">Reason for change (required)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Temporary hold pending document review"
              className="min-h-[70px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-maroon-400"
            />
          </label>
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
                disabled={!noteBody.trim()}
                onClick={() => {
                  dispatch(addAdminNote({ collection: 'buyers', id: buyer.id, body: noteBody.trim() }))
                  dispatch(showToast('Note added'))
                  setModal(null)
                }}
              >
                Confirm
              </AdminButton>
            </>
          }
        >
          <p className="text-[13px] leading-relaxed text-slate-600">
            Internal note for {buyer.name}. Visible only to admins reviewing this account.
          </p>
          <label className="mt-4 flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium text-slate-600">Note</span>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Add context for other admins…"
              className="min-h-[90px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-maroon-400"
            />
          </label>
        </AdminModal>
      ) : null}
    </AdminDetailShell>
  )
}

const REG_FLAG_ROWS = [
  { key: 'restrictBidding' as const, title: 'Restrict bidding', hint: 'Buyer cannot place new bids' },
  { key: 'restrictWithdrawals' as const, title: 'Restrict withdrawals', hint: 'Buyer cannot request payouts' },
  { key: 'restrictDeposits' as const, title: 'Restrict deposits', hint: 'Buyer cannot fund wallet' },
  { key: 'complianceHold' as const, title: 'Compliance hold', hint: 'Freezes all account activity pending review' },
]

function regulationRestrictions(item: AdminRegulation) {
  if (!item.flags.length) return 'None'
  return item.flags.join(', ')
}

function regulationBanner(status: string): { tone: 'success' | 'hold' | 'danger' | 'neutral'; text: string } {
  if (status === 'Restricted') {
    return { tone: 'hold', text: 'Restricted: Some actions are blocked, such as placing new bids.' }
  }
  if (status === 'Suspended') {
    return { tone: 'danger', text: 'Suspended: Temporary hold on bidding and funding.' }
  }
  if (status === 'Deactivated') {
    return { tone: 'neutral', text: 'Deactivated: Account is closed and cannot log in.' }
  }
  return { tone: 'success', text: 'Active: Full access per tier and KYC status.' }
}

function ModalField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-[12px] font-medium leading-normal text-slate-600">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[60px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12.5px] leading-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-maroon-400"
      />
    </label>
  )
}

function ModalBannerLine({
  tone,
  children,
}: {
  tone: 'hold' | 'danger' | 'success' | 'neutral'
  children: ReactNode
}) {
  const styles = {
    hold: 'text-amber-700',
    danger: 'text-red-700',
    success: 'text-emerald-700',
    neutral: 'text-slate-700',
  }[tone]
  const icon =
    tone === 'success' ? (
      <span className="mt-0.5 flex size-[15px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Icon src={adminIcons.check} size={9} />
      </span>
    ) : tone === 'neutral' ? (
      <span className="mt-0.5 flex size-[15px] shrink-0 items-center justify-center text-slate-500">
        <Icon src={adminIcons.navRegulation} size={14} />
      </span>
    ) : (
      <svg
        className={cn('mt-0.5 size-[15px] shrink-0', tone === 'danger' ? 'text-red-600' : 'text-amber-600')}
        viewBox="0 0 15 15"
        fill="currentColor"
        aria-hidden
      >
        <path d="M7.5 1.2 14 13.2H1L7.5 1.2Zm0 3.3-.9 5h1.8l-.9-5Zm0 6.2a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z" />
      </svg>
    )
  return (
    <div className={cn('flex items-start gap-2 text-[12px] leading-normal', styles)}>
      {icon}
      <p className="min-w-0 flex-1">{children}</p>
    </div>
  )
}

function ModalToggleRow({
  title,
  hint,
  on,
  onChange,
}: {
  title: string
  hint: string
  on: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium leading-normal text-slate-800">{title}</p>
        <p className="mt-0.5 text-[11px] leading-normal text-slate-400">{hint}</p>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

function RegulationEmptyAudit() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
        <Icon src={adminIcons.navRegulation} size={18} />
      </div>
      <p className="text-[13px] text-slate-500">No regulation actions recorded for this buyer.</p>
    </div>
  )
}

export function AdminRegulationPage() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.regulation)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [kyc, setKyc] = useState('All')
  const [tier, setTier] = useState('All')
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (!matchesQuery(`${r.buyer} ${r.buyerId} ${r.flags.join(' ')}`, query)) return false
        if (status !== 'All' && r.status !== status) return false
        if (kyc !== 'All' && r.kyc !== kyc) return false
        if (tier !== 'All' && r.tier !== tier && r.tierLabel !== tier) return false
        return true
      }),
    [rows, query, status, kyc, tier],
  )

  return (
    <AdminListShell title="Regulation" subtitle="Manage buyer account restrictions and account status.">
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch
              className="min-w-[220px] flex-1"
              value={query}
              onChange={setQuery}
              placeholder="Search by buyer name or buyer ID"
            />
            <AdminFilter
              label="Status"
              value={status}
              onChange={setStatus}
              options={['All', 'Active', 'Restricted', 'Suspended', 'Deactivated']}
            />
            <AdminFilter label="KYC" value={kyc} onChange={setKyc} options={['All', 'Approved', 'Pending', 'Rejected']} />
            <AdminFilter label="Tier" value={tier} onChange={setTier} options={['All', 'T1', 'T2', 'T3']} />
          </>
        }
      >
        <AdminDataTable
          embedded
          noun="buyers"
          rows={filtered}
          grid="1.35fr 0.7fr 0.95fr 0.85fr 0.55fr 1.2fr 0.85fr 64px"
          actionLabel="Open"
          onRow={(r) => navigate(`/admin/regulation/${r.id}`)}
          columns={[
            {
              header: 'Buyer',
              render: (r) => (
                <span className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#480516]/[0.08] text-[11px] font-semibold text-[#480516]">
                    {r.initials || initials(r.buyer)}
                  </span>
                  <span className="text-[13px] font-medium text-slate-800">{r.buyer}</span>
                </span>
              ),
            },
            { header: 'Buyer ID', render: (r) => <span className="text-[13px] text-slate-700">{r.buyerId}</span> },
            { header: 'Account status', render: (r) => <StatusCell status={r.status} /> },
            { header: 'KYC status', render: (r) => <KycBadge status={r.kyc} /> },
            { header: 'Tier', render: (r) => <span className="text-[13px] text-slate-700">{r.tier}</span> },
            {
              header: 'Current restrictions',
              render: (r) => (
                <span className="text-[12.5px] text-slate-600">{regulationRestrictions(r)}</span>
              ),
            },
            {
              header: 'Compliance Hold',
              render: (r) =>
                r.complianceHold ? (
                  <AdminBadge kind="danger" status="Yes" />
                ) : (
                  <span className="text-[13px] text-slate-600">No</span>
                ),
            },
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
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [draftFlags, setDraftFlags] = useState({
    restrictBidding: false,
    restrictWithdrawals: false,
    restrictDeposits: false,
    complianceHold: false,
  })

  if (!item) return <AdminNotFound label="Back to Regulation" to="/admin/regulation" />

  const deactivated = item.status === 'Deactivated'
  const suspended = item.status === 'Suspended'
  const restricted = item.status === 'Restricted'
  const active = item.status === 'Active'
  const banner = regulationBanner(item.status)

  const openModal = (kind: typeof modal) => {
    setReason('')
    setNote('')
    setConfirmChecked(false)
    setDraftFlags({
      restrictBidding: item.restrictBidding,
      restrictWithdrawals: item.restrictWithdrawals,
      restrictDeposits: item.restrictDeposits,
      complianceHold: item.complianceHold,
    })
    setModal(kind)
  }

  const stampAudit = (action: string) => ({
    action,
    reason: reason.trim(),
    note: note.trim(),
    admin: 'Ops Admin',
    at: new Date().toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', ' ·'),
  })

  return (
    <AdminDetailShell
      backLabel="Back to Regulation"
      onBack={() => navigate('/admin/regulation')}
      title={item.buyer}
      badges={[item.status, item.kyc]}
      subtitle={`Buyer ID ${item.buyerId} · ${item.tierLabel}`}
      actions={
        deactivated ? (
          <AdminButton onClick={() => openModal('reactivate')}>Reactivate Account</AdminButton>
        ) : (
          <>
            {restricted || suspended ? (
              <AdminButton variant="outline" onClick={() => openModal('reactivate')}>
                Reactivate
              </AdminButton>
            ) : null}
            {active || restricted ? (
              <AdminButton variant="outline" onClick={() => openModal('suspend')}>
                Suspend
              </AdminButton>
            ) : null}
            <AdminButton variant="danger" onClick={() => openModal('deactivate')}>
              Deactivate
            </AdminButton>
          </>
        )
      }
    >
      <Banner tone={banner.tone}>{banner.text}</Banner>
      {deactivated ? (
        <Banner tone="info">
          This account is deactivated and cannot log in. Reactivation requires explicit confirmation and is recorded in
          the audit history — it cannot be undone with a single click.
        </Banner>
      ) : null}

      <TwoCol>
        <SectionPanel title="Regulation flags">
          <div className="mt-2">
            {REG_FLAG_ROWS.map((row) => (
              <ControlRow key={row.key} title={row.title} hint={row.hint} on={item[row.key]} />
            ))}
          </div>
          <div className="flex justify-end border-t border-slate-100 px-5 py-4">
            <AdminButton className="h-[38px]" onClick={() => openModal('flags')}>
              Update Flags
            </AdminButton>
          </div>
        </SectionPanel>

        <SectionPanel title="Buyer information">
          <div className="flex flex-col gap-3 px-5 py-4">
            <AdminKv label="Buyer name" value={item.buyer} tone="strong" />
            <AdminKv label="Buyer ID" value={item.buyerId} />
            <AdminKv label="Current status" value={<StatusCell status={item.status} />} />
            <AdminKv label="KYC status" value={<KycBadge status={item.kyc} />} />
            <AdminKv label="Tier" value={item.tierLabel} />
            <AdminKv label="Compliance status" value={<StatusCell status={item.complianceStatus} />} />
          </div>
        </SectionPanel>
      </TwoCol>

      <SectionPanel title="Regulation audit history" subtitle="Every regulation change is recorded here.">
        {item.audit.length === 0 ? (
          <RegulationEmptyAudit />
        ) : (
          <div className="mt-3 border-t border-slate-100">
            <EmbeddedTable
              rows={item.audit.map((a, i) => ({ ...a, id: `${item.id}-audit-${i}` }))}
              grid="1.1fr 1.4fr 1.2fr 0.8fr 0.95fr"
              columns={[
                { header: 'Action', render: (r) => <span className="text-[13px] font-medium text-slate-800">{r.action}</span> },
                { header: 'Reason', render: (r) => <span className="text-[12.5px] text-slate-600">{r.reason || '—'}</span> },
                { header: 'Internal note', render: (r) => <span className="text-[12.5px] text-slate-600">{r.note || '—'}</span> },
                { header: 'Admin', render: (r) => <span className="text-[13px] text-slate-700">{r.admin}</span> },
                { header: 'Date / time', render: (r) => <span className="text-[12.5px] text-slate-500">{r.at}</span> },
              ]}
            />
          </div>
        )}
      </SectionPanel>

      {modal === 'flags' ? (
        <AdminModal
          title="Update Regulation Flags"
          subtitle={`Update restrictions for ${item.buyer}. Every change is logged.`}
          maxWidth={440}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={!reason.trim()}
                onClick={() => {
                  const anyFlag =
                    draftFlags.restrictBidding ||
                    draftFlags.restrictWithdrawals ||
                    draftFlags.restrictDeposits ||
                    draftFlags.complianceHold
                  const nextStatus =
                    item.status === 'Suspended' || item.status === 'Deactivated'
                      ? item.status
                      : anyFlag
                        ? 'Restricted'
                        : 'Active'
                  dispatch(
                    updateRegulation({
                      id: item.id,
                      status: nextStatus,
                      ...draftFlags,
                      auditEntry: stampAudit('Regulation flags updated'),
                    }),
                  )
                  dispatch(showToast('Flags updated'))
                  setModal(null)
                }}
              >
                Update Flags
              </AdminButton>
            </>
          }
        >
          <div className="flex flex-col gap-0">
            {REG_FLAG_ROWS.map((row, i) => (
              <div key={row.key}>
                {i > 0 ? <div className="h-px bg-slate-100" /> : null}
                <ModalToggleRow
                  title={row.title}
                  hint={row.hint}
                  on={draftFlags[row.key]}
                  onChange={() => setDraftFlags((c) => ({ ...c, [row.key]: !c[row.key] }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-3.5">
            <ModalField
              label="Reason for change (required)"
              value={reason}
              onChange={setReason}
              placeholder="e.g. Buyer disputed a settlement default — also restricting withdrawals pending review"
            />
          </div>
        </AdminModal>
      ) : null}

      {modal === 'suspend' ? (
        <AdminModal
          title="Suspend Buyer"
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
                  dispatch(
                    updateRegulation({
                      id: item.id,
                      status: 'Suspended',
                      restrictBidding: true,
                      restrictWithdrawals: true,
                      auditEntry: stampAudit('Buyer suspended'),
                    }),
                  )
                  dispatch(showToast('Buyer suspended'))
                  setModal(null)
                }}
              >
                Suspend Buyer
              </AdminButton>
            </>
          }
        >
          <div className="flex flex-col gap-3.5">
            <ModalBannerLine tone="hold">
              This places a temporary hold on {item.buyer}'s bidding and funding. This is recorded in the audit trail.
            </ModalBannerLine>
            <ModalField
              label="Reason (required)"
              value={reason}
              onChange={setReason}
              placeholder="e.g. Suspicious bidding pattern under investigation"
            />
            <ModalField
              label="Internal note"
              value={note}
              onChange={setNote}
              placeholder="e.g. Flagged by fraud monitoring, awaiting compliance review"
            />
          </div>
        </AdminModal>
      ) : null}

      {modal === 'deactivate' ? (
        <AdminModal
          title="Deactivate Account"
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
                  dispatch(
                    updateRegulation({
                      id: item.id,
                      status: 'Deactivated',
                      restrictBidding: true,
                      restrictWithdrawals: true,
                      restrictDeposits: true,
                      complianceHold: true,
                      auditEntry: stampAudit('Buyer deactivated'),
                    }),
                  )
                  dispatch(showToast('Account deactivated'))
                  setModal(null)
                }}
              >
                Deactivate Account
              </AdminButton>
            </>
          }
        >
          <div className="flex flex-col gap-3.5">
            <ModalBannerLine tone="danger">
              This closes {item.buyer}'s account. They will be signed out immediately and will not be able to log in until
              an admin explicitly reactivates the account.
            </ModalBannerLine>
            <ModalField
              label="Reason (required)"
              value={reason}
              onChange={setReason}
              placeholder="e.g. Repeated settlement defaults, account closure requested by compliance"
            />
            <ModalField
              label="Internal note"
              value={note}
              onChange={setNote}
              placeholder="e.g. Escalated by Zainab Musa, see ticket SP-118 for context"
            />
          </div>
        </AdminModal>
      ) : null}

      {modal === 'reactivate' && !deactivated ? (
        <AdminModal
          title="Reactivate Buyer"
          maxWidth={440}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={!reason.trim()}
                onClick={() => {
                  dispatch(
                    updateRegulation({
                      id: item.id,
                      status: 'Active',
                      restrictBidding: false,
                      restrictWithdrawals: false,
                      restrictDeposits: false,
                      complianceHold: false,
                      complianceStatus: 'Clear',
                      auditEntry: stampAudit('Restrictions cleared'),
                    }),
                  )
                  dispatch(showToast('Buyer reactivated'))
                  setModal(null)
                }}
              >
                Reactivate Buyer
              </AdminButton>
            </>
          }
        >
          <div className="flex flex-col gap-3.5">
            <ModalBannerLine tone="success">
              {item.buyer} will regain full account access, including bidding, deposits, and withdrawals.
            </ModalBannerLine>
            <ModalField
              label="Reason (required)"
              value={reason}
              onChange={setReason}
              placeholder="e.g. KYC review completed, restriction no longer required"
            />
          </div>
        </AdminModal>
      ) : null}

      {modal === 'reactivate' && deactivated ? (
        <AdminModal
          title="Reactivate Account"
          maxWidth={460}
          onClose={() => setModal(null)}
          footer={
            <>
              <AdminButton variant="outline" onClick={() => setModal(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={!reason.trim() || !confirmChecked}
                onClick={() => {
                  dispatch(
                    updateRegulation({
                      id: item.id,
                      status: 'Active',
                      restrictBidding: false,
                      restrictWithdrawals: false,
                      restrictDeposits: false,
                      complianceHold: false,
                      complianceStatus: 'Clear',
                      auditEntry: stampAudit('Buyer reactivated'),
                    }),
                  )
                  dispatch(showToast('Account reactivated'))
                  setModal(null)
                }}
              >
                Reactivate Account
              </AdminButton>
            </>
          }
        >
          <div className="flex flex-col gap-3.5">
            <ModalBannerLine tone="neutral">
              {item.buyer}'s account is currently deactivated and cannot log in. Reactivating fully restores login access
              and lifts all regulation flags set at deactivation.
            </ModalBannerLine>
            <ModalField
              label="Reason for reactivation (required)"
              value={reason}
              onChange={setReason}
              placeholder="e.g. Reactivation request reviewed and approved — buyer confirmed identity"
            />
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-[#480516] accent-[#480516]"
              />
              <span className="text-[12px] leading-normal text-slate-700">
                I confirm I have reviewed this request and this buyer should regain account access.
              </span>
            </label>
          </div>
        </AdminModal>
      ) : null}
    </AdminDetailShell>
  )
}
