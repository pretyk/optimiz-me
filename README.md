# Retirator

A Hebrew, RTL Israeli early-retirement and bridge-phase planning simulator.
React, Tailwind CSS, Lucide icons, and Vite. All application components, financial
functions, and custom styles live in [`src/App.jsx`](src/App.jsx).

**100% client-side. No backend, analytics, accounts, cookies, storage, external
fonts, or financial-data transmission.** Reloading resets the scenario.
The web host still receives ordinary requests for static assets; anonymity here
means the app neither collects nor transmits the inputs, not network anonymity.

## License

Licensed under the [MIT License](LICENSE). Copyright (c) 2026 pretyk.
Use, modification, distribution, and commercial use are permitted provided the
copyright and permission notice are retained. The software is provided without
warranty. Third-party dependencies remain under their respective licenses.
The financial disclaimer below explains the simulator's limitations; it does
not impose additional restrictions on the rights granted by the MIT License.

## Important disclaimer / הבהרה חשובה

**Simulation only. The author is not a financial advisor. This tool does not
replace professional, individually tailored financial advice. All displayed
numbers are estimates, not promises. Read the full Hebrew terms below before use.**

### מטרת הכלי והיעדר ייעוץ מקצועי

Retirator נועד ללמידה ולהמחשת תרחישים בלבד. מחבר האתר אינו יועץ פיננסי
ואינו מספק במסגרת האתר ייעוץ השקעות, שיווק השקעות, ייעוץ פנסיוני, ייעוץ
מס או ייעוץ משפטי. השימוש אינו יוצר יחסי יועץ–לקוח או חובת נאמנות מקצועית.
אין בתוכן המלצה, הצעה או שידול לקנות, למכור או להחזיק מוצר פיננסי, למשוך
כספים או לפרוש מעבודה. נתוני ברירת המחדל הם דוגמה בלבד, ולא המלצה.

### אומדנים בלבד וסביבה משתנה

כל הסכומים, התחזיות, התשואות, הקצבאות, המקדמים ושיעורי המס הם הערכות
המבוססות על קלט המשתמש ועל הנחות מפושטות. אין התחייבות לדיוק, שלמות,
עדכניות, התאמה לצורך אישי, רווח, קצבה, פטור ממס או יכולת לממן פרישה.
ייתכנו טעויות תוכנה, חישוב או תוכן; תוצאות בפועל עשויות להיות שונות מהותית,
לרבות הפסד הון.

השווקים, האינפלציה, הריבית, דמי הניהול, תוחלת החיים ותנאי המוצרים והקרנות
עשויים להשתנות. גם החוקים, התקנות, הפרשנות, גילי הפרישה, תקרות המס,
הפטורים והזכאות לקצבאות עשויים להשתנות בכל עת. האתר אינו מספק נתוני שוק
בזמן אמת או עדכון אוטומטי של הדין. תשואה קבועה אינה תחזית ואינה משקפת
במלואה סיכון רצף תשואות, תנודתיות, הפסדים ושינויי יוקר מחיה.

שיעורי המס, גילי הפרישה ומקדמי ההמרה באתר הם הנחות להמחשה, ולא חישוב
מס או זכאות אישי. פטורי קרן השתלמות וקיבוע זכויות כפופים לדין ולנתונים
אישיים. תרחיש פנסיה לפני גיל 60 אינו אישור למשיכת קצבה. מגבלות נוספות
והנחות החישוב מפורטות בפרק המודל הפיננסי להלן.

### חובת בדיקה וייעוץ אישי

אין להסתמך על האתר כבסיס יחיד או מכריע להחלטה. לפני השקעה, משיכה,
שינוי חיסכון, תכנון מס או פרישה, יש לפנות לייעוץ פיננסי אישי מאיש מקצוע
מוסמך ובעל רישיון מתאים לפי הדין, ובמידת הצורך ליועץ פנסיוני, יועץ השקעות,
רואה חשבון, יועץ מס או עורך דין. יש לבדוק עצמאית נתונים, זכאות והוראות
דין מול הגופים והרשויות הרלוונטיים.

### הגבלת אחריות וזכויות לפי דין

השימוש באתר ובתוצאותיו הוא לפי בחירת המשתמש ועל אחריותו, בכפוף לדין החל.
האתר ניתן **כפי שהוא וכפי שהוא זמין**, ללא מצג או אחריות מפורשים או
משתמעים, ככל שהדין מתיר, לרבות ביחס לדיוק, זמינות או התאמה למטרה מסוימת.
במידה המרבית המותרת בדין, המחבר, המתחזקים והתורמים אינם אחראים לנזק או
הפסד הנובעים מהשימוש, מחוסר יכולת להשתמש, מהסתמכות על התוכן או משגיאות
והשמטות, לרבות הפסדי השקעה, אובדן רווח או חיסכון, חבות מס ונזק ישיר,
עקיף, נלווה או תוצאתי.

אין בהבהרה כדי לשלול זכות קוגנטית או לפטור מאחריות שאי אפשר להגביל או
לשלול על פי דין. ההגבלות חלות רק במידה המותרת בדין. האישור בכניסה מציין
הבנה של מטרת הכלי ומגבלותיו ואינו ויתור על זכויות שלא ניתן לוותר עליהן.
אם אינך מסכים או מסכימה לתנאים, אין להשתמש בסימולטור.

**Maintainer note:** this disclaimer is a draft, not legal advice or a guarantee
of enforceability. Have an Israeli lawyer review it against the actual service,
operator, audience, hosting arrangements, and applicable law before relying on it.
Do not assume a disclaimer excludes liability that the law does not allow to be
excluded. No server-side consent evidence is collected or retained.

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

The live site is hosted on Azure Static Web Apps (see [Deployment](#deployment)).
`dist` also works on any static HTTPS host. No environment variables or server are
required. For subdirectory hosting, set Vite's `base` to the deployment path.
Production HTML includes a self-only asset content policy and disables outgoing
connections. It is omitted in development to allow Vite's local hot-reload
runtime. On production hosts, additionally set HTTP headers
`Content-Security-Policy: frame-ancestors 'none'`,
`X-Content-Type-Options: nosniff`, and `Referrer-Policy: no-referrer`.
Inline styles are required by the single-file design. Do not add analytics.

## Using the simulator

- On each fresh page load, read the entry disclaimer, check the unchecked
  agreement box, and explicitly accept before using the simulator. The backdrop
  is blurred and the underlying controls are inert. Escape and backdrop clicks
  do not accept or dismiss it. Declining leads to the information page.
- Read the full disclaimer at `/#disclaimer` and the privacy explanation at
  `/#privacy`, including before acceptance. These are client-side hash routes,
  so direct links and refresh work on static hosts without routing configuration.
- Acceptance lives in React memory only: no cookies, local/session storage,
  timestamp, user identifier, or consent log. Reloading requires acceptance again.
  Same-page navigation preserves draft inputs and committed results.
- Enter a custom scenario. Every numeric field has a
  comma-formatted input, plus/minus buttons, an RTL slider, and a Hebrew tooltip.
  On phones and touch-capable tablets or laptops, sliders have a 44px-high touch
  area separated from the number-control row by 16px of non-interactive space;
  plus/minus buttons retain at least 44×44px touch targets.
- Changes update **draft** values, tax alerts, and monthly delta previews.
  Results, chart, and formula-modal variables stay **committed** until clicking
  **חשב סימולציה**. Invalid inputs and timelines explicitly block that action.
- The chart follows actual monthly end-of-period withdrawals, with an
  independently compounded pension balance. Point at the chart to inspect ages.
- The formula button opens a keyboard-accessible native dialog. Celebrations
  and deficit feedback respect reduced-motion preferences.
- Profile shortcuts have been removed; initial balances are illustrative defaults.
- The privacy badge links to the privacy page. Footer links expose both
  information pages and the public GitHub repository for code contributions.
  GitHub is an external service, opened only by an explicit click, without a
  referrer or financial data. Do not include personal financial information in
  issues, contributions, or screenshots.

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
Liquid savings and Keren Hishtalmut inputs each permit amounts up to ₪10 million.
The target capital and pension balance inputs retain their ₪100 million maximum.

### PRD corrections

The supplied document is preserved in
[`docs/retirator_prd_and_design_doc.md`](docs/retirator_prd_and_design_doc.md).

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
formatted inputs, sliders and steppers, invalid timelines, zero-rate
and zero-duration scenarios, impossible targets, confetti and risk precedence,
modal focus and Escape, overflow, axe accessibility, reduced motion, privacy,
and runtime errors. Additional tests cover explicit agreement, blocked dismissal,
declining, keyboard focus, both legal pages, direct-link refresh, browser history,
draft preservation, acceptance reset, absence of storage or data requests,
GitHub link attributes, and accessibility before acceptance.

`tests/e2e/mobile.spec.js` runs on a Pixel 7 and on a small 360px phone. It
checks for no horizontal overflow on every page, touch targets of at least 44×44px,
18px inputs (avoiding automatic iOS focus zoom), 16px field labels, supporting
text of at least 14px (including legal pages and dialogs), the sticky
calculate bar and its draft preview, scrolling to the results after
calculating, tap-to-open tooltips that stay on screen, touch steppers, tapping
the chart, dialogs that fit the screen, and axe accessibility.

`npm run test:e2e` expects a current `dist` build and a free port 4173.
Use `npx playwright show-report` to inspect the report. GitHub Actions runs
the same checks and retains browser artifacts on failure.

The production app makes no third-party requests. npm and browser installation
do require network access during development.

## Deployment

Production: https://nice-pebble-0150fe203.2.azurestaticapps.net

The site runs on the **Azure Static Web Apps Free tier**, with no API, no
authentication, and no Application Insights.
[`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) deploys it:

1. Every PR and every push to `main` runs `npm run check`. A push to `main`
   keeps the tested `dist` folder as an artifact.
2. After the checks pass on `main`, the deploy job uploads those exact files to
   production. The GitHub `production` environment accepts deployments from
   `main` only.
3. There are no PR preview environments. A Static Web App has a single
   deployment token, and that token can also deploy to production, so only
   `main` may obtain it. Verify PRs locally with `npm run build && npm run preview`.

GitHub signs in to Azure with OIDC through a user-assigned managed identity. Its
only federated credential trusts the `production` environment. No Azure secret
is stored in GitHub. The identity has a custom role that can only read the
Static Web App and its deployment token. The workflow fetches the token at run
time and masks it.

[`public/staticwebapp.config.json`](public/staticwebapp.config.json) serves the
production CSP (`connect-src 'none'`, `frame-ancestors 'none'`) and the
privacy headers as real HTTP headers. It also returns 404 for the built-in
sign-in routes (`/.auth/login/github`, `aad`, and `twitter`). `tests/deploy-config.test.js` keeps the header CSP in sync
with the build-time CSP in `vite.config.js`.

### Infrastructure

The infrastructure is Bicep in [`infra/`](infra), deployed at subscription scope:

```sh
az deployment sub create -l westeurope -n retirator-infra -f infra/main.bicep
```

It creates the `rg-retirator` resource group, the `swa-retirator` Static Web
App (Free tier, staging environments disabled), the `id-retirator-github`
managed identity with a federated credential for the `production` GitHub
environment, and the custom deployer role. Bicep runs in incremental mode,
so removing a resource from the template does not delete it in Azure; delete
it manually. The workflow reads the repository variables `AZURE_CLIENT_ID`,
`AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, and
`AZURE_STATIC_WEB_APP_NAME`; none of them are secrets.

If the deployment token may have been exposed, reset it with
`az staticwebapp secrets reset-api-key -n swa-retirator -g rg-retirator`.
Never deploy manually; every release goes through CI.

## Contributing with AI agents

Rules for every contributor, human or AI, are in [`AGENTS.md`](AGENTS.md).
The repository also includes custom agents in [`.github/agents`](.github/agents)
and skills in [`.github/skills`](.github/skills):

- `code-reviewer`: reviews every PR for bugs, regressions, and missing tests.
- `finance-reviewer`: checks the formulas and the Israeli tax and pension assumptions.
- `rtl-ux-reviewer`: checks Hebrew copy, RTL layout, mobile, and accessibility.
- `privacy-guard`: blocks tracking, storage, network calls, and weaker headers.
- Skills: `code-review-checklist`, `israeli-retirement-rules`,
  `hebrew-copy-style`, and `azure-static-web-apps-deploy` (Azure Static Web
  Apps hosting and CI/CD).
