"use client"

import { useState } from "react"
import { useZakathStore } from "@/lib/zakath-store"
import { formatCurrency, Asset, AssetType } from "@/lib/zakath-engine"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssetForm } from "./asset-form"
import { AssetList } from "./asset-list"
import { LiabilitiesManager } from "./liabilities-manager"
import { 
  Plus, 
  Wallet, 
  Gem, 
  TrendingUp, 
  Building, 
  Briefcase,
  ArrowLeft
} from "lucide-react"

interface AssetsManagerProps {
  onBack: () => void
}

const ASSET_CATEGORIES = [
  { type: "cash" as AssetType, label: "Cash & Savings", icon: Wallet, description: "Bank accounts, savings, and physical cash" },
  { type: "gold" as AssetType, label: "Gold", icon: Gem, description: "Gold jewelry, coins, and bars" },
  { type: "silver" as AssetType, label: "Silver", icon: Gem, description: "Silver jewelry, coins, and bars" },
  { type: "stocks" as AssetType, label: "Investments", icon: TrendingUp, description: "Stocks, ETFs, and mutual funds" },
  { type: "rental" as AssetType, label: "Real Estate", icon: Building, description: "Rental and trade properties" },
  { type: "business" as AssetType, label: "Business", icon: Briefcase, description: "Business assets and inventory" },
]

export function AssetsManager({ onBack }: AssetsManagerProps) {
  const { assets, settings } = useZakathStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedType, setSelectedType] = useState<AssetType>("cash")
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)

  const handleAddAsset = (type: AssetType) => {
    setSelectedType(type)
    setEditingAsset(null)
    setShowForm(true)
  }

  const handleEditAsset = (asset: Asset) => {
    setSelectedType(asset.type)
    setEditingAsset(asset)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAsset(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Manage Assets
            </h1>
            <p className="text-muted-foreground">
              Add and manage your zakatable assets and liabilities
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Assets</p>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(totalValue, settings.currency)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="assets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          {/* Asset Form Modal/Sheet */}
          {showForm && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>
                  {editingAsset ? "Edit Asset" : `Add ${ASSET_CATEGORIES.find(c => c.type === selectedType)?.label}`}
                </CardTitle>
                <CardDescription>
                  {ASSET_CATEGORIES.find(c => c.type === selectedType)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssetForm
                  type={selectedType}
                  existingAsset={editingAsset}
                  onClose={handleFormClose}
                  currency={settings.currency}
                />
              </CardContent>
            </Card>
          )}

          {/* Asset Categories */}
          {!showForm && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ASSET_CATEGORIES.map((category) => {
                const categoryAssets = assets.filter(a => a.type === category.type)
                const categoryTotal = categoryAssets.reduce((sum, a) => sum + a.value, 0)

                return (
                  <Card 
                    key={category.type}
                    className="cursor-pointer transition-colors hover:border-primary/50"
                    onClick={() => handleAddAsset(category.type)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <category.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{category.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {categoryAssets.length} {categoryAssets.length === 1 ? "item" : "items"}
                            </p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {categoryTotal > 0 && (
                        <p className="mt-4 text-lg font-semibold text-foreground">
                          {formatCurrency(categoryTotal, settings.currency)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Asset List */}
          {assets.length > 0 && !showForm && (
            <Card>
              <CardHeader>
                <CardTitle>All Assets</CardTitle>
                <CardDescription>
                  Your complete list of zakatable assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssetList 
                  assets={assets} 
                  currency={settings.currency}
                  onEdit={handleEditAsset}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="liabilities">
          <LiabilitiesManager currency={settings.currency} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
