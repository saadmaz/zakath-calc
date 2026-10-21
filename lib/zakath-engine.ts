// Zakath Calculation Engine
// Based on Islamic jurisprudence standards

// Constants
export const GOLD_NISAB_GRAMS = 87.48 // grams of gold
export const SILVER_NISAB_GRAMS = 612.36 // grams of silver
export const ZAKATH_RATE = 0.025 // 2.5%
export const LUNAR_YEAR_DAYS = 354 // Hawl duration
export const STOCK_ETF_PROXY = 0.3 // 30% of ETF value is zakatable

// Asset Types
export type AssetType =
  | "cash"
  | "gold"
  | "silver"
  | "stocks"
  | "rental"
  | "business"
  | "other"

export type PropertyType = "rental" | "trade" | "personal"

export interface Asset {
  id: string
  type: AssetType
  label: string
  value: number
  unit: string
  isZakatable: boolean
  lastUpdated: Date
  // For gold/silver
  weightInGrams?: number
  // For stocks
  isETF?: boolean
  // For property
  propertyType?: PropertyType
  monthlyRent?: number
  annualExpenses?: number
  // For business
  currentAssets?: number
  businessDebts?: number
  ownershipPercentage?: number
}

export interface Liability {
  id: string
  label: string
  amount: number
  dueWithinYear: boolean
}

export interface MetalPrices {
  goldPerGram: number
  silverPerGram: number
  currency: string
  updatedAt: Date
}

export interface FXRates {
  [key: string]: number
}

export interface ZakathBreakdown {
  cash: number
  gold: number
  silver: number
  stocks: number
  rental: number
  business: number
  other: number
}

export interface ZakathCalculation {
  date: Date
  nisabGold: number
  nisabSilver: number
  nisabUsed: "gold" | "silver"
  nisabThreshold: number
  totalZakatableWealth: number
  totalLiabilities: number
  netWealth: number
  zakathDue: number
  breakdown: ZakathBreakdown
  hawlMet: boolean
  isAboveNisab: boolean
  assetTotals: ZakathBreakdown
}

export interface UserSettings {
  currency: string
  madhab: "hanafi" | "shafii" | "maliki" | "hanbali"
  hawlDate: Date | null
  useGoldNisab: boolean
}

// Calculate nisab thresholds in user's currency
export function calculateNisab(
  metalPrices: MetalPrices,
  currency: string,
  fxRates: FXRates
): { gold: number; silver: number } {
  const rate = fxRates[`${metalPrices.currency}_${currency}`] || 1

  return {
    gold: GOLD_NISAB_GRAMS * metalPrices.goldPerGram * rate,
    silver: SILVER_NISAB_GRAMS * metalPrices.silverPerGram * rate,
  }
}

// Calculate zakatable value for gold/silver assets
export function calculateMetalValue(
  weightInGrams: number,
  pricePerGram: number
): number {
  return weightInGrams * pricePerGram
}

// Calculate zakatable value for stocks
export function calculateStockValue(
  marketValue: number,
  isETF: boolean
): number {
  // ETFs use 30% proxy approach
  // Individual stocks are fully zakatable
  return isETF ? marketValue * STOCK_ETF_PROXY : marketValue
}

// Calculate zakatable value for rental property
// Zakath is on net rental income only (not property value)
export function calculateRentalPropertyValue(
  monthlyRent: number,
  annualExpenses: number
): number {
  const annualRent = monthlyRent * 12
  const netIncome = annualRent - annualExpenses
  return Math.max(0, netIncome)
}

// Calculate zakatable value for trade property
// Zakath is on full market value
export function calculateTradePropertyValue(marketValue: number): number {
  return marketValue
}

// Calculate zakatable value for business assets
export function calculateBusinessValue(
  currentAssets: number,
  businessDebts: number,
  ownershipPercentage: number = 100
): number {
  const netAssets = currentAssets - businessDebts
  return Math.max(0, netAssets * (ownershipPercentage / 100))
}

// Calculate days until hawl anniversary
export function calculateDaysUntilHawl(hawlDate: Date): number {
  const now = new Date()
  const nextHawl = new Date(hawlDate)

  // Adjust to next occurrence
  while (nextHawl <= now) {
    nextHawl.setDate(nextHawl.getDate() + LUNAR_YEAR_DAYS)
  }

  const diffTime = nextHawl.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Check if hawl has been met (wealth above nisab for full lunar year)
export function isHawlMet(hawlDate: Date | null): boolean {
  if (!hawlDate) return false

  const now = new Date()
  const hawlStart = new Date(hawlDate)
  const diffTime = now.getTime() - hawlStart.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= LUNAR_YEAR_DAYS
}

// Main calculation function
export function calculateZakath(
  assets: Asset[],
  liabilities: Liability[],
  metalPrices: MetalPrices,
  settings: UserSettings,
  fxRates: FXRates
): ZakathCalculation {
  const nisab = calculateNisab(metalPrices, settings.currency, fxRates)

  // Use silver nisab by default (more inclusive) unless user prefers gold
  const nisabUsed = settings.useGoldNisab ? "gold" : "silver"
  const nisabThreshold = settings.useGoldNisab ? nisab.gold : nisab.silver

  // Calculate totals by asset type
  const assetTotals: ZakathBreakdown = {
    cash: 0,
    gold: 0,
    silver: 0,
    stocks: 0,
    rental: 0,
    business: 0,
    other: 0,
  }

  const breakdown: ZakathBreakdown = {
    cash: 0,
    gold: 0,
    silver: 0,
    stocks: 0,
    rental: 0,
    business: 0,
    other: 0,
  }

  // Process each asset
  assets.forEach((asset) => {
    if (!asset.isZakatable) return

    let zakatableValue = 0

    switch (asset.type) {
      case "cash":
        zakatableValue = asset.value
        assetTotals.cash += asset.value
        break

      case "gold":
        zakatableValue = asset.weightInGrams
          ? calculateMetalValue(asset.weightInGrams, metalPrices.goldPerGram)
          : asset.value
        assetTotals.gold += zakatableValue
        break

      case "silver":
        zakatableValue = asset.weightInGrams
          ? calculateMetalValue(asset.weightInGrams, metalPrices.silverPerGram)
          : asset.value
        assetTotals.silver += zakatableValue
        break

      case "stocks":
        zakatableValue = calculateStockValue(asset.value, asset.isETF || false)
        assetTotals.stocks += zakatableValue
        break

      case "rental":
        if (asset.propertyType === "trade") {
          zakatableValue = calculateTradePropertyValue(asset.value)
        } else if (asset.propertyType === "rental") {
          zakatableValue = calculateRentalPropertyValue(
            asset.monthlyRent || 0,
            asset.annualExpenses || 0
          )
        }
        assetTotals.rental += zakatableValue
        break

      case "business":
        zakatableValue = calculateBusinessValue(
          asset.currentAssets || asset.value,
          asset.businessDebts || 0,
          asset.ownershipPercentage || 100
        )
        assetTotals.business += zakatableValue
        break

      case "other":
        zakatableValue = asset.value
        assetTotals.other += asset.value
        break
    }

    breakdown[asset.type] += zakatableValue * ZAKATH_RATE
  })

  // Calculate total zakatable wealth
  const totalZakatableWealth = Object.values(assetTotals).reduce(
    (sum, val) => sum + val,
    0
  )

  // Calculate deductible liabilities (only those due within the year)
  const totalLiabilities = liabilities
    .filter((l) => l.dueWithinYear)
    .reduce((sum, l) => sum + l.amount, 0)

  // Net wealth for zakath calculation
  const netWealth = totalZakatableWealth - totalLiabilities

  // Check if above nisab
  const isAboveNisab = netWealth >= nisabThreshold

  // Check hawl
  const hawlMet = isHawlMet(settings.hawlDate)

  // Calculate zakath due (only if above nisab)
  const zakathDue = isAboveNisab ? netWealth * ZAKATH_RATE : 0

  return {
    date: new Date(),
    nisabGold: nisab.gold,
    nisabSilver: nisab.silver,
    nisabUsed,
    nisabThreshold,
    totalZakatableWealth,
    totalLiabilities,
    netWealth,
    zakathDue,
    breakdown,
    hawlMet,
    isAboveNisab,
    assetTotals,
  }
}

// Format currency
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
