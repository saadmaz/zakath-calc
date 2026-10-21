"use client"

import { Asset, AssetType, formatCurrency } from "@/lib/zakath-engine"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  Gem, 
  TrendingUp, 
  Building, 
  Briefcase,
  MoreHorizontal,
  Pencil,
  Package
} from "lucide-react"

interface AssetListProps {
  assets: Asset[]
  currency: string
  onEdit: (asset: Asset) => void
}

const ASSET_ICONS: Record<AssetType, typeof Wallet> = {
  cash: Wallet,
  gold: Gem,
  silver: Gem,
  stocks: TrendingUp,
  rental: Building,
  business: Briefcase,
  other: Package,
}

const ASSET_LABELS: Record<AssetType, string> = {
  cash: "Cash",
  gold: "Gold",
  silver: "Silver",
  stocks: "Stocks",
  rental: "Property",
  business: "Business",
  other: "Other",
}

export function AssetList({ assets, currency, onEdit }: AssetListProps) {
  // Group assets by type
  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = []
    }
    acc[asset.type].push(asset)
    return acc
  }, {} as Record<AssetType, Asset[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedAssets).map(([type, typeAssets]) => {
        const Icon = ASSET_ICONS[type as AssetType]
        const typeTotal = typeAssets.reduce((sum, a) => sum + a.value, 0)

        return (
          <div key={type} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {ASSET_LABELS[type as AssetType]}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {typeAssets.length}
                </Badge>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {formatCurrency(typeTotal, currency)}
              </span>
            </div>
            
            <div className="space-y-2">
              {typeAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {asset.label}
                      </p>
                      {!asset.isZakatable && (
                        <Badge variant="outline" className="text-xs">
                          Exempt
                        </Badge>
                      )}
                    </div>
                    {asset.weightInGrams && (
                      <p className="text-sm text-muted-foreground">
                        {asset.weightInGrams}g
                      </p>
                    )}
                    {asset.propertyType && (
                      <p className="text-sm text-muted-foreground capitalize">
                        {asset.propertyType} property
                      </p>
                    )}
                    {asset.isETF && (
                      <p className="text-sm text-muted-foreground">
                        ETF (30% zakatable)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(asset.value, currency)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(asset)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
