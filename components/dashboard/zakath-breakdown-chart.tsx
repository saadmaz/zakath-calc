"use client"

import { useMemo } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { formatCurrency, ZakathBreakdown } from "@/lib/zakath-engine"

interface ZakathBreakdownChartProps {
  assetTotals: ZakathBreakdown
  currency: string
}

const ASSET_LABELS: Record<keyof ZakathBreakdown, string> = {
  cash: "Cash & Savings",
  gold: "Gold",
  silver: "Silver",
  stocks: "Stocks & Investments",
  rental: "Real Estate",
  business: "Business Assets",
  other: "Other Assets",
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
]

export function ZakathBreakdownChart({ assetTotals, currency }: ZakathBreakdownChartProps) {
  const data = useMemo(() => {
    return Object.entries(assetTotals)
      .filter(([_, value]) => value > 0)
      .map(([key, value], index) => ({
        name: ASSET_LABELS[key as keyof ZakathBreakdown],
        value,
        color: COLORS[index % COLORS.length],
      }))
  }, [assetTotals])

  const total = Object.values(assetTotals).reduce((sum, val) => sum + val, 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No zakatable assets to display
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value, currency)}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value, entry) => {
              const item = data.find((d) => d.name === value)
              if (item) {
                const percent = ((item.value / total) * 100).toFixed(1)
                return (
                  <span className="text-sm text-foreground">
                    {value} ({percent}%)
                  </span>
                )
              }
              return value
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
