# ZakathCalc

A privacy-friendly web app for calculating your yearly **Zakath** (Zakat), the obligatory 2.5% charity on qualifying wealth in Islam.

Add your assets and short-term debts. ZakathCalc checks whether your wealth meets the **nisab** threshold, tracks your **hawl** (lunar year), and shows how much Zakath is due, broken down by asset type.

All data stays in your browser (`localStorage`). There's no account, no backend and no database.

## Features

- **Asset tracking** for cash, gold, silver, stocks and ETFs, real estate, business assets and other assets
- **Liabilities** for debts due within the year, which are deducted from zakatable wealth
- **Nisab check** against either the gold standard (87.48 g) or the silver standard (612.36 g)
- **Hawl tracker** with a countdown and progress bar to your next lunar-year anniversary, plus the approximate Hijri date
- **Calculation breakdown** showing the Zakath due per asset category, with a chart on the dashboard
- **History** of the Zakath payments you've marked as paid
- **Multi-currency** support: USD, GBP, EUR, AED, SAR, MYR, PKR, INR, BDT, IDR and LKR
- **Madhab** preference (Hanafi, Shafi'i, Maliki or Hanbali)
- Light and dark mode, and a responsive layout that works on mobile

## How the calculation works

| Asset | What counts as zakatable |
| --- | --- |
| Cash | Full balance |
| Gold / Silver | Weight × current price per gram (or the value you enter) |
| Individual stocks | Full market value |
| ETFs / funds | 30% of market value (an estimate of the underlying zakatable assets) |
| Rental property | Net annual rent (rent × 12 − annual expenses); the property's value itself is not zakatable |
| Trade property | Full market value |
| Business | (Current assets − business debts) × your ownership % |

**Zakath due** = (total zakatable wealth − liabilities due within a year) × 2.5%. It is only due when the net amount is at or above the nisab.

The calculation logic is in [`lib/zakath-engine.ts`](lib/zakath-engine.ts).

> **Note:** Metal prices and exchange rates are fixed defaults in [`lib/zakath-store.ts`](lib/zakath-store.ts), and you can change them on the Settings page. Hijri dates are approximate. This tool is a guide only, so please consult a qualified scholar about your own situation.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) and React 19
- TypeScript
- Tailwind CSS v4 and [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [Zustand](https://github.com/pmndrs/zustand) for state, saved to `localStorage`
- [Recharts](https://recharts.org/) for charts

## Getting started

You need **Node.js 20 or later**.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |

## Project structure

```
app/                 Next.js entry point (layout, page, global styles)
components/
  app-shell.tsx      Header, navigation and page switching
  dashboard/         Overview, nisab status, stats and chart
  assets/            Asset and liability management
  calculator/        Zakath calculation and breakdown
  history/           Past payments
  onboarding/        First-run setup
  settings/          Currency, madhab, nisab, hawl date and prices
  ui/                shadcn/ui components
hooks/               Shared React hooks
lib/
  zakath-engine.ts   Calculation logic (pure functions)
  zakath-store.ts    App state and persistence
  hijri.ts           Hijri date and hawl helpers
public/              Icons
```

## Deploying

The app is a fully static page, so it deploys to [Vercel](https://vercel.com/) with no configuration. It also includes `@vercel/analytics`, which you can remove in `app/layout.tsx` if you don't want it.

## Disclaimer

ZakathCalc is based on common positions in Islamic jurisprudence. Rulings differ between scholars and schools, especially for stocks, retirement funds, debts and jewellery. Use the results as a starting point, not as a fatwa.
