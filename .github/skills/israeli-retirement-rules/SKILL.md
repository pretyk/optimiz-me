---
name: israeli-retirement-rules
description: Source of truth for the Israeli tax, pension, and annuity assumptions used by the Retirator simulator. Use when changing or reviewing financial logic, tests, or result wording.
---

# Israeli retirement rules used by the model

These are **simplified model assumptions**, not a statement of current law. Every change must update `src/App.jsx`, `tests/finance.test.jsx`, and the README together.

| Topic | Model value | Code |
| --- | --- | --- |
| Statutory retirement age | Men 67, women 65 | `taxStatus` |
| Warning scenario under 60, not an available pension | 35% illustrative haircut, not a legal tax calculation | `taxStatus` |
| Pension scenario from 60 to the statutory age | 20% illustrative haircut, not an actual tax rate or eligibility determination | `taxStatus` |
| Pension scenario at or after the statutory age | 5% illustrative haircut, not an automatic or complete exemption | `taxStatus` |
| Bridge tax on liquid savings | 15% blended effective rate × the liquid share | `calculate` |
| Keren Hishtalmut | 0% tax | `calculate` |
| Annuity factor | 200 at 67, +4 per year earlier, −3 per year later | `calculate` |
| Bridge drawdown | Excel PMT, end-of-month, `r = annualReturn / 100 / 12` (`annualReturn` is a percent, e.g. 4) | `pmt` |
| Pre-bridge growth | Annual compounding at the real return | `calculate` |

## Known simplifications

- Capital gains tax in Israel is 25% on real gains. The 15% blended rate is a rough estimate because only part of each withdrawal is gain.
- Marginal tax, credit points, Bituach Leumi and health tax, and the קיבוע זכויות exemption cap are not modeled precisely.
- קיבוע זכויות concerns determining a personal exemption; the model does not determine eligibility or promise full exemption. The 35%, 20%, and 5% haircuts are unchanged scenario assumptions, not statutory rates or a minimum penalty.
- Annuity factors vary by fund, gender, survivor options, and guaranteed periods.
- Returns are real (after inflation) and constant.
- Women's statutory retirement age is gradually rising toward 65; the model uses 65.

## Updating the rules

1. Verify against an official source: the Israel Tax Authority (gov.il/taxes), the Capital Market, Insurance and Savings Authority, or Bituach Leumi (btl.gov.il).
2. Record the source and date in the PR description.
3. Update this table, the code, the tests, and the README "financial model" section in the same PR.
4. Ask the `finance-reviewer` agent to review the change.
