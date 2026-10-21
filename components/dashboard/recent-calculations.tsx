"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, ZakathCalculation } from "@/lib/zakath-engine"
import { formatDate } from "@/lib/hijri"
import { History, ChevronRight, CheckCircle2 } from "lucide-react"

interface RecentCalculationsProps {
  calculations: ZakathCalculation[]
  currency: string
  onViewAll: () => void
}

export function RecentCalculations({ calculations, currency, onViewAll }: RecentCalculationsProps) {
  // Get the most recent 3 calculations
  const recentCalcs = calculations.slice(-3).reverse()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Recent Calculations
          </CardTitle>
          <CardDescription>
            Your Zakath payment history
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentCalcs.map((calc, index) => (
            <div 
              key={index}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {formatCurrency(calc.zakathDue, currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(calc.date))}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Net Wealth</p>
                <p className="font-medium">{formatCurrency(calc.netWealth, currency)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
