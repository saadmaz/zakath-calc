"use client"

import { useState } from "react"
import { useZakathStore } from "@/lib/zakath-store"
import { Asset, AssetType, PropertyType } from "@/lib/zakath-engine"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AssetFormProps {
  type: AssetType
  existingAsset: Asset | null
  onClose: () => void
  currency: string
}

export function AssetForm({ type, existingAsset, onClose, currency }: AssetFormProps) {
  const { addAsset, updateAsset, deleteAsset, metalPrices } = useZakathStore()

  const [label, setLabel] = useState(existingAsset?.label || "")
  const [value, setValue] = useState(existingAsset?.value?.toString() || "")
  const [isZakatable, setIsZakatable] = useState(existingAsset?.isZakatable ?? true)
  
  // Gold/Silver specific
  const [weightInGrams, setWeightInGrams] = useState(existingAsset?.weightInGrams?.toString() || "")
  
  // Stocks specific
  const [isETF, setIsETF] = useState(existingAsset?.isETF ?? false)
  
  // Property specific
  const [propertyType, setPropertyType] = useState<PropertyType>(existingAsset?.propertyType || "rental")
  const [monthlyRent, setMonthlyRent] = useState(existingAsset?.monthlyRent?.toString() || "")
  const [annualExpenses, setAnnualExpenses] = useState(existingAsset?.annualExpenses?.toString() || "")
  
  // Business specific
  const [currentAssets, setCurrentAssets] = useState(existingAsset?.currentAssets?.toString() || "")
  const [businessDebts, setBusinessDebts] = useState(existingAsset?.businessDebts?.toString() || "")
  const [ownershipPercentage, setOwnershipPercentage] = useState(existingAsset?.ownershipPercentage?.toString() || "100")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const assetData: Omit<Asset, "id" | "lastUpdated"> = {
      type,
      label: label || getDefaultLabel(),
      value: parseFloat(value) || 0,
      unit: currency,
      isZakatable,
    }

    // Add type-specific fields
    if (type === "gold" || type === "silver") {
      assetData.weightInGrams = parseFloat(weightInGrams) || 0
      // Calculate value from weight if weight is provided
      if (assetData.weightInGrams > 0) {
        const pricePerGram = type === "gold" ? metalPrices.goldPerGram : metalPrices.silverPerGram
        assetData.value = assetData.weightInGrams * pricePerGram
      }
    }

    if (type === "stocks") {
      assetData.isETF = isETF
    }

    if (type === "rental") {
      assetData.propertyType = propertyType
      if (propertyType === "rental") {
        assetData.monthlyRent = parseFloat(monthlyRent) || 0
        assetData.annualExpenses = parseFloat(annualExpenses) || 0
      }
    }

    if (type === "business") {
      assetData.currentAssets = parseFloat(currentAssets) || parseFloat(value) || 0
      assetData.businessDebts = parseFloat(businessDebts) || 0
      assetData.ownershipPercentage = parseFloat(ownershipPercentage) || 100
    }

    if (existingAsset) {
      updateAsset(existingAsset.id, assetData)
    } else {
      addAsset(assetData)
    }

    onClose()
  }

  const handleDelete = () => {
    if (existingAsset) {
      deleteAsset(existingAsset.id)
      onClose()
    }
  }

  const getDefaultLabel = () => {
    switch (type) {
      case "cash": return "Cash Account"
      case "gold": return "Gold"
      case "silver": return "Silver"
      case "stocks": return "Investment"
      case "rental": return "Property"
      case "business": return "Business"
      default: return "Asset"
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Common Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">Name / Description</Label>
          <Input
            id="label"
            placeholder={`e.g., ${getDefaultLabel()}`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        {/* Gold/Silver Weight Input */}
        {(type === "gold" || type === "silver") && (
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (grams)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              placeholder="Enter weight in grams"
              value={weightInGrams}
              onChange={(e) => setWeightInGrams(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Current {type} price: {currency} {type === "gold" ? metalPrices.goldPerGram.toFixed(2) : metalPrices.silverPerGram.toFixed(2)} per gram
            </p>
          </div>
        )}

        {/* Stock ETF Toggle */}
        {type === "stocks" && (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="isETF">Is this an ETF or Index Fund?</Label>
              <p className="text-sm text-muted-foreground">
                ETFs use 30% zakatable proxy approach
              </p>
            </div>
            <Switch
              id="isETF"
              checked={isETF}
              onCheckedChange={setIsETF}
            />
          </div>
        )}

        {/* Property Type */}
        {type === "rental" && (
          <>
            <div className="space-y-2">
              <Label>Property Purpose</Label>
              <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rental">Rental Income Property</SelectItem>
                  <SelectItem value="trade">Property for Sale/Trade</SelectItem>
                  <SelectItem value="personal">Personal Residence (Not Zakatable)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {propertyType === "rental" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Monthly Rent ({currency})</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    step="0.01"
                    placeholder="Monthly rental income"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualExpenses">Annual Expenses ({currency})</Label>
                  <Input
                    id="annualExpenses"
                    type="number"
                    step="0.01"
                    placeholder="Maintenance, taxes, insurance"
                    value={annualExpenses}
                    onChange={(e) => setAnnualExpenses(e.target.value)}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Business Fields */}
        {type === "business" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="currentAssets">Current Assets ({currency})</Label>
              <Input
                id="currentAssets"
                type="number"
                step="0.01"
                placeholder="Cash + inventory + receivables"
                value={currentAssets}
                onChange={(e) => setCurrentAssets(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessDebts">Business Debts ({currency})</Label>
              <Input
                id="businessDebts"
                type="number"
                step="0.01"
                placeholder="Outstanding business debts"
                value={businessDebts}
                onChange={(e) => setBusinessDebts(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownership">Your Ownership (%)</Label>
              <Input
                id="ownership"
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={ownershipPercentage}
                onChange={(e) => setOwnershipPercentage(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Value Input (for non-gold/silver/rental/business) */}
        {!["gold", "silver", "business"].includes(type) && !(type === "rental" && propertyType === "rental") && (
          <div className="space-y-2">
            <Label htmlFor="value">
              {type === "rental" && propertyType === "trade" ? "Market Value" : "Value"} ({currency})
            </Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        )}

        {/* Zakatable Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="zakatable">Include in Zakath Calculation</Label>
            <p className="text-sm text-muted-foreground">
              Toggle off for exempt assets
            </p>
          </div>
          <Switch
            id="zakatable"
            checked={isZakatable}
            onCheckedChange={setIsZakatable}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        {existingAsset && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
        <Button type="submit" className="flex-1">
          {existingAsset ? "Update" : "Add"} Asset
        </Button>
      </div>
    </form>
  )
}
