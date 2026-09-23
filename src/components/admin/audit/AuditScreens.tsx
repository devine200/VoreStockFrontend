import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AdminButton,
  AdminCard,
  AdminFilter,
  AdminKv,
  AdminSearch,
} from '@/components/admin/ui'
import {
  AdminDataTable,
  AdminDetailShell,
  AdminListShell,
  AdminNotFound,
  AdminTablePanel,
  matchesQuery,
} from '@/components/admin/screens'
import { useAppSelector } from '@/store/hooks'

const MODULES = [
  'All modules',
  'Sync & sources',
  'Shipments',
  'Orders',
  'Transactions',
  'Tiers',
  'Withdrawals',
  'Fees & pricing',
  'Referrals & rewards',
  'Regulation',
] as const

const ACTIONS = [
  'All actions',
  'Sync action performed',
  'Shipment status updated',
  'Order status updated',
  'Refund initiated',
  'Tier configuration changed',
  'Withdrawal approved',
  'Pricing configuration changed',
  'Buyer tier changed',
  'Referral reward reversed',
  'Buyer suspended',
  'Referral reward manually issued',
  'Withdrawal rejected',
  'Buyer deactivated',
  'Fee configuration changed',
  'Buyer reactivated',
] as const

/** Catalog size shown in Figma pager (fixtures are a page slice). */
const AUDIT_CATALOG_TOTAL = 58

export function AuditList() {
  const navigate = useNavigate()
  const rows = useAppSelector((s) => s.admin.audit)
  const [query, setQuery] = useState('')
  const [admin, setAdmin] = useState('All admins')
  const [module, setModule] = useState('All modules')
  const [action, setAction] = useState('All actions')
  const [date, setDate] = useState('Last 30 days')
  const [sort, setSort] = useState('Newest first')

  const filtered = useMemo(() => {
    const list = rows.filter((r) => {
      if (
        !matchesQuery(
          `${r.id} ${r.action} ${r.actor} ${r.module} ${r.record} ${r.change} ${r.reason}`,
          query,
        )
      ) {
        return false
      }
      if (admin !== 'All admins' && r.actor !== admin) return false
      if (module !== 'All modules' && r.module !== module) return false
      if (action !== 'All actions' && r.action !== action) return false
      return true
    })
    if (sort === 'Oldest first') return [...list].reverse()
    return list
  }, [rows, query, admin, module, action, sort])

  return (
    <AdminListShell
      title="Audit Log"
      subtitle="A read-only record of important admin actions and changes across BidBridge Africa."
    >
      <AdminTablePanel
        toolbar={
          <>
            <AdminSearch
              className="w-full sm:w-[240px]"
              value={query}
              onChange={setQuery}
              placeholder="Search record / ID"
            />
            <AdminFilter
              label="Admin"
              value={admin}
              onChange={setAdmin}
              options={['All admins', 'Ops Admin']}
            />
            <AdminFilter label="Module" value={module} onChange={setModule} options={[...MODULES]} />
            <AdminFilter label="Action" value={action} onChange={setAction} options={[...ACTIONS]} />
            <AdminFilter
              label="Date"
              value={date}
              onChange={setDate}
              options={['Last 30 days', 'Last 90 days', 'All time']}
            />
            <span className="hidden flex-1 lg:block" />
            <AdminFilter
              label="Sort"
              value={sort}
              onChange={setSort}
              options={['Newest first', 'Oldest first']}
            />
          </>
        }
      >
        <AdminDataTable
          embedded
          tall
          pageSize={16}
          noun="audit records"
          summary={`Showing ${filtered.length} of ${AUDIT_CATALOG_TOTAL} audit records`}
          rows={filtered}
          grid="1.15fr 0.85fr 1.2fr 0.95fr 1.05fr 1.2fr 1.5fr 56px"
          actionLabel="View"
          onRow={(r) => navigate(`/admin/audit/${r.id}`)}
          columns={[
            {
              header: 'Date/time',
              render: (r) => <span className="text-[12.5px] text-slate-700">{r.at}</span>,
            },
            {
              header: 'Admin',
              render: (r) => <span className="text-[13px] text-slate-800">{r.actor}</span>,
            },
            {
              header: 'Action',
              render: (r) => <span className="text-[12.5px] text-slate-800">{r.action}</span>,
            },
            {
              header: 'Module',
              render: (r) => <span className="text-[12.5px] text-slate-700">{r.module}</span>,
            },
            {
              header: 'Record',
              render: (r) => <span className="text-[12.5px] text-slate-700">{r.record}</span>,
            },
            {
              header: 'Change',
              render: (r) => <span className="text-[12.5px] leading-snug text-slate-700">{r.change}</span>,
            },
            {
              header: 'Reason',
              render: (r) => (
                <span className="line-clamp-2 text-[12.5px] leading-snug text-slate-600">{r.reason}</span>
              ),
            },
          ]}
        />
      </AdminTablePanel>
    </AdminListShell>
  )
}

export function AuditDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const item = useAppSelector((s) => s.admin.audit.find((r) => r.id === id))

  if (!item) return <AdminNotFound label="Back to Audit log" to="/admin/audit" />

  return (
    <AdminDetailShell
      backLabel="Back to Audit log"
      onBack={() => navigate('/admin/audit')}
      title={`Audit record — ${item.id}`}
      subtitle={item.action}
      actions={
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-600">
          {item.module}
        </span>
      }
    >
      <p className="inline-flex max-w-full items-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-[11.5px] text-slate-600">
        <span className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border border-slate-400 text-[8px] font-bold text-slate-500">
          i
        </span>
        Audit records are read-only. They cannot be edited or deleted.
      </p>

      <AdminCard className="space-y-2.5 px-6 py-5">
        <AdminKv label="Audit ID" value={item.id} tone="strong" />
        <AdminKv label="Date/time" value={item.at} tone="strong" />
        <AdminKv label="Admin / Actor" value={item.actor} tone="strong" />
        <AdminKv label="Module" value={item.module} tone="strong" />
        <AdminKv label="Action" value={item.action} tone="strong" />
        <AdminKv
          label="Related record"
          value={
            item.relatedTo ? (
              <button
                type="button"
                className="font-medium text-[#531424] hover:underline"
                onClick={() => navigate(item.relatedTo!)}
              >
                {item.relatedLabel}
              </button>
            ) : (
              item.relatedLabel
            )
          }
        />
      </AdminCard>

      <div className="flex flex-col gap-5 rounded-2xl bg-white p-6">
        <div>
          <p className="text-[15px] font-semibold text-slate-900">What changed</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-4">
            <div className="flex w-full max-w-[280px] flex-col gap-1.5 rounded-[10px] bg-slate-50 px-[18px] py-4 sm:w-[280px]">
              <p className="text-[11.5px] text-slate-500">Previous</p>
              <p className="text-[18px] font-semibold text-slate-600">{item.previous}</p>
            </div>
            <span className="flex size-7 items-center justify-center text-[18px] text-slate-400" aria-hidden>
              →
            </span>
            <div className="flex w-full max-w-[280px] flex-col gap-1.5 rounded-[10px] bg-slate-50 px-[18px] py-4 sm:w-[280px]">
              <p className="text-[11.5px] text-slate-500">New</p>
              <p className="text-[18px] font-semibold text-emerald-700">{item.next}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[13.5px] font-semibold text-slate-900">Reason</p>
            <div className="mt-2 rounded-lg bg-slate-50 px-3.5 py-3">
              <p className="text-[12.5px] text-slate-800">{item.reason}</p>
            </div>
        </div>

        {item.internalNote ? (
          <div>
            <p className="text-[13.5px] font-semibold text-slate-900">Internal note</p>
            <div className="mt-2 rounded-lg bg-slate-50 px-3.5 py-3">
              <p className="text-[12.5px] text-slate-800">{item.internalNote}</p>
            </div>
          </div>
        ) : null}

        {item.relatedTo ? (
          <div>
            <AdminButton onClick={() => navigate(item.relatedTo!)}>Open related record</AdminButton>
          </div>
        ) : null}
      </div>
    </AdminDetailShell>
  )
}
