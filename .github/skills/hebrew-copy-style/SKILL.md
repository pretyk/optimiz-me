---
name: hebrew-copy-style
description: Hebrew terminology, tone, and RTL formatting rules for Retirator user-facing text. Use when writing or reviewing any UI copy, tooltips, alerts, or legal pages.
---

# Hebrew copy style

## Voice

- Clear, calm, and practical. Speak directly to the user in second person, with neutral gender where possible ("אפשר", "כדאי", "הזינו").
- Never promise results. Use "הערכה", "משוער", and "סימולציה". Avoid "מובטח", "בטוח", and "המלצה".
- Short sentences. One idea per tooltip.

## Terminology

| Use | Avoid |
| --- | --- |
| תקופת הגישור | תקופת מעבר |
| קרן השתלמות | קה"ש |
| חיסכון נזיל / תיק השקעות | כסף פנוי |
| גיל משיכת פנסיה | גיל פנסיה (when it means the withdrawal age) |
| גיל פרישה חוקי | גיל פרישה רשמי |
| קיבוע זכויות | פטור קיבוע |
| מקדם המרה | מקדם קצבה |
| תשואה ריאלית | תשואה נטו |
| ברוטו / נטו משוער | ברוטו / נטו (without "משוער" for estimates) |

## Formatting

- Currency: `₪` with `he-IL` thousand separators, for example ₪1,500,000.
- Percentages: `4.0%`.
- Wrap numbers, English terms, and formulas inside Hebrew sentences with `dir="ltr"` or `<bdi>` so they do not flip.
- Use the Hebrew maqaf or a spaced hyphen consistently in titles.
- Keep English only for technical terms with no common Hebrew equivalent (FIRE, PMT).
