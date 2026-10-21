"use client"

import { useState } from "react"
import { useZakathStore } from "@/lib/zakath-store"
import { formatCurrency, Liability } from "@/lib/zakath-engine"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, TrendingDown } from "lucide-react"

interface LiabilitiesManagerProps {
  currency: string
}

export function LiabilitiesManager({ currency }: LiabilitiesManagerProps) {
  const { liabilities, addLiability, updateLiability, deleteLiability } = useZakathStore()
  
  const [showForm, setShowForm] = useState(false)
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null)
  
  // Form state
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState("")
  const [dueWithinYear, setDueWithinYear] = useState(true)

  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const deductibleLiabilities = liabilities
    .filter(l => l.dueWithinYear)
    .reduce((sum, l) => sum + l.amount, 0)

  const resetForm = () => {
    setLabel("")
    setAmount("")
    setDueWithinYear(true)
    setEditingLiability(null)
    setShowForm(false)
  }

  const handleEdit = (liability: Liability) => {
    setLabel(liability.label)
    setAmount(liability.amount.toString())
    setDueWithinYear(liability.dueWithinYear)
    setEditingLiability(liability)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const liabilityData = {
      label: label || "Debt",
      amount: parseFloat(amount) || 0,
      dueWithinYear,
    }

    if (editingLiability) {
      updateLiability(editingLiability.id, liabilityData)
    } else {
      addLiability(liabilityData)
    }

    resetForm()
  }

  const handleDelete = (id: string) => {
    deleteLiability(id)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Liabilities</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(totalLiabilities, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deductible from Zakath</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(deductibleLiabilities, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>{editingLiability ? "Edit Liability" : "Add Liability"}</CardTitle>
            <CardDescription>
              Debts due within the year are deductible from zakatable wealth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Description</Label>
                <Input
                  id="label"
                  placeholder="e.g., Credit card balance, Loan payment"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="dueWithinYear">Due Within This Year</Label>
                  <p className="text-sm text-muted-foreground">
                    Only debts due within the year are deductible
                  </p>
                </div>
                <Switch
                  id="dueWithinYear"
                  checked={dueWithinYear}
                  onCheckedChange={setDueWithinYear}
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingLiability ? "Update" : "Add"} Liability
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Liability
        </Button>
      )}

      {/* Liabilities List */}
      {liabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Liabilities</CardTitle>
            <CardDescription>
              Manage your debts and obligations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liabilities.map((liability) => (
                <div
                  key={liability.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {liability.label}
                      </p>
                      {liability.dueWithinYear ? (
                        <Badge variant="default" className="text-xs">
                          Deductible
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Not Deductible
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(liability.amount, currency)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(liability)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(liability.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Only debts that are due within the current Zakath year are deductible from your zakatable wealth. Long-term debts like mortgages are typically only deductible for the portion due within the year.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
