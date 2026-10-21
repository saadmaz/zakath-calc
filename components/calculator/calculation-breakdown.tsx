"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, ZakathCalculation, ZAKATH_RATE } from "@/lib/zakath-engine"
import { 
  Wallet, 
  Gem, 
  TrendingUp, 
  Building, 
  Briefcase,
  Package,
  TrendingDown,
  Calculator
} from "lucide-react"

interface CalculationBreakdownProps {
  calculation: ZakathCalculation
  currency: string
}

const ASSET_CONFIG = [
  { key: "cash", label: "Cash & Savings", icon: Wallet },
  { key: "gold", label: "Gold", icon: Gem },
  { key: "silver", label: "Silver", icon: Gem },
  { key: "stocks", label: "Stocks & Investments", icon: TrendingUp },
  { key: "rental", label: "Real Estate", icon: Building },
  { key: "business", label: "Business Assets", icon: Briefcase },
  { key: "other", label: "Other Assets", icon: Package },
] as const

export function CalculationBreakdown({ calculation, currency }: CalculationBreakdownProps) {
  const activeAssets = ASSET_CONFIG.filter(
    (asset) => calculation.assetTotals[asset.key] > 0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Calculation Breakdown
        </CardTitle>
        <CardDescription>
          Detailed view of how your Zakath was calculated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assets Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Zakatable Assets</h4>
          
          {activeAssets.length > 0 ? (
            <div className="space-y-3">
              {activeAssets.map((asset) => {
                const Icon = asset.icon
                const assetValue = calculation.assetTotals[asset.key]
                const zakathFromAsset = calculation.breakdown[asset.key]

                return (
                  <div key={asset.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-foreground">{asset.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {formatCurrency(assetValue, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Zakath: {formatCurrency(zakathFromAsset, currency)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No zakatable assets</p>
          )}
        </div>

        <Separator />

        {/* Totals Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Zakatable Assets</span>
            <span className="font-medium text-foreground">
              {formatCurrency(calculation.totalZakatableWealth, currency)}
            </span>
          </div>

          {calculation.totalLiabilities > 0 && (
            <div className="flex items-center justify-between text-destructive">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                <span>Deductible Liabilities</span>
              </div>
              <span className="font-medium">
                - {formatCurrency(calculation.totalLiabilities, currency)}
              </span>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">Net Zakatable Wealth</span>
            <span className="text-xl font-semibold text-foreground">
              {formatCurrency(calculation.netWealth, currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span>Nisab Threshold ({calculation.nisabUsed})</span>
            <span>{formatCurrency(calculation.nisabThreshold, currency)}</span>
          </div>

          <Separator />

          {/* Final Calculation */}
          <div className="rounded-lg bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-foreground">Zakath Due ({ZAKATH_RATE * 100}%)</span>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(calculation.netWealth, currency)} x {ZAKATH_RATE * 100}%
                </p>
              </div>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(calculation.zakathDue, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Per-Asset Zakath Breakdown */}
        {activeAssets.length > 1 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Zakath by Asset Type</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {activeAssets.map((asset) => {
                  const zakathFromAsset = calculation.breakdown[asset.key]
                  const percentage = calculation.zakathDue > 0 
                    ? (zakathFromAsset / calculation.zakathDue) * 100 
                    : 0

                  return (
                    <div 
                      key={asset.key}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="text-sm text-muted-foreground">{asset.label}</span>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {formatCurrency(zakathFromAsset, currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
