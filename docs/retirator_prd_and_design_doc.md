# Retirator — Master Prompt & Technical Design Document (PRD)

> Subsequent user-directed revision (20 October 2026): remove quick profiles,
> add an in-memory entry agreement, Hebrew privacy/disclaimer information pages,
> a public repository contribution link, and the updated headline
> "מתי אפשר לעבוד כי רוצים, לא כי חייבים?".
> The original requirements below remain as historical design context.

> Implementation notes: the original requirements below are preserved. The stated
> PMT benchmark is incorrect: the specified formula gives ₪20,291.80465685561
> (PV = 3,000,000, FV = 0, N = 204, annual rate = 4%), not ₪16,861.
> Where the annuity-factor specifications conflict, the explicit user requirement
> takes precedence: +4 per year before 67, −3 per year after 67.
> Tax percentages and statutory ages are simplified scenario assumptions, not
> an implementation of Israeli tax law or a guarantee of pension eligibility.
> The Semi FIRE profile label is localized as "מעבר להוראה - פרישה חלקית";
> the model does not include employment income after bridge start.

---

## Part 1: Master Prompt (Copy & Paste for AI / LLM Builders)

> **Instructions:** Copy the block below and paste it directly into your AI coding assistant (e.g., Cursor, Claude, ChatGPT, or Windsurf) to generate the complete application from scratch.

```text
Act as an Expert Frontend Architect and Financial Engineer. Build a complete, production-ready, single-page React application called "Retirator" — an Israeli Early Retirement (FIRE) and "Bridge Phase" Simulator.

### Core Philosophy & Architecture:
- **100% Client-Side & Anonymous:** Zero backend, zero telemetry. Prominently display a privacy badge in Hebrew confirming no data leaves the browser ("100% אנונימי - הנתונים מחושבים בדפדפן שלך בלבד").
- **Language & Layout:** The entire user interface, labels, tooltips, and alerts MUST be in Hebrew, strictly RTL (`dir="rtl"`).
- **Aesthetic:** "Dark Mode Fintech Pro" (inspired by Stripe Dark, Linear, and professional trading terminals). Deep obsidian/navy backgrounds (`#0b0f19`), slate card surfaces (`#131826`), crisp borders (`#262f45`), and high-contrast typography. Accents in Indigo (`#6366f1`), Emerald (`#10b981`), Amber (`#f59e0b`), and Rose (`#f43f5e`).

### State Management (Draft vs. Committed Pattern):
- Implement a two-tier state system: `draftState` (updates instantly as the user drags sliders or types) and `committedState` (updates ONLY when the user clicks the main "חשב סימולציה" button).
- When `draftState !== committedState`, enter `isDirty` mode:
  1. Display a pulsing "מצב טיוטה - לחץ על חישוב לעדכון" banner over the results dashboard.
  2. Calculate and display live "+/-" delta previews on the result headers showing how the pending changes will impact the monthly allowance compared to the currently locked state.
  3. The main "חשב סימולציה" button should glow and pulse, inviting the user to lock in the changes.

### Inputs & Controls (Right Panel):
All numerical inputs must support BOTH custom-styled RTL range sliders (with dynamic gradient track fills) AND formatted number inputs with commas (e.g., `1,500,000`) and `+` / `-` stepper buttons. Include an info `(i)` tooltip next to every field explaining the Israeli financial and tax context in Hebrew.
1. **Quick Profiles Bar (פרופילים מהירים):** Preset buttons that auto-populate fields:
   - "ארכיטקט תוכנה" (Age: 50, Gender: Male, Stop work: 52, Pension Age: 67, Liquid Savings: 1.8M, Hishtalmut: 1.2M, Target Capital: 500K, Pension Balance: 2.5M).
   - "מעבר להוראה - Semi FIRE" (Age: 45, Gender: Male, Stop work: 55, Pension Age: 67, Liquid Savings: 800K, Hishtalmut: 600K, Target Capital: 300K, Pension Balance: 1.8M).
   - "הייטקיסט צעיר" (Age: 32, Gender: Male, Stop work: 45, Pension Age: 67, Liquid Savings: 1.2M, Hishtalmut: 500K, Target Capital: 1M, Pension Balance: 600K).
2. **Demographics & Timeline (נתונים אישיים וציר זמן):**
   - Gender Toggle: `גבר` (Default, official retirement age = 67) / `אישה` (official retirement age = 65).
   - Current Age (`גיל נוכחי`, default 50, range 25–70).
   - Stop Working / Bridge Start Age (`גיל הפסקת עבודה - תחילת גישור`, range `currentAge` to 70).
   - Pension Activation Age (`גיל משיכת פנסיה`, range 50 to 75).
   - **CRITICAL LIVE ALERT:** Directly underneath the Pension Activation Age slider, render a *Live Reactive Tax Alert* (in Hebrew) that updates immediately on slider drag (`draftState`), independent of the Calculate button:
     - If `pensionAge >= officialAge` (67M/65F): Emerald badge ("פטור ממס (קיבוע זכויות) - משיכה אופטימלית בגיל פרישה חוקי").
     - If `60 <= pensionAge < officialAge`: Amber warning badge ("אזהרת מס (גיל 60 עד גיל פרישה) - הקצבה תחויב במס שולי כהכנסה רגילה ללא פטור קיבוע זכויות").
     - If `pensionAge < 60`: Rose shaking danger badge ("סכנת מס! משיכה שלא כדין (מתחת לגיל 60) - קנס שבירה של 35% לפחות ומס שולי גבוה!").
3. **Capital & Bridge Parameters (הון ונכסים לגישור):**
   - Liquid Savings (`חיסכון נזיל / תיק השקעות` - taxable).
   - Keren Hishtalmut (`קרן השתלמות` - 0% tax).
   - Target Remaining Capital at Pension Age (`יעד הון להשאיר בגיל פנסיה` - `FV` left after bridge).
   - Expected Annual Real Return (`תשואה שנתית ריאלית צפויה`, default 4.0%, range 0%–10%, step 0.5%).
4. **Pension Projection (חיסכון פנסיוני):**
   - Current Pension Balance (`צבירה נוכחית בקרן הפנסיה`).

### Financial Engine & Math (Left Panel - Results Dashboard):
1. **The Bridge Phase (תקופת הגישור):**
   - Duration: `N = (pensionAge - bridgeStartAge) * 12` months.
   - Compound existing liquid + hishtalmut capital from `currentAge` to `bridgeStartAge` if `bridgeStartAge > currentAge`.
   - Use the exact Excel `PMT` annuity formula to calculate the maximum monthly gross drawdown during the bridge phase while leaving exactly `targetCapital` (`FV`) at `pensionAge`:
     `Monthly Rate (r) = (annualReturn / 100) / 12`
     `PMT = (PV * (1+r)^N - FV) * r / ((1+r)^N - 1)`
   - Display **Gross Monthly Income (`הכנסה חודשית ברוטו בגישור`)** and **Estimated Net Monthly Income (`נטו משוער לכיס`)** (apply an estimated 15% effective blended capital gains tax ONLY to the relative proportion drawn from taxable liquid savings; Keren Hishtalmut is 0% tax).
   - Include a small `fx` button in the Hero card that opens a Hebrew modal displaying the exact mathematical formula, variables, and explanation of the PMT calculation.
2. **The Pension Phase (תקופת הפנסיה - הערכה):**
   - Compound `pensionBalance` from `currentAge` to `pensionAge`.
   - Estimate dynamic Annuity Factor (`מקדם המרה מוערך`): Base 200 at age 67, adding 4 points for every year retired earlier, or subtracting 3 for every year later.
   - Show Estimated Gross and Net Monthly Pension (factoring in the tax penalties based on the 3 tax brackets above) and clearly label it as an estimate ("הערכה בלבד").
3. **Dynamic SVG Capital Funnel / Area Chart:**
   - Render a sleek SVG visualization showing the trajectory of capital: Starting at `currentAge`, peaking at `bridgeStartAge`, curving down during the Bridge Phase down to `targetCapital` at `pensionAge`, alongside the parallel growth of the locked Pension fund.
4. **Micro-Interactions & Gamification:**
   - When clicking "חשב סימולציה":
     - If Net Bridge Income >= 12,000 NIS and `pensionAge >= 60`: Trigger a smooth CSS/Canvas confetti celebration.
     - If Net Bridge Income < 5,000 NIS, or `targetCapital` is unachievable (negative PMT), or `pensionAge < 60`: Trigger a horizontal shake animation (`@keyframes shake`) on the results card and highlight deficits in Rose.

Use Lucide-React icons, Tailwind CSS, and keep all code self-contained in a single `App.jsx` file.
```

---

## Part 2: Product Requirements & Technical Design Document (PRD)

### 1. Product Vision & Overview
*   **Application Name:** Retirator
*   **Purpose:** An advanced, interactive financial sandbox designed for planning early retirement (FIRE) in Israel. The core focus is solving and optimizing the **"Bridge Phase"**—the critical gap between the day a person stops working and the statutory age at which they can draw a tax-exempt pension annuity under Israeli law.
*   **Target Audience:** Financially savvy Israelis, tech professionals, and early retirement planners who want granular control over their drawdown mathematics, capital preservation goals, and tax brackets.
*   **Unique Selling Propositions (USPs):**
    1.  **Zero-Knowledge Privacy:** 100% client-side execution. No servers, no databases, no tracking.
    2.  **Israeli Tax-Code Aware:** Built-in logic for Keren Hishtalmut tax exemptions, statutory gender retirement ages (67 for men, 65 for women), early pension withdrawal penalties, and dynamic annuity conversion factors (*Mekadem Hamara*).
    3.  **Tactile "Sandbox" UX:** Separation of live slider manipulation ("Draft State") from committed calculations ("Locked State"), providing live delta previews before locking in a scenario.

---

### 2. UI/UX Design System (Dark Mode Fintech Pro)
*   **Localization & Direction:** Full Hebrew UI, strictly Right-to-Left (`dir="rtl"`).
*   **Color Palette:**
    *   **Primary Background (Canvas):** `#0b0f19` (Deep Obsidian Navy)
    *   **Card Surface:** `#131826` with subtle backdrop blur and `1px` solid borders (`#262f45`).
    *   **Primary Brand Accent:** Indigo (`#6366f1` to `#4f46e5`) for interactive controls, active states, and primary charts.
    *   **Semantic Accents:**
        *   **Emerald (`#10b981`):** Tax-exempt statuses, positive deltas, net income highlights.
        *   **Amber (`#f59e0b`):** Draft mode indicators, marginal tax warnings (Ages 60–66).
        *   **Rose (`#f43f5e`):** Illegal withdrawal penalties (Under 60), capital deficits, negative deltas.
*   **Custom Input Components:**
    *   **Dual-Control Inputs:** Every numeric parameter pairs a custom RTL range slider (featuring a glowing thumb and dynamic right-to-left track fill) with a comma-formatted text input and `+/-` stepper buttons for fine-tuning.
    *   **Contextual Tooltips:** Every parameter includes an `(i)` icon that displays a floating Hebrew popover explaining the financial/tax rule behind that specific bucket.

---

### 3. State Architecture: Draft vs. Committed Pattern
To make the simulator feel engaging and deliberate, the application utilizes a dual-state pattern:

| State Layer | Trigger | Behavior & UI Impact |
| :--- | :--- | :--- |
| **`draftState`** | Instant on slider drag, text input, or profile click. | Updates the slider visuals, calculates real-time `+ / -` monthly income deltas in the background, and **immediately triggers the Live Pension Tax Alert**. |
| **`committedState`** | Updates **only** when clicking the `"חשב סימולציה"` button. | Drives the main Hero numbers, the Pension projection card, the SVG Funnel chart, and triggers the Confetti or Shake animations. |
| **`isDirty` Flag** | `true` whenever `draftState !== committedState`. | Displays an Amber "Draft Mode" badge on the dashboard, shows the delta preview badges (e.g., `+₪1,400 לחודש`), and adds a pulsing glow to the Calculate button. |

---

### 4. Financial Engine & Mathematical Specification

#### A. Input Variables
*   $G$ = Gender (`male` $\rightarrow A_{official} = 67$, `female` $\rightarrow A_{official} = 65$)
*   $A_{curr}$ = Current Age (Default: 50)
*   $A_{bridge}$ = Stop Working / Bridge Start Age (Constraint: $A_{bridge} \ge A_{curr}$)
*   $A_{pen}$ = Pension Activation Age (Constraint: $A_{pen} \ge A_{bridge}$)
*   $S_{liq}$ = Liquid Savings (Taxable brokerage, deposits, Kupat Gemel Le'Hashkaa)
*   $S_{hish}$ = Keren Hishtalmut (Tax-exempt capital gains)
*   $FV_{target}$ = Desired Remaining Capital at $A_{pen}$ (Safety net / inheritance target)
*   $R_{annual}$ = Expected Annual Real Return (e.g., $4.0\%$)
*   $P_{curr}$ = Current Pension Fund Balance

#### B. Step 1: Pre-Bridge Compounding (If $A_{bridge} > A_{curr}$)
If the user continues working for several years before starting the bridge phase, existing liquid buckets compound without withdrawals:
$$T_{wait} = A_{bridge} - A_{curr}$$
$$S_{liq\_start} = S_{liq} \times (1 + R_{annual})^{T_{wait}}$$
$$S_{hish\_start} = S_{hish} \times (1 + R_{annual})^{T_{wait}}$$
$$PV_{bridge} = S_{liq\_start} + S_{hish\_start}$$

#### C. Step 2: Bridge Phase Monthly Drawdown (The `PMT` Formula)
Calculates the exact monthly gross withdrawal over the bridge duration ($N$ months) that depletes $PV_{bridge}$ down to $FV_{target}$ at age $A_{pen}$, accounting for ongoing monthly compounding $r$:
*   $N = (A_{pen} - A_{bridge}) \times 12$
*   $r = \frac{R_{annual}}{12}$
*   **Standard Annuity Formula ($r > 0$ and $N > 0$):**
    $$PMT_{gross} = \frac{\left(PV_{bridge} \times (1 + r)^N - FV_{target}\right) \times r}{(1 + r)^N - 1}$$
*   **Zero-Interest Fallback ($r = 0$):**
    $$PMT_{gross} = \frac{PV_{bridge} - FV_{target}}{N}$$
*   *Verification Benchmark:* When $PV_{bridge} = 3,000,000$, $FV_{target} = 0$, $N = 17 \times 12 = 204$ months (Age 50 to 67), and $R_{annual} = 4\%$, the formula yields exactly **$16,861\text{ NIS/month}$**.

#### D. Step 3: Bridge Phase Tax Optimization (Gross to Net)
*   Keren Hishtalmut withdrawals are $0\%$ taxed.
*   Liquid savings are subject to a $25\%$ real capital gains tax on the *profit portion only*. In a typical mature portfolio, the profit portion represents roughly $60\%$ of the withdrawal, resulting in an **effective blended tax rate of $15\%$** on liquid drawdowns.
*   Proportional Taxable Ratio:
    $$Ratio_{taxable} = \frac{S_{liq}}{S_{liq} + S_{hish}}$$
*   Effective Tax Rate across total drawdown:
    $$Tax_{bridge} = Ratio_{taxable} \times 0.15$$
*   **Net Monthly Bridge Income:**
    $$PMT_{net} = PMT_{gross} \times (1 - Tax_{bridge})$$

#### E. Step 4: Pension Projection & Dynamic Annuity Factor
1.  **Compound Current Pension until Activation ($A_{pen}$):**
    $$P_{final} = P_{curr} \times (1 + R_{annual})^{(A_{pen} - A_{curr})}$$
2.  **Dynamic Conversion Factor (*Mekadem Hamara*):**
    Base factor at age 67 is set to $200$. Retiring earlier spreads the capital over more years, increasing the factor:
    $$Factor = \max\left(140, \; 200 + (67 - A_{pen}) \times 4\right)$$
3.  **Estimated Gross Monthly Pension:**
    $$Pension_{gross} = \frac{P_{final}}{Factor}$$

#### F. Step 5: Live Israeli Pension Tax Brackets
Evaluated dynamically against `draftState.pensionAge` ($A_{pen}$) and `draftState.gender` ($A_{official}$):

| Condition | Alert Level | Effective Tax Est. | Hebrew Alert Message Displayed Under Slider |
| :--- | :--- | :--- | :--- |
| **$A_{pen} \ge A_{official}$** | **Optimal (Emerald)** | $5\%$ (Minor bracket tax) | **פטור ממס (קיבוע זכויות):** משיכת קצבה בגיל פרישה חוקי (67 לגבר / 65 לאישה) מאפשרת פטור נרחב ממס על הקצבה המזכה. |
| **$60 \le A_{pen} < A_{official}$** | **Warning (Amber)** | $20\%$ (Marginal income tax) | **אזהרת מיסוי (גיל 60 עד גיל פרישה):** ניתן למשוך פנסיה מגיל 60, אך הקצבה תחויב במס שולי כהכנסה רגילה (פטור "קיבוע זכויות" ייכנס לתוקף רק בגיל החוקי). |
| **$A_{pen} < 60$** | **Danger (Rose + Shake)** | $35\%$ (Penalty tax) | **סכנת מס! משיכה שלא כדין (מתחת לגיל 60):** משיכת כספי פנסיה לפני גיל 60 גוררת מס שולי גבוה או קנס שבירה דרקוני של 35% לפחות! |

---

### 5. Visualizations & Gamification Specs

1.  **Dynamic SVG Capital Trajectory Funnel:**
    *   An interactive, responsive SVG area chart plotting capital on the Y-axis against age on the X-axis ($A_{curr} \rightarrow A_{bridge} \rightarrow A_{pen}$).
    *   **Curve 1 (Indigo Gradient):** Represents Total Liquid + Hishtalmut Capital. Shows upward compounding during the working years ($A_{curr}$ to $A_{bridge}$), followed by a smooth Bezier curve sloping downward during the Bridge Phase down to the exact $FV_{target}$ coordinate at $A_{pen}$.
    *   **Curve 2 (Dashed Emerald Line):** Represents the locked Pension Fund compounding steadily upward until it unlocks at $A_{pen}$.
2.  **Mathematical Transparency Modal (`fx` Button):**
    *   Located in the top-left corner of the Hero Result card.
    *   Opens a sleek dark modal displaying the algebraic `PMT` formula alongside the live plugged-in numbers from the user's current simulation (`PV`, `FV`, `r`, `N`), explaining how compound interest continues to work in their favor even during drawdown.
3.  **Commit Feedback Animations:**
    *   **Confetti Engine:** Triggered upon clicking `"חשב סימולציה"` if $PMT_{net} \ge 12,000\text{ NIS}$ and $A_{pen} \ge 60$. Renders 60 lightweight CSS/DOM particles bursting across the viewport.
    *   **Deficit / Danger Shake:** Triggered if $PMT_{net} < 5,000\text{ NIS}$, if $FV_{target}$ exceeds what $PV_{bridge}$ can generate ($PMT_{gross} \le 0$), or if $A_{pen} < 60$. Applies a $400\text{ms}$ horizontal CSS keyframe shake to the main dashboard card and switches the primary border glow to Rose (`#f43f5e`).