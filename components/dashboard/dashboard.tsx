"use client"

import { useEffect, useState } from "react"
import { useZakathStore } from "@/lib/zakath-store"
import { formatCurrency } from "@/lib/zakath-engine"
import { getGreeting, getDaysUntilHawl, getHawlProgress, formatDate } from "@/lib/hijri"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ZakathBreakdownChart } from "./zakath-breakdown-chart"
import { NisabStatusCard } from "./nisab-status-card"
import { QuickStats } from "./quick-stats"
import { RecentCalculations } from "./recent-calculations"
import { Coins, Plus, Calculator, Calendar, TrendingUp, AlertCircle } from "lucide-react"

interface DashboardProps {
  onNavigate: (page: "assets" | "calculate" | "settings" | "history") => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { 
    assets, 
    settings, 
    calculateZakath, 
    currentCalculation,
    calculations 
  } = useZakathStore()
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Recalculate on mount if there are assets
    if (assets.length > 0) {
      calculateZakath()
    }
  }, [assets.length, calculateZakath])

  if (!mounted) {
    return null
  }

  const hasAssets = assets.length > 0
  const daysUntilHawl = settings.hawlDate ? getDaysUntilHawl(new Date(settings.hawlDate)) : null
  const hawlProgress = settings.hawlDate ? getHawlProgress(new Date(settings.hawlDate)) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {getGreeting()}
          </h1>
          <p className="text-muted-foreground">
            {hasAssets 
              ? "Your Zakath overview for this year" 
              : "Start by adding your zakatable assets"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onNavigate("assets")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Assets
          </Button>
          <Button onClick={() => onNavigate("calculate")}>
            <Calculator className="mr-2 h-4 w-4" />
            Calculate
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {!hasAssets && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Coins className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No assets added yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Add your zakatable assets like cash, gold, silver, investments, and property to calculate your Zakath obligation.
            </p>
            <Button onClick={() => onNavigate("assets")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Asset
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {hasAssets && currentCalculation && (
        <QuickStats 
          calculation={currentCalculation} 
          currency={settings.currency}
          daysUntilHawl={daysUntilHawl}
        />
      )}

      {/* Main Content Grid */}
      {hasAssets && currentCalculation && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Nisab Status */}
          <NisabStatusCard 
            calculation={currentCalculation}
            currency={settings.currency}
          />

          {/* Asset Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Asset Breakdown
              </CardTitle>
              <CardDescription>
                Distribution of your zakatable wealth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ZakathBreakdownChart 
                assetTotals={currentCalculation.assetTotals}
                currency={settings.currency}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hawl Tracking */}
      {settings.hawlDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Hawl Progress
            </CardTitle>
            <CardDescription>
              Your lunar year tracking for Zakath
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress through current Hawl</span>
              <span className="font-medium">{Math.round(hawlProgress)}%</span>
            </div>
            <Progress value={hawlProgress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Started</span>
              <span>{formatDate(new Date(settings.hawlDate))}</span>
            </div>
            {daysUntilHawl !== null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Days until next Zakath due</span>
                <span className="font-semibold text-primary">{daysUntilHawl} days</span>
              </div>
            )}
            {daysUntilHawl !== null && daysUntilHawl <= 30 && (
              <div className="flex items-center gap-2 rounded-lg bg-accent/10 p-3 text-sm">
                <AlertCircle className="h-4 w-4 text-accent" />
                <span className="text-accent">Your Zakath is due soon. Make sure to calculate and pay on time.</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Calculations */}
      {calculations.length > 0 && (
        <RecentCalculations 
          calculations={calculations}
          currency={settings.currency}
          onViewAll={() => onNavigate("history")}
        />
      )}
    </div>
  )
}
