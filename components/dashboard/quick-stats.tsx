"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, ZakathCalculation } from "@/lib/zakath-engine"
import { Wallet, CircleDollarSign, CalendarCheck, TrendingDown } from "lucide-react"

interface QuickStatsProps {
  calculation: ZakathCalculation
  currency: string
  daysUntilHawl: number | null
}

export function QuickStats({ calculation, currency, daysUntilHawl }: QuickStatsProps) {
  const stats = [
    {
      label: "Total Zakatable Wealth",
      value: formatCurrency(calculation.totalZakatableWealth, currency),
      icon: Wallet,
      description: "Your total zakatable assets",
    },
    {
      label: "Zakath Due",
      value: formatCurrency(calculation.zakathDue, currency),
      icon: CircleDollarSign,
      description: calculation.isAboveNisab ? "2.5% of net wealth" : "Below nisab threshold",
      highlight: calculation.zakathDue > 0,
    },
    {
      label: "Deductible Debts",
      value: formatCurrency(calculation.totalLiabilities, currency),
      icon: TrendingDown,
      description: "Debts due within the year",
    },
    {
      label: "Days Until Hawl",
      value: daysUntilHawl !== null ? `${daysUntilHawl}` : "Not set",
      icon: CalendarCheck,
      description: daysUntilHawl !== null ? "Until your Zakath is due" : "Set your hawl date",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={stat.highlight ? "border-primary/50 bg-primary/5" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.highlight ? "bg-primary/10" : "bg-muted"}`}>
                <stat.icon className={`h-5 w-5 ${stat.highlight ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">{stat.label}</p>
                <p className={`text-xl font-semibold truncate ${stat.highlight ? "text-primary" : "text-foreground"}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
