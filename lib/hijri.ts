// Hijri Calendar Utilities for Hawl Tracking

const LUNAR_MONTH_DAYS = 29.530588853 // Average lunar month
const LUNAR_YEAR_DAYS = 354 // Approximately 12 lunar months

// Hijri month names
export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
]

// Simple Hijri date conversion (approximation)
// For production, use a proper library like hijri-date
export function gregorianToHijri(date: Date): {
  year: number
  month: number
  day: number
} {
  // Reference point: 1 Muharram 1 AH = July 16, 622 CE (Julian)
  const HIJRI_EPOCH = new Date(622, 6, 19).getTime() // July 19, 622 CE (Gregorian)

  const diffMs = date.getTime() - HIJRI_EPOCH
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  // Calculate Hijri year (approximate)
  const hijriYear = Math.floor(diffDays / LUNAR_YEAR_DAYS) + 1

  // Calculate day of Hijri year
  const dayOfYear = Math.floor(diffDays % LUNAR_YEAR_DAYS)

  // Calculate month and day
  const month = Math.floor(dayOfYear / LUNAR_MONTH_DAYS)
  const day = Math.floor(dayOfYear % LUNAR_MONTH_DAYS) + 1

  return {
    year: hijriYear,
    month: Math.min(month, 11), // 0-indexed, max 11
    day: Math.min(day, 30), // max 30 days
  }
}

// Format Hijri date
export function formatHijriDate(date: Date): string {
  const hijri = gregorianToHijri(date)
  return `${hijri.day} ${HIJRI_MONTHS[hijri.month]} ${hijri.year} AH`
}

// Get next hawl anniversary from a start date
export function getNextHawlDate(hawlStartDate: Date): Date {
  const now = new Date()
  const nextHawl = new Date(hawlStartDate)

  // Keep adding lunar years until we're in the future
  while (nextHawl <= now) {
    nextHawl.setDate(nextHawl.getDate() + LUNAR_YEAR_DAYS)
  }

  return nextHawl
}

// Calculate days remaining until hawl
export function getDaysUntilHawl(hawlStartDate: Date): number {
  const nextHawl = getNextHawlDate(hawlStartDate)
  const now = new Date()

  const diffMs = nextHawl.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// Calculate progress percentage through current hawl period
export function getHawlProgress(hawlStartDate: Date): number {
  const now = new Date()
  const nextHawl = getNextHawlDate(hawlStartDate)
  const prevHawl = new Date(nextHawl)
  prevHawl.setDate(prevHawl.getDate() - LUNAR_YEAR_DAYS)

  const totalDays = LUNAR_YEAR_DAYS
  const daysPassed = Math.floor(
    (now.getTime() - prevHawl.getTime()) / (1000 * 60 * 60 * 24)
  )

  return Math.min(100, Math.max(0, (daysPassed / totalDays) * 100))
}

// Format date nicely
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

// Get greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
