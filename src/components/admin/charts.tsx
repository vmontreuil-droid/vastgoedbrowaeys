'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Line,
  LineChart,
} from 'recharts'

const DEFAULT_PALETTE = ['#0b4f58', '#8c6b2e', '#a25b3a', '#5a7a48', '#9b6e7b', '#6e828b', '#c98c4f', '#7d8a5e']

export function DonutChart({
  data,
  total,
  centerLabel,
}: {
  data: Array<{ name: string; value: number; color?: string }>
  total?: number
  centerLabel?: string
}) {
  const grand = total ?? data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="relative w-full h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e6e1d7',
              fontSize: 13,
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginBottom: 32 }}>
        <p className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{grand}</p>
        {centerLabel && (
          <p className="text-[0.6rem] uppercase tracking-[0.16em] text-[var(--color-mute)] mt-0.5">
            {centerLabel}
          </p>
        )}
      </div>
    </div>
  )
}

export function TrendArea({
  data,
  dataKeys,
  height = 240,
}: {
  data: Array<Record<string, string | number>>
  dataKeys: Array<{ key: string; label: string; color?: string }>
  height?: number
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
          <defs>
            {dataKeys.map((d, i) => (
              <linearGradient key={d.key} id={`grad-${d.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={d.color || DEFAULT_PALETTE[i]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={d.color || DEFAULT_PALETTE[i]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e6e1d7',
              fontSize: 13,
            }}
          />
          {dataKeys.map((d, i) => (
            <Area
              key={d.key}
              type="monotone"
              dataKey={d.key}
              name={d.label}
              stroke={d.color || DEFAULT_PALETTE[i]}
              strokeWidth={2}
              fill={`url(#grad-${d.key})`}
              dot={{ r: 3, strokeWidth: 0, fill: d.color || DEFAULT_PALETTE[i] }}
              activeDot={{ r: 5 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StackedBars({
  data,
  dataKeys,
  height = 240,
}: {
  data: Array<Record<string, string | number>>
  dataKeys: Array<{ key: string; label: string; color?: string }>
  height?: number
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e6e1d7', fontSize: 13 }} />
          <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {dataKeys.map((d, i) => (
            <Bar
              key={d.key}
              dataKey={d.key}
              name={d.label}
              stackId="a"
              fill={d.color || DEFAULT_PALETTE[i]}
              radius={i === dataKeys.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SimpleLine({
  data,
  dataKeys,
  height = 200,
}: {
  data: Array<Record<string, string | number>>
  dataKeys: Array<{ key: string; label: string; color?: string }>
  height?: number
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e6e1d7', fontSize: 13 }} />
          {dataKeys.map((d, i) => (
            <Line
              key={d.key}
              type="monotone"
              dataKey={d.key}
              name={d.label}
              stroke={d.color || DEFAULT_PALETTE[i]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: d.color || DEFAULT_PALETTE[i] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
