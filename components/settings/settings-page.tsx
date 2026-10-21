"use client"

import { useState } from "react"
import { useZakathStore } from "@/lib/zakath-store"
import { formatDate, formatHijriDate, getDaysUntilHawl, getHawlProgress } from "@/lib/hijri"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Settings, 
  Calendar, 
  DollarSign,
  Scale,
  Info,
  Trash2,
  AlertCircle
} from "lucide-react"

interface SettingsPageProps {
  onBack: () => void
}

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
]

const MADHABS = [
  { value: "hanafi", label: "Hanafi" },
  { value: "shafii", label: "Shafi'i" },
  { value: "maliki", label: "Maliki" },
  { value: "hanbali", label: "Hanbali" },
]

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { settings, updateSettings, metalPrices, updateMetalPrices, resetStore } = useZakathStore()
  
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [hawlDateInput, setHawlDateInput] = useState(
    settings.hawlDate ? new Date(settings.hawlDate).toISOString().split("T")[0] : ""
  )

  const handleHawlDateChange = (dateStr: string) => {
    setHawlDateInput(dateStr)
    if (dateStr) {
      updateSettings({ hawlDate: new Date(dateStr) })
    } else {
      updateSettings({ hawlDate: null })
    }
  }

  const handleReset = () => {
    resetStore()
    setShowResetConfirm(false)
  }

  const daysUntilHawl = settings.hawlDate ? getDaysUntilHawl(new Date(settings.hawlDate)) : null
  const hawlProgress = settings.hawlDate ? getHawlProgress(new Date(settings.hawlDate)) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your Zakath calculator preferences
          </p>
        </div>
      </div>

      {/* Hawl Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Hawl Date
          </CardTitle>
          <CardDescription>
            The date your zakatable wealth first reached the nisab threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hawlDate">Hawl Anniversary Date</Label>
            <Input
              id="hawlDate"
              type="date"
              value={hawlDateInput}
              onChange={(e) => handleHawlDateChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This is when your wealth first reached the nisab. Zakath becomes due after one lunar year (354 days) from this date.
            </p>
          </div>

          {settings.hawlDate && (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hawl Started</span>
                <span className="font-medium">{formatDate(new Date(settings.hawlDate))}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hijri Date</span>
                <span className="font-medium">{formatHijriDate(new Date(settings.hawlDate))}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(hawlProgress)}%</span>
                </div>
                <Progress value={hawlProgress} className="h-2" />
              </div>
              {daysUntilHawl !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Days until next Zakath due</span>
                  <span className="font-semibold text-primary">{daysUntilHawl} days</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Currency
          </CardTitle>
          <CardDescription>
            Select your preferred currency for calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={settings.currency} 
              onValueChange={(value) => updateSettings({ currency: value })}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Nisab Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Nisab Preference
          </CardTitle>
          <CardDescription>
            Choose which nisab standard to use for calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Use Gold Nisab</Label>
              <p className="text-sm text-muted-foreground">
                {settings.useGoldNisab 
                  ? "Using gold nisab (87.48g of gold)" 
                  : "Using silver nisab (612.36g of silver) - recommended"}
              </p>
            </div>
            <Switch
              checked={settings.useGoldNisab}
              onCheckedChange={(checked) => updateSettings({ useGoldNisab: checked })}
            />
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <Info className="h-4 w-4 inline mr-2" />
            Most scholars recommend using the silver nisab as it results in a lower threshold, ensuring more wealth reaches those in need.
          </div>
        </CardContent>
      </Card>

      {/* Madhab Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            School of Thought
          </CardTitle>
          <CardDescription>
            Select your preferred madhab (affects scholarly notes shown)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="madhab">Madhab</Label>
            <Select 
              value={settings.madhab} 
              onValueChange={(value: "hanafi" | "shafii" | "maliki" | "hanbali") => 
                updateSettings({ madhab: value })
              }
            >
              <SelectTrigger id="madhab">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MADHABS.map((madhab) => (
                  <SelectItem key={madhab.value} value={madhab.value}>
                    {madhab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Metal Prices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Metal Prices
          </CardTitle>
          <CardDescription>
            Current gold and silver prices used for nisab calculation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goldPrice">Gold Price (per gram, USD)</Label>
              <Input
                id="goldPrice"
                type="number"
                step="0.01"
                value={metalPrices.goldPerGram}
                onChange={(e) => updateMetalPrices({ goldPerGram: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="silverPrice">Silver Price (per gram, USD)</Label>
              <Input
                id="silverPrice"
                type="number"
                step="0.01"
                value={metalPrices.silverPerGram}
                onChange={(e) => updateMetalPrices({ silverPerGram: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            These prices are used to calculate the nisab thresholds. Update them with current market prices for accurate calculations.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showResetConfirm ? (
            <Button 
              variant="destructive" 
              onClick={() => setShowResetConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Reset All Data
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-destructive font-medium">
                Are you sure? This will delete all your assets, liabilities, calculations, and settings. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReset}>
                  Yes, Reset Everything
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
