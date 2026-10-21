"use client"

import { useZakathStore } from "@/lib/zakath-store"
import { formatCurrency, ZakathCalculation } from "@/lib/zakath-engine"
import { formatDate, formatHijriDate } from "@/lib/hijri"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  History, 
  CheckCircle2,
  TrendingUp,
  Calendar
} from "lucide-react"

interface HistoryPageProps {
  onBack: () => void
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const { calculations, settings } = useZakathStore()

  // Sort calculations by date (newest first)
  const sortedCalculations = [...calculations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Calculate totals
  const totalZakathPaid = calculations.reduce((sum, calc) => sum + calc.zakathDue, 0)
  const averageZakath = calculations.length > 0 ? totalZakathPaid / calculations.length : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Zakath History
          </h1>
          <p className="text-muted-foreground">
            Your past Zakath calculations and payments
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      {calculations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Zakath Paid</p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(totalZakathPaid, settings.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Zakath</p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(averageZakath, settings.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payments Made</p>
                  <p className="text-xl font-semibold text-foreground">
                    {calculations.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {calculations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <History className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No History Yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Your Zakath calculation history will appear here once you mark payments as completed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Calculations List */}
      {sortedCalculations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              All Calculations
            </CardTitle>
            <CardDescription>
              Detailed history of your Zakath payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedCalculations.map((calc, index) => (
                <CalculationHistoryItem 
                  key={index}
                  calculation={calc}
                  currency={settings.currency}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface CalculationHistoryItemProps {
  calculation: ZakathCalculation
  currency: string
}

function CalculationHistoryItem({ calculation, currency }: CalculationHistoryItemProps) {
  const date = new Date(calculation.date)

  return (
    <div className="rounded-lg border p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              {formatCurrency(calculation.zakathDue, currency)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(date)} ({formatHijriDate(date)})
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={calculation.nisabUsed === "silver" ? "default" : "secondary"}>
            {calculation.nisabUsed === "silver" ? "Silver" : "Gold"} Nisab
          </Badge>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-muted-foreground">Net Wealth</p>
          <p className="font-medium text-foreground">
            {formatCurrency(calculation.netWealth, currency)}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-muted-foreground">Total Assets</p>
          <p className="font-medium text-foreground">
            {formatCurrency(calculation.totalZakatableWealth, currency)}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-muted-foreground">Liabilities</p>
          <p className="font-medium text-foreground">
            {formatCurrency(calculation.totalLiabilities, currency)}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="text-sm">
        <p className="text-muted-foreground mb-2">Zakath by Asset Type:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(calculation.breakdown)
            .filter(([_, value]) => value > 0)
            .map(([key, value]) => (
              <Badge key={key} variant="outline" className="capitalize">
                {key}: {formatCurrency(value, currency)}
              </Badge>
            ))}
        </div>
      </div>
    </div>
  )
}
