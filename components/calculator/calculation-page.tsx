"use client"

import { useEffect, useState } from "react"
import { useZakathStore } from "@/lib/zakath-store"
import { formatCurrency, ZAKATH_RATE, GOLD_NISAB_GRAMS, SILVER_NISAB_GRAMS } from "@/lib/zakath-engine"
import { formatHijriDate, formatDate } from "@/lib/hijri"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalculationBreakdown } from "./calculation-breakdown"
import { 
  ArrowLeft, 
  Calculator, 
  CheckCircle2, 
  Download, 
  Share2,
  AlertCircle,
  Info,
  Printer
} from "lucide-react"

interface CalculationPageProps {
  onBack: () => void
  onNavigate: (page: "assets" | "settings") => void
}

export function CalculationPage({ onBack, onNavigate }: CalculationPageProps) {
  const { 
    assets, 
    settings, 
    calculateZakath, 
    currentCalculation,
    markAsPaid
  } = useZakathStore()
  
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    calculateZakath()
  }, [calculateZakath])

  const handleMarkAsPaid = () => {
    markAsPaid()
    setIsPaid(true)
  }

  const handlePrint = () => {
    window.print()
  }

  if (!currentCalculation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Calculate Zakath</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Assets to Calculate</h3>
            <p className="text-muted-foreground text-center mb-6">
              Add your zakatable assets first to calculate your Zakath obligation.
            </p>
            <Button onClick={() => onNavigate("assets")}>
              Add Assets
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Zakath Calculation
            </h1>
            <p className="text-muted-foreground">
              {formatDate(currentCalculation.date)} ({formatHijriDate(currentCalculation.date)})
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-3xl font-bold">Zakath Calculation Report</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {formatDate(currentCalculation.date)} ({formatHijriDate(currentCalculation.date)})
        </p>
      </div>

      {/* Main Result Card */}
      <Card className={`${currentCalculation.isAboveNisab ? "border-primary" : ""}`}>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg text-muted-foreground font-normal">
            Your Zakath Due
          </CardTitle>
          <div className="text-5xl font-bold text-primary mt-2">
            {formatCurrency(currentCalculation.zakathDue, settings.currency)}
          </div>
          <CardDescription className="mt-2">
            {currentCalculation.isAboveNisab 
              ? `${(ZAKATH_RATE * 100)}% of your net zakatable wealth`
              : "No Zakath due - below nisab threshold"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant={currentCalculation.isAboveNisab ? "default" : "secondary"}>
              {currentCalculation.isAboveNisab ? "Above Nisab" : "Below Nisab"}
            </Badge>
            <Badge variant={currentCalculation.hawlMet ? "default" : "outline"}>
              {currentCalculation.hawlMet ? "Hawl Complete" : "Hawl Pending"}
            </Badge>
            <Badge variant="outline">
              {currentCalculation.nisabUsed === "silver" ? "Silver" : "Gold"} Nisab
            </Badge>
          </div>

          {/* Mark as Paid Button */}
          {currentCalculation.zakathDue > 0 && !isPaid && (
            <div className="flex justify-center pt-4 print:hidden">
              <Button size="lg" onClick={handleMarkAsPaid} className="gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Mark as Paid
              </Button>
            </div>
          )}

          {isPaid && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-4 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Zakath marked as paid - May Allah accept it</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hawl Warning */}
      {!currentCalculation.hawlMet && currentCalculation.isAboveNisab && (
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Hawl Not Yet Complete</p>
              <p className="text-sm text-muted-foreground">
                Your wealth is above the nisab threshold, but you need to wait until a full lunar year (354 days) has passed since you first reached the nisab to pay Zakath. Set your hawl date in settings if you haven&apos;t already.
              </p>
              <Button 
                variant="link" 
                className="px-0 text-accent print:hidden" 
                onClick={() => onNavigate("settings")}
              >
                Set Hawl Date
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculation Breakdown */}
      <CalculationBreakdown 
        calculation={currentCalculation}
        currency={settings.currency}
      />

      {/* Nisab Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Nisab Reference
          </CardTitle>
          <CardDescription>
            The minimum wealth threshold for Zakath obligation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`rounded-lg border p-4 ${currentCalculation.nisabUsed === "gold" ? "border-primary bg-primary/5" : ""}`}>
              <p className="text-sm text-muted-foreground">Gold Nisab ({GOLD_NISAB_GRAMS}g)</p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrency(currentCalculation.nisabGold, settings.currency)}
              </p>
              {currentCalculation.nisabUsed === "gold" && (
                <Badge className="mt-2">Currently Used</Badge>
              )}
            </div>
            <div className={`rounded-lg border p-4 ${currentCalculation.nisabUsed === "silver" ? "border-primary bg-primary/5" : ""}`}>
              <p className="text-sm text-muted-foreground">Silver Nisab ({SILVER_NISAB_GRAMS}g)</p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrency(currentCalculation.nisabSilver, settings.currency)}
              </p>
              {currentCalculation.nisabUsed === "silver" && (
                <Badge className="mt-2">Currently Used</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Most scholars recommend using the silver nisab as it results in a lower threshold, meaning more people qualify to pay Zakath and more wealth is distributed to those in need.
          </p>
        </CardContent>
      </Card>

      {/* Scholarly Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Important Notes:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Zakath is calculated at 2.5% of your net zakatable wealth</li>
            <li>Only wealth that has been in your possession for a full lunar year (Hawl) is zakatable</li>
            <li>Personal necessities like your home, vehicle, and everyday items are exempt</li>
            <li>Debts due within the year are deductible from your zakatable wealth</li>
            <li>Consult with a qualified Islamic scholar for complex situations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
