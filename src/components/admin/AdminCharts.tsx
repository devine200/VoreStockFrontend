import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const MAROON = '#531424'
const MAROON_LIGHT = '#a7878f'
const GRID = '#e2e8f0'
const AXIS = '#94a3b8'

type Point = { label: string; value: number }
type SeriesPoint = { label: string; deposits?: number; bids?: number; value?: number }
type DonutSlice = { label: string; value: number; color: string }

const chartTooltipStyle = {
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: 12,
  color: '#334155',
}

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

export function AdminWeeklyBarChart({
  points,
  height = 202,
}: {
  points: Point[]
  height?: number
}) {
  const data = points.map((p) => ({ name: p.label, value: p.value }))
  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
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
          <YAxis
            tick={{ fill: AXIS, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={24}
            tickFormatter={(v) => `${v}`}
          />
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
}: {
  points: Point[]
  height?: number
}) {
  const data = points.map((p) => ({ name: p.label, value: p.value }))
  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="adminAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MAROON} stopOpacity={0.18} />
              <stop offset="100%" stopColor={MAROON} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} dy={4} />
          <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={MAROON}
            strokeWidth={2}
            fill="url(#adminAreaFill)"
            dot={{ r: 3, fill: MAROON, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: MAROON }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AdminDonutChart({
  slices,
  height = 191,
}: {
  slices: DonutSlice[]
  height?: number
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="w-full min-w-0 sm:flex-1" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
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
      <div className="flex shrink-0 flex-col gap-2.5 pr-2">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-2 text-[12px] text-slate-600">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
            <span>
              {slice.label} · {total ? Math.round((slice.value / total) * 100) : 0}%
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
}: {
  points: Point[]
  height?: number
}) {
  const data = points.map((p) => ({ name: p.label, value: p.value }))
  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} dy={4} />
          <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(83,20,36,0.04)' }} />
          <Bar dataKey="value" fill={MAROON} radius={[2, 2, 0, 0]} maxBarSize={36} />
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
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
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
