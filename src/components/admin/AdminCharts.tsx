import { useId } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const MAROON = '#531424'
const MAROON_LIGHT = '#a7878f'
const GRID = '#e5e5eb'
const AXIS = '#94a3b8'
const AREA_FILL = '#e8e2e4'

type Point = { label: string; value: number }
type SeriesPoint = { label: string; deposits?: number; bids?: number; value?: number }
type DonutSlice = { label: string; value: number; color: string }

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; name?: string; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-[12px] font-semibold text-slate-800" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

function formatAxis(value: number, format?: 'number' | 'money' | 'days') {
  if (format === 'money') {
    const k = value / 1000
    if (k === 0) return '$0k'
    if (Math.abs(value) >= 1000) {
      return `$${Number.isInteger(k) ? k : k.toFixed(1)}k`
    }
    return `$${value}`
  }
  return `${value}`
}

export function AdminWeeklyBarChart({
  points,
  height = 202,
}: {
  points: Point[]
  height?: number
}) {
  const data = points.map((p) => ({ name: p.label, value: p.value }))
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barCategoryGap="18%">
          <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: AXIS, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            dy={4}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: AXIS, fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(83,20,36,0.04)' }} />
          <Bar dataKey="value" fill={MAROON} radius={[2, 2, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AdminAreaLineChart({
  points,
  height = 200,
  yFormat,
}: {
  points: Point[]
  height?: number
  yFormat?: 'number' | 'money' | 'days'
}) {
  const fillId = useId().replace(/:/g, '')
  const data = points.map((p) => ({ name: p.label, value: p.value }))
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={AREA_FILL} stopOpacity={1} />
              <stop offset="100%" stopColor={AREA_FILL} stopOpacity={0.92} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 9.5, fontWeight: 700 }} axisLine={false} tickLine={false} dy={6} />
          <YAxis
            tick={{ fill: AXIS, fontSize: 9.5, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v) => formatAxis(Number(v), yFormat)}
            domain={[0, 'auto']}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            name="Value"
            stroke={MAROON}
            strokeWidth={2}
            fill={`url(#${fillId})`}
            dot={{ r: 3, fill: '#fff', stroke: MAROON, strokeWidth: 1.5 }}
            activeDot={{ r: 4, fill: '#fff', stroke: MAROON, strokeWidth: 1.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AdminDualLineChart({
  points,
  height = 200,
  names = ['Series A', 'Series B'],
  yFormat,
  dashedB,
  filledDots,
  bColor,
}: {
  points: { label: string; a: number; b: number }[]
  height?: number
  names?: [string, string]
  yFormat?: 'number' | 'money' | 'days'
  dashedB?: boolean
  filledDots?: boolean
  bColor?: string
}) {
  const data = points.map((p) => ({ name: p.label, [names[0]]: p.a, [names[1]]: p.b }))
  const seriesB = dashedB ? '#94a3b8' : bColor ?? MAROON_LIGHT
  const aDot = filledDots
    ? { r: 3, fill: MAROON, stroke: MAROON, strokeWidth: 0 }
    : { r: 3, fill: '#fff', stroke: MAROON, strokeWidth: 1.5 }
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={dashedB ? '#f1f5f9' : GRID} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 9.5, fontWeight: dashedB ? 400 : 700 }} axisLine={false} tickLine={false} dy={6} />
          <YAxis
            tick={{ fill: AXIS, fontSize: 9.5, fontWeight: dashedB ? 400 : 700 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v) => formatAxis(Number(v), yFormat)}
            domain={[0, 'auto']}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey={names[0]}
            stroke={MAROON}
            strokeWidth={2}
            dot={aDot}
            activeDot={{ r: 4, fill: filledDots ? MAROON : '#fff', stroke: MAROON, strokeWidth: filledDots ? 0 : 1.5 }}
          />
          <Line
            type="monotone"
            dataKey={names[1]}
            stroke={seriesB}
            strokeWidth={2}
            strokeDasharray={dashedB ? '5 4' : undefined}
            dot={dashedB ? false : { r: 3, fill: '#fff', stroke: seriesB, strokeWidth: 1.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AdminDonutChart({ slices }: { slices: DonutSlice[] }) {
  return (
    <div className="flex flex-col items-center gap-5 py-2 sm:flex-row sm:items-center sm:justify-start sm:gap-[50px] sm:pl-[50px]">
      <div className="size-[187px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={1.2}
              strokeWidth={0}
            >
              {slices.map((slice) => (
                <Cell key={slice.label} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex shrink-0 flex-col gap-2 pr-2">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-[6px] text-[11.5px] font-bold leading-[normal] text-slate-600">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
            <span>
              {slice.label} · {slice.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminTierBarChart({
  points,
  height = 190,
  colors,
  cutoffAt,
  wrapTicks,
}: {
  points: Point[]
  height?: number
  colors?: string[]
  cutoffAt?: string
  wrapTicks?: boolean
}) {
  const data = points.map((p) => ({ name: p.label, value: p.value }))
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: wrapTicks ? 18 : 0 }} barCategoryGap="38%">
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="name"
            interval={0}
            tick={
              wrapTicks
                ? ({ x, y, payload }) => {
                    const parts = String(payload.value).split(' ')
                    return (
                      <text x={x} y={Number(y) + 8} textAnchor="middle" fill={AXIS} fontSize={9.5} fontWeight={700}>
                        {parts.map((part, i) => (
                          <tspan key={part} x={x} dy={i === 0 ? 0 : 11}>
                            {part}
                          </tspan>
                        ))}
                      </text>
                    )
                  }
                : { fill: AXIS, fontSize: 9.5, fontWeight: 700 }
            }
            axisLine={false}
            tickLine={false}
            dy={wrapTicks ? 0 : 6}
          />
          <YAxis tick={{ fill: AXIS, fontSize: 9.5, fontWeight: 700 }} axisLine={false} tickLine={false} width={36} domain={[0, 'auto']} />
          {cutoffAt ? <ReferenceLine x={cutoffAt} stroke="#94a3b8" strokeDasharray="4 4" /> : null}
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(83,20,36,0.04)' }} />
          <Bar dataKey="value" name="Value" fill={MAROON} radius={[3, 3, 0, 0]} maxBarSize={46}>
            {colors?.map((color, i) => (
              <Cell key={`${data[i]?.name ?? i}`} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AdminComboBarChart({
  points,
  height = 202,
}: {
  points: SeriesPoint[]
  height?: number
}) {
  const data = points.map((p) => ({
    name: p.label,
    deposits: p.deposits ?? p.value ?? 0,
    bids: p.bids ?? 0,
  }))
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barCategoryGap="18%">
          <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: AXIS, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            dy={4}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: AXIS, fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(83,20,36,0.04)' }} />
          <Bar dataKey="deposits" name="Deposits" fill={MAROON} radius={[2, 2, 0, 0]} maxBarSize={18} />
          <Bar dataKey="bids" name="Bids" fill={MAROON_LIGHT} radius={[2, 2, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
