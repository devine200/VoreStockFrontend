import { useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ADMIN_ANALYTICS } from '@/api/adminAnalytics'
import {
  AdminAreaLineChart,
  AdminDonutChart,
  AdminDualLineChart,
  AdminTierBarChart,
} from '@/components/admin/AdminCharts'
import {
  AdminBadge,
  AdminButton,
  AdminFilter,
  AdminModal,
  AdminPageHead,
  AdminTabs,
} from '@/components/admin/ui'
import { Icon } from '@/components/shared/Icon'
import { adminIcons } from '@/assets/admin'
import { useAppDispatch } from '@/store/hooks'
import { showToast } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'
import type {
  AnalyticsChartPanel,
  AnalyticsFeeBar,
  AnalyticsKpi,
  AnalyticsTable,
  AnalyticsTableRow,
} from '@/types/admin'

const RANGE_FACTOR: Record<string, number> = {
  'Last 7 days': 0.28,
  'Last 30 days': 1,
  'Last 90 days': 2.6,
}

const TIER_FACTOR: Record<string, number> = {
  All: 1,
  'Tier 1': 0.62,
  'Tier 2': 0.29,
  'Tier 3': 0.1,
}

const REVENUE_RANGE_FACTOR: Record<string, number> = {
  Today: 0.04,
  '7D': 0.24,
  '30D': 1,
  '90D': 3,
  Custom: 1,
}

const REVENUE_SOURCES = ['All', 'Buyer Service Fees', 'Processing Fees', 'B-Stock Markup', 'Freight / Logistics Revenue', 'Other']

function scaleNumber(value: number, factor: number) {
  if (factor === 1) return value
  const scaled = value * factor
  return Number.isInteger(value) ? Math.max(0, Math.round(scaled)) : Math.round(scaled * 10) / 10
}

function scaleKpiValue(value: string, factor: number) {
  if (factor === 1) return value
  const money = value.match(/^-?\$([\d,]+)$/)
  if (money) {
    const n = Number(money[1].replace(/,/g, ''))
    const sign = value.startsWith('-') ? '-' : ''
    return `${sign}$${scaleNumber(n, factor).toLocaleString('en-US')}`
  }
  if (/^[\d,.]+$/.test(value)) {
    const n = Number(value.replace(/,/g, ''))
    return scaleNumber(n, factor).toLocaleString('en-US')
  }
  return value
}

function scaleKpis(kpis: AnalyticsKpi[], factor: number): AnalyticsKpi[] {
  return kpis.map((kpi) => ({ ...kpi, value: scaleKpiValue(kpi.value, factor) }))
}

function scalePanel(panel: AnalyticsChartPanel, factor: number): AnalyticsChartPanel {
  if (panel.kind === 'line') {
    return { ...panel, points: panel.points.map((p) => ({ ...p, value: scaleNumber(p.value, factor) })) }
  }
  if (panel.kind === 'bar') {
    return { ...panel, points: panel.points.map((p) => ({ ...p, value: scaleNumber(p.value, factor) })) }
  }
  if (panel.kind === 'dual-line') {
    return {
      ...panel,
      points: panel.points.map((p) => ({ ...p, a: scaleNumber(p.a, factor), b: scaleNumber(p.b, factor) })),
    }
  }
  if (panel.kind === 'fees') {
    return {
      ...panel,
      items: panel.items.map((item) => ({
        ...item,
        amount: scaleNumber(item.amount, factor),
        value: scaleKpiValue(item.value, factor),
      })),
    }
  }
  if (panel.kind === 'stats') {
    return {
      ...panel,
      items: panel.items.map((item) => ({ ...item, value: scaleKpiValue(item.value, factor) })),
    }
  }
  if (panel.kind === 'table') {
    return {
      ...panel,
      table: {
        ...panel.table,
        rows: panel.table.rows.map((row) => ({
          ...row,
          cells: row.cells.map((cell) => scaleKpiValue(cell, factor)),
        })),
      },
    }
  }
  if (panel.kind === 'funnel') {
    return {
      ...panel,
      funnel: panel.funnel.map((row) => ({ ...row, count: scaleNumber(row.count, factor) })),
    }
  }
  return panel
}

function revenueTrendPoints(
  grain: 'Daily' | 'Weekly' | 'Monthly',
  points: { label: string; a: number; b: number }[],
) {
  if (grain === 'Daily') return points
  if (grain === 'Weekly') {
    return ['W1', 'W2', 'W3', 'W4'].map((label, i) => {
      const first = points[i * 2]
      const second = points[i * 2 + 1]
      return {
        label,
        a: (first?.a ?? 0) + (second?.a ?? 0),
        b: (first?.b ?? 0) + (second?.b ?? 0),
      }
    })
  }
  return [
    { label: 'May', a: 82000, b: 71000 },
    { label: 'Jun', a: 91000, b: 80000 },
    { label: 'Jul', a: 108000, b: 94000 },
    { label: 'Aug', a: 129400, b: 115000 },
  ]
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function downloadCsv(filename: string, rows: string[][]) {
  const body = rows.map((row) => row.map(csvEscape).join(',')).join('\n')
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function SegControl({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-slate-100 p-[3px] scrollbar-none">
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'h-auto shrink-0 rounded-md px-3 py-1.5 text-[11.5px] leading-[normal]',
              active ? 'bg-white font-medium text-maroon-600 shadow-[0px_1px_2px_rgba(0,0,0,0.06)]' : 'font-normal text-slate-500',
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function AnalyticsKpiCard({ kpi, flush }: { kpi: AnalyticsKpi; flush?: boolean }) {
  const hintColor = {
    warning: 'text-amber-700',
    success: 'text-emerald-600',
    danger: 'text-red-600',
    info: 'text-blue-700',
    muted: 'text-slate-400',
  }[kpi.hintTone ?? 'muted']
  return (
    <div className={cn('flex min-w-0 flex-col gap-[5px] rounded-xl bg-white', flush ? 'p-4' : 'border border-slate-200 px-[18px] py-4')}>
      <p className={cn('text-[12px] leading-[normal] text-slate-500', flush ? 'font-normal' : 'font-bold')}>{kpi.label}</p>
      <p className={cn('font-semibold text-slate-900', flush ? 'text-[20px] leading-[26px]' : 'text-[21px] leading-[26px]')}>
        {kpi.value}
      </p>
      {kpi.hint ? <p className={cn('text-[11px] leading-[14px]', flush ? 'font-normal' : 'font-bold', hintColor)}>{kpi.hint}</p> : null}
    </div>
  )
}

function ChartCard({
  title,
  caption,
  children,
  extra,
  flush,
  hideHeader,
}: {
  title?: string
  caption?: string
  children: ReactNode
  extra?: ReactNode
  flush?: boolean
  hideHeader?: boolean
}) {
  return (
    <div className={cn('min-w-0 rounded-xl bg-white px-5 py-[18px]', !flush && 'border border-slate-200')}>
      {!hideHeader && (title || extra) ? (
        <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <p className="text-[13.5px] font-semibold leading-[normal] text-slate-800">{title}</p> : null}
            {caption ? <p className="mt-1 text-[11.5px] font-bold leading-[normal] text-slate-500">{caption}</p> : null}
          </div>
          {extra}
        </div>
      ) : null}
      {children}
    </div>
  )
}

function SectionLabel({
  title,
  caption,
  extra,
  quiet,
}: {
  title?: string
  caption?: string
  extra?: ReactNode
  quiet?: boolean
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {title ? <p className={cn('text-[14px] font-semibold leading-[normal]', quiet ? 'text-slate-900' : 'text-slate-800')}>{title}</p> : null}
        {caption ? <p className={cn('mt-0.5 text-[11.5px] leading-[normal] text-slate-500', quiet ? 'font-normal' : 'font-bold')}>{caption}</p> : null}
      </div>
      {extra}
    </div>
  )
}

function DualLegend({ names, dashedB, bColor }: { names: [string, string]; dashedB?: boolean; bColor?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[12px] font-bold leading-[normal] text-slate-600">
      <span className="inline-flex items-center gap-[6px]">
        <span className="size-2 shrink-0 rounded-full bg-[#531424]" />
        {names[0]}
      </span>
      <span className="inline-flex items-center gap-[6px]">
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: dashedB ? '#94a3b8' : bColor ?? '#a7878f' }} />
        {names[1]}
      </span>
    </div>
  )
}

function FeeBars({ items, compact }: { items: AnalyticsFeeBar[]; compact?: boolean }) {
  const max = Math.max(...items.map((item) => item.amount), 1)
  return (
    <div className="flex flex-col gap-3.5">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3 text-[12.5px] leading-[normal]">
            <span className={cn(compact ? 'font-bold text-slate-800' : 'font-medium text-slate-700')}>{item.label}</span>
            <span className={cn(compact ? 'font-bold text-slate-800' : 'font-medium text-slate-800')}>{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-[4px] bg-slate-100">
            <div
              className="h-full rounded-[4px] bg-[#531424]"
              style={{ width: compact ? `${Math.max(8, (item.amount / max) * 100)}px` : `${Math.max(2, (item.amount / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalyticsTableBlock({
  table,
  onView,
  flush,
  section,
  nested,
}: {
  table: AnalyticsTable
  onView?: (row: AnalyticsTableRow) => void
  flush?: boolean
  section?: boolean
  nested?: boolean
}) {
  const body = (
    <>
      <div className="divide-y divide-slate-100 xl:hidden">
        {table.rows.map((row, i) => (
          <div key={`${row.cells[0]}-${i}`} className="px-5 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[12.5px] font-semibold text-slate-800">{row.cells[0]}</p>
              {row.viewKey ? (
                <button type="button" className="text-[11.5px] font-medium text-maroon-600 hover:underline" onClick={() => onView?.(row)}>
                  View
                </button>
              ) : row.badgeAt?.length ? (
                <AdminBadge status={row.cells[row.badgeAt[0]]} />
              ) : null}
            </div>
            {table.headers.slice(1, -Number(Boolean(row.viewKey))).map((header, idx) => {
              const cell = row.cells[idx + 1]
              if (!cell || (row.viewKey && header === '')) return null
              if (row.badgeAt?.includes(idx + 1)) return null
              const danger = row.dangerAt?.includes(idx + 1)
              const success = row.successAt?.includes(idx + 1)
              return (
                <p key={header} className={cn('mt-1 text-[11.5px]', danger ? 'text-red-600' : success ? 'text-emerald-600' : 'text-slate-500')}>
                  {header} · {cell}
                </p>
              )
            })}
          </div>
        ))}
      </div>
      <div className="hidden min-w-0 xl:block">
        <div className={cn('grid items-center border-b border-slate-200 bg-slate-50 text-[10px] leading-[normal] uppercase tracking-wide text-slate-400', flush ? 'px-6 py-2.5 font-medium' : 'px-4 py-3 font-bold')} style={{ gridTemplateColumns: table.grid }}>
          {table.headers.map((header) => (
            <div key={header || 'view'}>{header}</div>
          ))}
        </div>
        {table.rows.map((row, i) => (
          <div
            key={`${row.cells[0]}-${i}`}
            className={cn('grid items-center border-b border-slate-100 py-[11px] last:border-b-0', flush ? 'px-6' : 'px-4')}
            style={{ gridTemplateColumns: table.grid }}
          >
            {row.cells.map((cell, idx) => {
              if (row.viewKey && idx === row.cells.length - 1) {
                return (
                  <button key={idx} type="button" className="text-left text-[11.5px] font-medium text-maroon-600 hover:underline" onClick={() => onView?.(row)}>
                    View
                  </button>
                )
              }
              if (row.badgeAt?.includes(idx)) return <div key={idx}><AdminBadge status={cell} /></div>
              const danger = row.dangerAt?.includes(idx)
              const success = row.successAt?.includes(idx)
              return (
                <div
                  key={idx}
                  className={cn(
                    'min-w-0 pr-2 text-[12.5px] leading-[normal]',
                    danger ? 'font-medium text-red-600' : success ? 'font-medium text-emerald-600' : flush ? 'font-medium text-slate-800' : 'font-bold text-slate-700',
                  )}
                >
                  {cell}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )

  if (nested) {
    return (
      <ChartCard title={table.title} caption={table.subtitle} flush={flush}>
        <div className="overflow-hidden rounded-xl border border-slate-200">{body}</div>
      </ChartCard>
    )
  }

  const card = (
    <div className={cn('min-w-0 overflow-hidden rounded-xl bg-white', !flush && 'border border-slate-200')}>
      {!section && (table.title || table.subtitle) ? (
        <div className="px-5 pt-[18px] pb-3">
          {table.title ? <p className="text-[13.5px] font-semibold leading-[normal] text-slate-800">{table.title}</p> : null}
          {table.subtitle ? <p className="mt-1 text-[12px] text-slate-400">{table.subtitle}</p> : null}
        </div>
      ) : null}
      {body}
    </div>
  )

  if (section && (table.title || table.subtitle)) {
    return (
      <div className="flex flex-col gap-4">
        <SectionLabel title={table.title} caption={table.subtitle} quiet={flush} />
        {card}
      </div>
    )
  }

  return card
}

function FunnelTable({
  title,
  funnel,
}: {
  title: string
  funnel: { stage: string; count: number; conversion: string }[]
}) {
  return (
    <ChartCard title={title}>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[minmax(0,200px)_minmax(0,120px)_minmax(0,1fr)] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-bold leading-[normal] uppercase tracking-wide text-slate-400">
          <span>Stage</span>
          <span>Count</span>
          <span>Conversion</span>
        </div>
        {funnel.map((row) => (
          <div
            key={row.stage}
            className="grid grid-cols-[minmax(0,200px)_minmax(0,120px)_minmax(0,1fr)] border-b border-slate-100 px-4 py-[11px] text-[12.5px] leading-[normal] last:border-b-0"
          >
            <span className="font-bold text-slate-700">{row.stage}</span>
            <span className="font-bold text-slate-800">{row.count}</span>
            <span className="font-bold text-[12px] text-slate-500">{row.conversion}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

function AnalyticsPanelView({
  panel,
  extra,
  onView,
  flush,
  inSplit,
}: {
  panel: AnalyticsChartPanel
  extra?: ReactNode
  onView?: (row: AnalyticsTableRow) => void
  flush?: boolean
  inSplit?: boolean
}) {
  if (panel.kind === 'line') {
    return (
      <ChartCard title={panel.title} caption={panel.caption} extra={extra} flush={flush}>
        <AdminAreaLineChart points={panel.points} yFormat={panel.yFormat} height={extra ? 220 : 200} />
      </ChartCard>
    )
  }
  if (panel.kind === 'dual-line') {
    return (
      <div className="flex flex-col gap-4">
        <SectionLabel title={panel.title} caption={panel.caption} extra={extra} quiet={flush} />
        <ChartCard flush={flush} hideHeader>
          <div className="mb-3.5">
            <DualLegend names={panel.legend} dashedB={panel.dashedB} bColor={panel.bColor} />
          </div>
          <AdminDualLineChart
            points={panel.points}
            names={panel.legend}
            yFormat={panel.yFormat}
            dashedB={panel.dashedB}
            filledDots={panel.filledDots}
            bColor={panel.bColor}
            height={flush ? 250 : 200}
          />
        </ChartCard>
      </div>
    )
  }
  if (panel.kind === 'bar') {
    return (
      <ChartCard title={panel.title} caption={panel.caption} flush={flush}>
        <AdminTierBarChart points={panel.points} colors={panel.colors} cutoffAt={panel.cutoffAt} wrapTicks={panel.wrapTicks} height={panel.full ? 220 : 190} />
      </ChartCard>
    )
  }
  if (panel.kind === 'donut') {
    return (
      <ChartCard title={panel.title} flush={flush}>
        <AdminDonutChart slices={panel.slices} />
      </ChartCard>
    )
  }
  if (panel.kind === 'funnel') {
    return <FunnelTable title={panel.title} funnel={panel.funnel} />
  }
  if (panel.kind === 'table') {
    return <AnalyticsTableBlock table={panel.table} onView={onView} flush={flush} section={!inSplit} nested={inSplit} />
  }
  if (panel.kind === 'fees') {
    return (
      <div className="flex flex-col gap-4">
        <SectionLabel title={panel.title} caption={panel.subtitle} quiet={flush} />
        <ChartCard flush={flush} hideHeader>
          <FeeBars items={panel.items} compact={panel.compact} />
        </ChartCard>
      </div>
    )
  }
  if (panel.kind === 'stats') {
    return (
      <div className={cn('flex flex-col', flush ? 'gap-3' : 'gap-0')}>
        {flush ? <SectionLabel title={panel.title} caption={panel.subtitle} quiet /> : null}
        <ChartCard title={flush ? undefined : panel.title} caption={flush ? undefined : panel.subtitle} flush={flush} hideHeader={flush}>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {panel.items.slice(0, 3).map((item) => (
                <div key={item.label}>
                  <p className="text-[12px] text-slate-500">{item.label}</p>
                  <p
                    className={cn(
                      'mt-1 text-[19px] font-semibold',
                      item.tone === 'danger' ? 'text-red-600' : item.tone === 'success' ? 'text-emerald-700' : 'text-slate-900',
                    )}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-px bg-slate-100" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {panel.items.slice(3).map((item) => (
                <div key={item.label}>
                  <p className="text-[12px] text-slate-500">{item.label}</p>
                  <p className="mt-1 text-[19px] font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
    )
  }
  return null
}

export function AdminAnalyticsPage() {
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()
  const tabId = params.get('tab') ?? ADMIN_ANALYTICS[0].id
  const current = ADMIN_ANALYTICS.find((t) => t.id === tabId) ?? ADMIN_ANALYTICS[0]
  const [range, setRange] = useState('Last 30 days')
  const [tier, setTier] = useState('All')
  const [revenueRange, setRevenueRange] = useState('30D')
  const [revenueGrain, setRevenueGrain] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily')
  const [source, setSource] = useState('All')
  const [orderStatus, setOrderStatus] = useState('All')
  const [viewRow, setViewRow] = useState<AnalyticsTableRow | null>(null)

  const factor = useMemo(() => {
    if (current.filters === 'revenue') {
      const base = REVENUE_RANGE_FACTOR[revenueRange] ?? 1
      const statusFactor = orderStatus === 'Refunded' ? 0.82 : 1
      return base * (TIER_FACTOR[tier] ?? 1) * statusFactor
    }
    const rangeFactor = RANGE_FACTOR[range] ?? 1
    const tierFactor = current.filters === 'range+tier' ? TIER_FACTOR[tier] ?? 1 : 1
    return rangeFactor * tierFactor
  }, [current.filters, orderStatus, range, revenueRange, tier])

  const kpis = useMemo(() => scaleKpis(current.kpis, factor), [current.kpis, factor])

  const blocks = useMemo(() => {
    return current.blocks.map((block) => {
      if (block.type === 'split') {
        return { ...block, left: scalePanel(block.left, factor), right: scalePanel(block.right, factor) }
      }
      let panel = scalePanel(block.panel, factor)
      if (current.id === 'revenue' && panel.kind === 'dual-line') {
        panel = { ...panel, points: revenueTrendPoints(revenueGrain, panel.points) }
      }
      if (current.id === 'revenue' && source !== 'All') {
        if (panel.kind === 'fees') {
          panel = { ...panel, items: panel.items.filter((item) => item.label.includes(source.replace(' Revenue', '')) || item.label === source) }
        }
        if (panel.kind === 'table' && panel.table.title === 'Revenue by source') {
          panel = { ...panel, table: { ...panel.table, rows: panel.table.rows.filter((row) => row.cells[0] === source) } }
        }
      }
      return { ...block, panel }
    })
  }, [current.blocks, current.id, factor, revenueGrain, source])

  const setTab = (id: string) => {
    const next = new URLSearchParams(params)
    next.set('tab', id)
    setParams(next, { replace: true })
  }

  const exportCsv = () => {
    const rows: string[][] = [[current.label], [], ['Metric', 'Value', 'Hint'], ...kpis.map((kpi) => [kpi.label, kpi.value, kpi.hint])]
    current.blocks.forEach((block) => {
      const panels = block.type === 'split' ? [block.left, block.right] : [block.panel]
      panels.forEach((panel) => {
        if (panel.kind === 'table') {
          rows.push([], [panel.table.title ?? 'Table'], panel.table.headers.filter(Boolean), ...panel.table.rows.map((row) => row.cells.filter((cell) => cell !== 'View')))
        }
      })
    })
    downloadCsv(`analytics-${current.id}.csv`, rows)
    dispatch(showToast(`Exported ${current.label} analytics`))
  }

  const onRevenueRange = (value: string) => {
    if (value === 'Custom') {
      dispatch(showToast("Custom range isn't available in the demo"))
      return
    }
    setRevenueRange(value)
  }

  return (
    <div className="flex w-full max-w-full flex-col gap-4 animate-fade-in">
      <AdminPageHead title="Charts & Analytics" subtitle={current.subtitle} subtitleBold={current.filters !== 'revenue'} />
      <AdminTabs tabs={ADMIN_ANALYTICS.map((t) => ({ id: t.id, label: t.label }))} value={current.id} onChange={setTab} quiet={current.filters === 'revenue'} />

      {current.filters === 'revenue' ? (
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <SegControl options={['Today', '7D', '30D', '90D', 'Custom']} value={revenueRange} onChange={onRevenueRange} />
            <AdminFilter compact quiet label="Source" value={source} options={REVENUE_SOURCES} onChange={setSource} />
            <AdminFilter compact quiet label="Order status" value={orderStatus} options={['All', 'Paid', 'Refunded']} onChange={setOrderStatus} />
            <AdminFilter compact quiet label="Tier" value={tier} options={['All', 'Tier 1', 'Tier 2', 'Tier 3']} onChange={setTier} />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-8 items-center justify-center gap-[6px] rounded-lg border border-slate-200 bg-white py-2 pr-[14px] pl-3 text-[12.5px] font-medium leading-[normal] text-slate-700 hover:bg-slate-50 sm:w-auto w-full"
          >
            <Icon src={adminIcons.exportCsv} size={13} />
            Export CSV
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <AdminFilter compact value={range} options={['Last 30 days', 'Last 7 days', 'Last 90 days']} onChange={setRange} />
            {current.filters === 'range+tier' ? (
              <AdminFilter compact label="Tier" value={tier} options={['All', 'Tier 1', 'Tier 2', 'Tier 3']} onChange={setTier} />
            ) : null}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-8 items-center justify-center gap-[6px] rounded-lg border border-slate-200 bg-white py-2 pr-[14px] pl-3 text-[12.5px] font-bold leading-[normal] text-slate-700 hover:bg-slate-50 sm:w-auto w-full"
          >
            <Icon src={adminIcons.exportCsv} size={13} />
            Export CSV
          </button>
        </div>
      )}

      <div
        className={cn(
          'grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2',
          current.kpiCount === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4',
        )}
      >
        {kpis.map((kpi) => (
          <AnalyticsKpiCard key={kpi.label} kpi={kpi} flush={current.chrome === 'flush'} />
        ))}
      </div>

      {blocks.map((block, i) => {
        const flush = current.chrome === 'flush'
        if (block.type === 'split') {
          return (
            <div key={`${current.id}-split-${i}`} className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
              <AnalyticsPanelView panel={block.left} onView={setViewRow} flush={flush} inSplit />
              <AnalyticsPanelView panel={block.right} onView={setViewRow} flush={flush} inSplit />
            </div>
          )
        }
        const extra =
          current.id === 'revenue' && block.panel.kind === 'dual-line' ? (
            <SegControl options={['Daily', 'Weekly', 'Monthly']} value={revenueGrain} onChange={(v) => setRevenueGrain(v as typeof revenueGrain)} />
          ) : undefined
        return (
          <AnalyticsPanelView
            key={`${current.id}-full-${i}`}
            panel={block.panel}
            extra={extra}
            onView={setViewRow}
            flush={flush}
          />
        )
      })}

      {viewRow ? (
        <AdminModal
          title={viewRow.viewKey ?? viewRow.cells[0]}
          onClose={() => setViewRow(null)}
          footer={
            <AdminButton variant="outline" onClick={() => setViewRow(null)}>
              Close
            </AdminButton>
          }
        >
          <dl className="grid grid-cols-1 gap-3">
            {['Revenue source', 'Transactions', 'Gross revenue', 'Refunds', 'Net revenue', '% of total'].map((label, idx) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0">
                <dt className="text-[12px] text-slate-500">{label}</dt>
                <dd className="text-[13px] font-semibold text-slate-800">{viewRow.cells[idx]}</dd>
              </div>
            ))}
          </dl>
        </AdminModal>
      ) : null}
    </div>
  )
}
