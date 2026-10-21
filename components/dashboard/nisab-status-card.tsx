"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, ZakathCalculation, GOLD_NISAB_GRAMS, SILVER_NISAB_GRAMS } from "@/lib/zakath-engine"
import { CheckCircle2, XCircle, Scale } from "lucide-react"

interface NisabStatusCardProps {
  calculation: ZakathCalculation
  currency: string
}

export function NisabStatusCard({ calculation, currency }: NisabStatusCardProps) {
  const percentOfNisab = (calculation.netWealth / calculation.nisabThreshold) * 100
  const amountAboveNisab = calculation.netWealth - calculation.nisabThreshold

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Nisab Status
        </CardTitle>
        <CardDescription>
          Using {calculation.nisabUsed === "silver" ? "silver" : "gold"} nisab threshold
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className={`flex items-center gap-3 rounded-lg p-4 ${
          calculation.isAboveNisab 
            ? "bg-primary/10 text-primary" 
            : "bg-muted text-muted-foreground"
        }`}>
          {calculation.isAboveNisab ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <XCircle className="h-6 w-6" />
          )}
          <div>
            <p className="font-semibold">
              {calculation.isAboveNisab ? "Above Nisab" : "Below Nisab"}
            </p>
            <p className="text-sm opacity-80">
              {calculation.isAboveNisab 
                ? "Zakath is obligatory on your wealth"
                : "Zakath is not obligatory at this time"}
            </p>
          </div>
        </div>

        {/* Comparison Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Net Wealth</span>
            <span className="font-medium">{formatCurrency(calculation.netWealth, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Nisab Threshold</span>
            <span className="font-medium">{formatCurrency(calculation.nisabThreshold, currency)}</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {amountAboveNisab >= 0 ? "Amount Above Nisab" : "Amount Below Nisab"}
              </span>
              <span className={`font-semibold ${amountAboveNisab >= 0 ? "text-primary" : "text-muted-foreground"}`}>
                {formatCurrency(Math.abs(amountAboveNisab), currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Percentage of Nisab</span>
              <span className="font-medium">{percentOfNisab.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Nisab Reference */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
          <p className="font-medium text-foreground">Nisab Reference Values</p>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Gold Nisab ({GOLD_NISAB_GRAMS}g)</span>
            <span>{formatCurrency(calculation.nisabGold, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Silver Nisab ({SILVER_NISAB_GRAMS}g)</span>
            <span>{formatCurrency(calculation.nisabSilver, currency)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
