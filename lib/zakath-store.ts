"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  Asset,
  Liability,
  MetalPrices,
  UserSettings,
  ZakathCalculation,
  calculateZakath,
  generateId,
  FXRates,
} from "./zakath-engine"

// Default metal prices (USD) - In production, fetch from API
const DEFAULT_METAL_PRICES: MetalPrices = {
  goldPerGram: 75.5, // ~$75.50 per gram
  silverPerGram: 0.95, // ~$0.95 per gram
  currency: "USD",
  updatedAt: new Date(),
}

// Default FX rates
const DEFAULT_FX_RATES: FXRates = {
  USD_USD: 1,
  USD_LKR: 320,
  USD_GBP: 0.79,
  USD_EUR: 0.92,
  USD_AED: 3.67,
  USD_SAR: 3.75,
  USD_MYR: 4.7,
  USD_PKR: 278,
  USD_INR: 83,
  USD_BDT: 110,
  USD_IDR: 15800,
}

interface ZakathStore {
  // User settings
  settings: UserSettings
  updateSettings: (settings: Partial<UserSettings>) => void

  // Assets
  assets: Asset[]
  addAsset: (asset: Omit<Asset, "id" | "lastUpdated">) => void
  updateAsset: (id: string, asset: Partial<Asset>) => void
  deleteAsset: (id: string) => void

  // Liabilities
  liabilities: Liability[]
  addLiability: (liability: Omit<Liability, "id">) => void
  updateLiability: (id: string, liability: Partial<Liability>) => void
  deleteLiability: (id: string) => void

  // Metal prices
  metalPrices: MetalPrices
  updateMetalPrices: (prices: Partial<MetalPrices>) => void

  // FX rates
  fxRates: FXRates
  updateFxRates: (rates: FXRates) => void

  // Calculations
  calculations: ZakathCalculation[]
  currentCalculation: ZakathCalculation | null
  calculateZakath: () => ZakathCalculation
  markAsPaid: (date?: Date) => void

  // Onboarding
  hasCompletedOnboarding: boolean
  completeOnboarding: () => void

  // Reset
  resetStore: () => void
}

const initialSettings: UserSettings = {
  currency: "USD",
  madhab: "hanafi",
  hawlDate: null,
  useGoldNisab: false, // Silver nisab by default (more inclusive)
}

export const useZakathStore = create<ZakathStore>()(
  persist(
    (set, get) => ({
      // Settings
      settings: initialSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Assets
      assets: [],
      addAsset: (asset) =>
        set((state) => ({
          assets: [
            ...state.assets,
            { ...asset, id: generateId(), lastUpdated: new Date() },
          ],
        })),
      updateAsset: (id, updates) =>
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, ...updates, lastUpdated: new Date() } : a
          ),
        })),
      deleteAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        })),

      // Liabilities
      liabilities: [],
      addLiability: (liability) =>
        set((state) => ({
          liabilities: [...state.liabilities, { ...liability, id: generateId() }],
        })),
      updateLiability: (id, updates) =>
        set((state) => ({
          liabilities: state.liabilities.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),
      deleteLiability: (id) =>
        set((state) => ({
          liabilities: state.liabilities.filter((l) => l.id !== id),
        })),

      // Metal prices
      metalPrices: DEFAULT_METAL_PRICES,
      updateMetalPrices: (prices) =>
        set((state) => ({
          metalPrices: { ...state.metalPrices, ...prices, updatedAt: new Date() },
        })),

      // FX rates
      fxRates: DEFAULT_FX_RATES,
      updateFxRates: (rates) =>
        set(() => ({
          fxRates: rates,
        })),

      // Calculations
      calculations: [],
      currentCalculation: null,
      calculateZakath: () => {
        const state = get()
        const calculation = calculateZakath(
          state.assets,
          state.liabilities,
          state.metalPrices,
          state.settings,
          state.fxRates
        )
        set({ currentCalculation: calculation })
        return calculation
      },
      markAsPaid: (date = new Date()) => {
        const state = get()
        if (state.currentCalculation) {
          set({
            calculations: [
              ...state.calculations,
              { ...state.currentCalculation, date },
            ],
          })
        }
      },

      // Onboarding
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      // Reset
      resetStore: () =>
        set({
          settings: initialSettings,
          assets: [],
          liabilities: [],
          metalPrices: DEFAULT_METAL_PRICES,
          fxRates: DEFAULT_FX_RATES,
          calculations: [],
          currentCalculation: null,
          hasCompletedOnboarding: false,
        }),
    }),
    {
      name: "zakath-calculator-storage",
      partialize: (state) => ({
        settings: state.settings,
        assets: state.assets,
        liabilities: state.liabilities,
        calculations: state.calculations,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
)
