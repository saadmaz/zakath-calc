"use client"

import { useState } from "react"
import { useZakathStore } from "@/lib/zakath-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  Scale,
  CheckCircle2,
  Sparkles
} from "lucide-react"

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

export function Onboarding() {
  const { updateSettings, completeOnboarding } = useZakathStore()
  
  const [step, setStep] = useState(1)
  const [currency, setCurrency] = useState("USD")
  const [madhab, setMadhab] = useState<"hanafi" | "shafii" | "maliki" | "hanbali">("hanafi")
  const [hawlDate, setHawlDate] = useState("")
  const [useGoldNisab, setUseGoldNisab] = useState(false)

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = () => {
    updateSettings({
      currency,
      madhab,
      hawlDate: hawlDate ? new Date(hawlDate) : null,
      useGoldNisab,
    })
    completeOnboarding()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to ZakathCalc</CardTitle>
            <CardDescription className="mt-2">
              Let&apos;s set up your Zakath calculator in just a few steps
            </CardDescription>
          </div>
          <Progress value={progress} className="h-1" />
          <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Currency */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Select Your Currency</p>
                  <p className="text-sm text-muted-foreground">
                    All calculations will be displayed in this currency
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} - {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="madhab">School of Thought</Label>
                <Select value={madhab} onValueChange={(v: "hanafi" | "shafii" | "maliki" | "hanbali") => setMadhab(v)}>
                  <SelectTrigger id="madhab">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MADHABS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Hawl Date */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-4">
                <Calendar className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Set Your Hawl Date</p>
                  <p className="text-sm text-muted-foreground">
                    When did your wealth first reach the nisab threshold?
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hawlDate">Hawl Anniversary Date</Label>
                <Input
                  id="hawlDate"
                  type="date"
                  value={hawlDate}
                  onChange={(e) => setHawlDate(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  If you&apos;re unsure, you can set or update this later in settings
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">What is Hawl?</strong>
                </p>
                <p className="mt-1">
                  Hawl is the lunar year period (354 days) during which your zakatable wealth must remain at or above the nisab threshold. Zakath becomes obligatory once this period is complete.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Nisab Preference */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-4">
                <Scale className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Nisab Preference</p>
                  <p className="text-sm text-muted-foreground">
                    Choose which nisab standard to use
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div 
                  className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                    !useGoldNisab ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setUseGoldNisab(false)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Silver Nisab (Recommended)</p>
                      <p className="text-sm text-muted-foreground">
                        612.36 grams of silver - Lower threshold, more inclusive
                      </p>
                    </div>
                    {!useGoldNisab && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                </div>

                <div 
                  className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                    useGoldNisab ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setUseGoldNisab(true)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Gold Nisab</p>
                      <p className="text-sm text-muted-foreground">
                        87.48 grams of gold - Higher threshold
                      </p>
                    </div>
                    {useGoldNisab && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                Most scholars recommend using the silver nisab as it ensures more wealth reaches those in need.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button onClick={handleNext} className="flex-1">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1">
                Get Started
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
