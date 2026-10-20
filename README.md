# Optimiz.me

A Hebrew, RTL Israeli early-retirement and bridge-phase planning simulator.
React, Tailwind CSS, Lucide icons, and Vite. All application components, financial
functions, and custom styles live in [`src/App.jsx`](src/App.jsx).

**100% client-side. No backend, analytics, accounts, cookies, storage, external
fonts, or financial-data transmission.** Reloading resets the scenario.
The web host still receives ordinary requests for static assets; anonymity here
means the app neither collects nor transmits the inputs, not network anonymity.

## Run locally

Requires Node.js 22.12+ in the 22.x line, 24.x (recommended), or 26+, and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To serve the optimized production build:

```sh
npm run build
npm run preview
```

Deploy `dist` to any static HTTPS host. No environment variables or server are
required. For subdirectory hosting, set Vite's `base` to the deployment path.
Production HTML includes a self-only asset content policy and disables outgoing
connections. It is omitted in development to allow Vite's local hot-reload
runtime. On production hosts, additionally set HTTP headers
`Content-Security-Policy: frame-ancestors 'none'`,
`X-Content-Type-Options: nosniff`, and `Referrer-Policy: no-referrer`.
Inline styles are required by the single-file design. Do not add analytics.

## Using the simulator

- Select a quick profile or enter a custom scenario. Every numeric field has a
  comma-formatted input, plus/minus buttons, an RTL slider, and a Hebrew tooltip.
- Changes update **draft** values, tax alerts, and monthly delta previews.
  Results, chart, and formula-modal variables stay **committed** until clicking
  **חשב סימולציה**. Invalid inputs and timelines explicitly block that action.
- The chart follows actual monthly end-of-period withdrawals, with an
  independently compounded pension balance. Point at the chart to inspect ages.
- The formula button opens a keyboard-accessible native dialog. Celebrations
  and deficit feedback respect reduced-motion preferences.
- Presets are starting balances only. The partial-retirement preset does **not**
  introduce part-time wages, future contributions, or a different financial model.

## Financial model and limitations

This is a deterministic educational scenario tool, **not investment, pension,
or tax advice, a safe-withdrawal guarantee, or a tax-law calculator**.
All amounts are real (today's purchasing power). Returns are assumed net of
inflation and fees, but before withdrawal taxes.

1. Assets before bridge start and pension assets compound annually:
   `balance * (1 + annualReturn / 100) ** years`.
2. During the bridge, `r = annualReturn / 100 / 12` and
   `N = (pensionAge - bridgeStartAge) * 12`.
   End-of-month gross withdrawals:
   `PMT = (PV * (1+r)^N - FV) * r / ((1+r)^N - 1)`.
   At zero return: `(PV - FV) / N`.
   This equals `-PMT(r, N, PV, -FV, 0)` in Excel.
3. Liquid savings' proportional withdrawals have an assumed effective tax of
   15% (25% tax on a hypothetical 60% gain share). Hishtalmut is assumed liquid
   and eligible for exemption. Real tax depends on cost basis, eligible deposits,
   losses, withdrawal rules, and other circumstances.
4. Pension conversion factor: 200 at age 67, plus 4 per earlier year,
   minus 3 per later year. It is not an insurer quotation.
5. Pension net uses **illustrative effective haircuts** of 35% before age 60,
   20% from 60 to the assumed statutory age, and 5% thereafter.
   The pre-60 amount is a penalty illustration, **not an available monthly pension**.
   These haircuts are not additive or actual marginal-tax calculations.
   Tax exemption at retirement is neither automatic nor necessarily complete.
6. Statutory ages are simplified as 67 for men and 65 for women. Actual women's
   retirement age depends on birth date and phased legislation. Personal
   exemptions, fixing of rights, other income, and tax credits are not modeled.
7. No new contributions, employment income, National Insurance benefit, market
   volatility, sequence-of-returns risk, or future legal changes are modeled.

**Boundary behavior:** pension age may equal bridge start (no bridge income).
It cannot precede bridge start. Increasing current age moves bridge start
forward if needed, without silently changing pension age. An unreachable capital
target produces a signed monthly funding shortfall, not spendable income or a
negative tax credit. Its chart shows actual zero-withdrawal capital growth,
not fictitious deposits. Zero balances and zero returns are supported.
Inputs permit amounts up to ₪100 million.

### PRD corrections

The supplied document is preserved in
[`docs/optimiz_me_prd_and_design_doc.md`](docs/optimiz_me_prd_and_design_doc.md).

- Its numerical benchmark conflicts with its formula. For PV = ₪3,000,000,
  FV = 0, N = 204, and annual return = 4%, the correct gross draw is
  **₪20,291.80465685561/month**, not ₪16,861.
- Its later annuity-factor expression conflicts with the explicit request.
  The app uses **minus 3 per year after 67**, as requested.
- The specified annual pre-bridge vs. nominal-monthly bridge compounding
  conventions differ slightly. This is intentional fidelity to the PRD,
  rather than silently converting to an effective monthly rate.

## Automated checks

```sh
npm test
npx playwright install chromium
npm run check
```

`npm run check` runs financial unit tests, builds production assets, and runs
Playwright against a dedicated production preview on port 4173. The browser
suite covers desktop and mobile Chromium, draft locking, all live tax tiers,
profiles, formatted inputs, sliders and steppers, invalid timelines, zero-rate
and zero-duration scenarios, impossible targets, confetti and risk precedence,
modal focus and Escape, overflow, axe accessibility, reduced motion, privacy,
and runtime errors.

`npm run test:e2e` expects a current `dist` build and a free port 4173.
Use `npx playwright show-report` to inspect the report. GitHub Actions runs
the same checks and retains browser artifacts on failure.

The production app makes no third-party requests. npm and browser installation
do require network access during development.
