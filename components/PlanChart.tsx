"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts"

interface ChartPoint { month: number; balance: number }
interface Series { name: string; data: ChartPoint[]; color: string }

const usd = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

function mergeSeriesData(series: Series[]): Record<string, number | string>[] {
  const allMonths = new Set(series.flatMap(s => s.data.map(d => d.month)))
  const byMonth: Record<string, Record<string, number | string>> = {}
  for (const month of allMonths) {
    byMonth[month] = { month }
    for (const s of series) {
      const point = s.data.find(d => d.month === month)
      byMonth[month][s.name] = point?.balance ?? 0
    }
  }
  return Object.values(byMonth).sort((a, b) => Number(a.month) - Number(b.month))
}

export default function PlanChart({ series }: { series: Series[] }) {
  const data = mergeSeriesData(series)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          label={{ value: "Mes", position: "insideBottomRight", offset: -4, fontSize: 11 }}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={usd}
          width={70}
        />
        <Tooltip formatter={(v: number) => usd(v)} labelFormatter={m => `Mes ${m}`} />
        {series.length > 1 && <Legend />}
        {series.map(s => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
