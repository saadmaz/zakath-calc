"use client"

import { useState, useEffect } from "react"
import { useZakathStore } from "@/lib/zakath-store"
import { Dashboard } from "@/components/dashboard/dashboard"
import { AssetsManager } from "@/components/assets/assets-manager"
import { CalculationPage } from "@/components/calculator/calculation-page"
import { SettingsPage } from "@/components/settings/settings-page"
import { HistoryPage } from "@/components/history/history-page"
import { Onboarding } from "@/components/onboarding/onboarding"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Wallet, 
  Calculator, 
  History, 
  Settings,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react"

type Page = "dashboard" | "assets" | "calculate" | "settings" | "history"

const NAV_ITEMS = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "assets" as Page, label: "Assets", icon: Wallet },
  { id: "calculate" as Page, label: "Calculate", icon: Calculator },
  { id: "history" as Page, label: "History", icon: History },
  { id: "settings" as Page, label: "Settings", icon: Settings },
]

export function AppShell() {
  const { hasCompletedOnboarding } = useZakathStore()
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [isDark, setIsDark] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const savedTheme = localStorage.getItem("theme")
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
    setMobileMenuOpen(false)
  }

  if (!mounted) {
    return null
  }

  if (!hasCompletedOnboarding) {
    return <Onboarding />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-1.5">
                <Calculator className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground text-lg">ZakathCalc</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleNavigate(item.id)}
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-card p-4">
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  onClick={() => handleNavigate(item.id)}
                  className="justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {currentPage === "dashboard" && (
          <Dashboard onNavigate={handleNavigate} />
        )}
        {currentPage === "assets" && (
          <AssetsManager onBack={() => handleNavigate("dashboard")} />
        )}
        {currentPage === "calculate" && (
          <CalculationPage 
            onBack={() => handleNavigate("dashboard")} 
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === "settings" && (
          <SettingsPage onBack={() => handleNavigate("dashboard")} />
        )}
        {currentPage === "history" && (
          <HistoryPage onBack={() => handleNavigate("dashboard")} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-6 mt-auto">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            ZakathCalc - Calculate your Zakath with confidence
          </p>
          <p className="mt-1 text-xs">
            Based on Islamic jurisprudence. Always consult with a qualified scholar for complex situations.
          </p>
        </div>
      </footer>
    </div>
  )
}
