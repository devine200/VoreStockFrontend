import { useState } from 'react'
import { ADMIN_ANALYTICS } from '@/api/adminFixtures'
import {
  AdminAreaLineChart,
  AdminDonutChart,
  AdminTierBarChart,
} from '@/components/admin/AdminCharts'
import {
  AdminBadge,
  AdminFilter,
  AdminKpi,
  AdminPageHead,
  AdminRow,
  AdminTable,
  AdminTabs,
} from '@/components/admin/ui'
import type { AdminAnalyticsPanel } from '@/types/admin'

function AnalyticsPanel({ panel }: { panel: AdminAnalyticsPanel }) {
  if (panel.type === 'line' && panel.points) {
    return (
      <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-[18px] sm:px-5">
        <p className="mb-3 text-[14px] font-semibold text-slate-800">{panel.title}</p>
        <AdminAreaLineChart points={panel.points} />
      </div>
    )
  }
  if (panel.type === 'bar' && panel.points) {
    return (
      <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-[18px] sm:px-5">
        <p className="mb-3 text-[14px] font-semibold text-slate-800">{panel.title}</p>
        <AdminTierBarChart points={panel.points} />
      </div>
    )
  }
  if (panel.type === 'donut' && panel.slices) {
    return (
      <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-[18px] sm:px-5">
        <p className="mb-3 text-[14px] font-semibold text-slate-800">{panel.title}</p>
        <AdminDonutChart slices={panel.slices} />
      </div>
    )
  }
  if (panel.type === 'funnel' && panel.funnel) {
    return (
      <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-[18px] sm:px-5">
        <p className="mb-3 text-[14px] font-semibold text-slate-800">{panel.title}</p>
        <div className="divide-y divide-slate-100 sm:hidden">
          {panel.funnel.map((row) => (
            <div key={row.stage} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-medium text-slate-800">{row.stage}</p>
                <span className="text-[12px] font-medium text-slate-600">{row.count}</span>
              </div>
              <p className="mt-1 text-[11.5px] text-slate-500">Conversion · {row.conversion}</p>
            </div>
          ))}
        </div>
        <div className="hidden overflow-hidden rounded-lg border border-slate-200 sm:block">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.9fr)] border-b border-slate-200 bg-slate-50 px-3 py-3 text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:px-4">
            <span>Stage</span>
            <span>Count</span>
            <span>Conversion</span>
          </div>
          {panel.funnel.map((row) => (
            <div
              key={row.stage}
              className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.9fr)] border-b border-slate-100 px-3 py-3 text-[12px] last:border-b-0 sm:px-4"
            >
              <span className="font-medium text-slate-800">{row.stage}</span>
              <span className="text-slate-600">{row.count}</span>
              <span className="text-slate-500">{row.conversion}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function AdminAnalyticsPage() {
  const [tab, setTab] = useState(ADMIN_ANALYTICS[0].id)
  const [range, setRange] = useState('Last 30 days')
  const [tier, setTier] = useState('All')
  const current = ADMIN_ANALYTICS.find((t) => t.id === tab) ?? ADMIN_ANALYTICS[0]

  return (
    <div className="flex w-full max-w-full flex-col gap-5 animate-fade-in">
      <AdminPageHead title="Charts & analytics" subtitle={current.subtitle} />
      <AdminTabs tabs={ADMIN_ANALYTICS.map((t) => ({ id: t.id, label: t.label }))} value={tab} onChange={setTab} />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <AdminFilter value={range} options={['Last 30 days', 'Last 7 days', 'Last 90 days']} onChange={setRange} />
          <AdminFilter label="Tier" value={tier} options={['All', 'Tier 1', 'Tier 2', 'Tier 3']} onChange={setTier} />
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 hover:bg-slate-50 sm:w-auto"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M6.5 1v7M6.5 8l-2.5-2.5M6.5 8l2.5-2.5M2 11h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {current.kpis.map((kpi) => (
          <AdminKpi key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} hintTone={kpi.hintTone} />
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {current.panels.map((panel) => (
          <AnalyticsPanel key={panel.title} panel={panel} />
        ))}
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100 xl:hidden">
          {current.rows.map((row) => (
            <div key={`${row.a}-${row.b}`} className="px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-medium text-slate-800">{row.a}</p>
                <AdminBadge status={row.c} />
              </div>
              <p className="mt-1 text-[12px] text-slate-500">{row.b}</p>
              <p className="mt-1 text-[11.5px] text-slate-400">{row.d}</p>
            </div>
          ))}
        </div>
        <div className="hidden min-w-0 xl:block">
          <AdminTable embedded grid="1.2fr 1fr 0.8fr 0.8fr" headers={current.headers}>
            {current.rows.map((row) => (
              <AdminRow
                key={`${row.a}-${row.b}`}
                grid="1.2fr 1fr 0.8fr 0.8fr"
                columns={[
                  <span>{row.a}</span>,
                  <span className="text-slate-500">{row.b}</span>,
                  <AdminBadge status={row.c} />,
                  <span className="text-slate-500">{row.d}</span>,
                ]}
              />
            ))}
          </AdminTable>
        </div>
      </div>
    </div>
  )
}
