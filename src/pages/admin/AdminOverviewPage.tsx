import { useNavigate } from 'react-router-dom'
import {
  ADMIN_ACTIVITY,
  ADMIN_DEPOSITS_BIDS_CHART,
  ADMIN_NEEDS_ATTENTION,
  ADMIN_OVERVIEW_KPIS,
  ADMIN_PRIORITY,
  ADMIN_QUEUE_CARDS,
} from '@/api/adminFixtures'
import { adminIcons } from '@/assets/admin'
import { AdminComboBarChart } from '@/components/admin/AdminCharts'
import { AdminBadge, AdminPageHead, AdminRow, AdminTable } from '@/components/admin/ui'
import { Icon } from '@/components/shared/Icon'
import { cn } from '@/utils/format'
import { useAppSelector } from '@/store/hooks'

const queueIcon = {
  verification: adminIcons.queueVerification,
  settlements: adminIcons.queueSettlements,
  proxy: adminIcons.queueProxy,
  withdrawals: adminIcons.navWithdrawals,
  tpl: adminIcons.queue3pl,
  support: adminIcons.queueSupport,
}

const hintColor = {
  warning: 'text-amber-700',
  success: 'text-emerald-700',
  danger: 'text-red-700',
  info: 'text-blue-700',
  muted: 'text-slate-500',
} as const

export function AdminOverviewPage() {
  const navigate = useNavigate()
  const verifications = useAppSelector((s) => s.admin.verifications)
  const settlements = useAppSelector((s) => s.admin.settlements)
  const proxies = useAppSelector((s) => s.admin.proxies)
  const withdrawals = useAppSelector((s) => s.admin.withdrawals)
  const tpl = useAppSelector((s) => s.admin.tpl)
  const tickets = useAppSelector((s) => s.admin.tickets)

  const counts: Record<string, number> = {
    verification: verifications.filter((v) => v.status === 'Pending').length,
    settlements: settlements.filter((s) => s.status === 'Pending' || s.status === 'Overdue').length,
    proxy: proxies.filter((p) => p.status === 'Active').length,
    withdrawals: withdrawals.filter((w) => w.status === 'Pending').length,
    tpl: tpl.filter((t) => t.status === 'Pending' || t.status === 'Failed').length,
    support: tickets.filter((t) => t.status === 'Open').length,
  }

  return (
    <div className="flex w-full max-w-full flex-col gap-5 animate-fade-in">
      <AdminPageHead
        title="Overview"
        subtitle="Is the platform healthy, and what needs you right now."
      />

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_OVERVIEW_KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="relative min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-[18px]"
          >
            {kpi.dot === 'maroon' ? (
              <span className="absolute right-4 top-4 size-2 rounded-full bg-maroon-600 sm:right-[18px]" />
            ) : null}
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{kpi.label}</p>
            <p className="mt-1 text-[20px] font-semibold leading-[26px] text-slate-900">{kpi.value}</p>
            {kpi.hint ? (
              <p className={cn('mt-1.5 text-[12px] leading-[14px]', hintColor[kpi.hintTone ?? 'muted'])}>
                {kpi.hint}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-[18px] sm:px-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500" />
            <p className="text-[14px] font-semibold text-slate-800">Needs attention</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {ADMIN_NEEDS_ATTENTION.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.to)}
                className="flex flex-col gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-left sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-1 text-[13px] sm:flex-row sm:items-center sm:gap-2">
                  <span className="font-medium text-amber-700">{item.category}</span>
                  <span className="hidden text-slate-300 sm:inline">|</span>
                  <span className="font-medium text-slate-800 sm:truncate">{item.detail}</span>
                </div>
                <Icon src={adminIcons.chevronWarn} size={14} className="shrink-0 self-end sm:self-auto" />
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-[18px] sm:px-5">
          <div className="mb-3 flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-[14px] font-semibold text-slate-800">Last 7 days · deposits vs bids</p>
            <button type="button" className="text-[12px] font-medium text-maroon-600 hover:underline">
              View all
            </button>
          </div>
          <AdminComboBarChart points={ADMIN_DEPOSITS_BIDS_CHART} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-[14px] font-semibold text-slate-800">Work queues</p>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ADMIN_QUEUE_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => navigate(card.to)}
              className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 pb-4 pt-[18px] text-left hover:border-maroon-200 sm:px-5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={
                    card.tone === 'amber'
                      ? 'flex size-[38px] items-center justify-center rounded-[10px] bg-amber-50'
                      : 'flex size-[38px] items-center justify-center rounded-[10px] bg-maroon-50'
                  }
                >
                  <Icon src={queueIcon[card.icon]} size={19} />
                </span>
                <span className="text-[26px] font-semibold text-slate-900">{counts[card.id] ?? card.count}</span>
              </div>
              <p className="text-[13.5px] font-semibold text-slate-800">{card.title}</p>
              <p className="text-[11.5px] leading-normal text-slate-500">{card.description}</p>
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-maroon-600">
                Open queue
                <Icon src={adminIcons.chevronOpen} size={12} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-[18px] sm:px-5">
        <p className="mb-2.5 text-[14px] font-semibold text-slate-800">Priority items</p>
        <div className="flex flex-col gap-2.5">
          {ADMIN_PRIORITY.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.to)}
              className={
                item.tone === 'urgent'
                  ? 'flex flex-col gap-3 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between'
                  : 'flex flex-col gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between'
              }
            >
              <div className="flex min-w-0 flex-col gap-[3px]">
                <div className="flex items-center gap-2">
                  <p className={item.tone === 'urgent' ? 'text-[11.5px] font-medium text-red-700' : 'text-[11.5px] font-medium text-amber-700'}>
                    {item.label}
                  </p>
                  <AdminBadge kind={item.tone === 'urgent' ? 'danger' : 'warning'}>
                    {item.tone === 'urgent' ? 'Urgent' : 'Approaching'}
                  </AdminBadge>
                </div>
                <p className="text-[13px] font-medium text-slate-800">{item.title}</p>
                <p className="text-[11.5px] text-slate-500">{item.detail}</p>
              </div>
              <Icon src={item.tone === 'urgent' ? adminIcons.chevronUrgent : adminIcons.chevronWarn} size={14} className="shrink-0 self-end sm:self-auto" />
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-[18px] sm:px-5">
        <div className="mb-2.5">
          <p className="text-[15px] font-semibold text-slate-800">Recent activity</p>
          <p className="text-[12px] text-slate-500">Latest platform and admin activity.</p>
        </div>

        <div className="divide-y divide-slate-100 xl:hidden">
          {ADMIN_ACTIVITY.map((row) => (
            <div key={row.id} className="py-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-medium text-slate-800">{row.activity}</p>
                <AdminBadge status={row.status} />
              </div>
              <p className="mt-1 text-[12px] text-slate-500">{row.reference}</p>
              <p className="mt-1 text-[11.5px] text-slate-400">{row.at}</p>
            </div>
          ))}
        </div>

        <div className="hidden min-w-0 xl:block">
          <AdminTable embedded grid="1.4fr 1.2fr 0.8fr 0.9fr" headers={['ACTIVITY', 'REFERENCE', 'STATUS', 'DATE / TIME']}>
            {ADMIN_ACTIVITY.map((row) => (
              <AdminRow
                key={row.id}
                grid="1.4fr 1.2fr 0.8fr 0.9fr"
                columns={[
                  <span className="text-slate-700">{row.activity}</span>,
                  <span className="text-slate-500">{row.reference}</span>,
                  <AdminBadge status={row.status} />,
                  <span className="text-[11.5px] text-slate-400">{row.at}</span>,
                ]}
              />
            ))}
          </AdminTable>
        </div>
      </div>
    </div>
  )
}
