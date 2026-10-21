# Agent instructions for Optimiz.me

Optimiz.me is a Hebrew, RTL, 100% client-side Israeli FIRE and bridge-phase simulator. These rules apply to every human and AI contributor.

## Non-negotiable rules

1. **Privacy first.** Never add analytics, telemetry, cookies, `localStorage`/`sessionStorage`/IndexedDB, external fonts, CDNs, third-party scripts, or any network request (`fetch`, XHR, WebSocket, beacons). The production CSP uses `connect-src 'none'` and must stay that way.
2. **Single-file app.** Application logic, components, and styles stay in `src/App.jsx`.
3. **Hebrew and RTL.** All user-facing text is Hebrew and must render correctly with `dir="rtl"`. Numbers use the `he-IL` locale format and the ₪ sign.
4. **Simulation, not advice.** Never present results as financial, tax, pension, or legal advice. Keep the entry disclaimer, the `#disclaimer` page, and the README disclaimer consistent with each other.
5. **Financial math is tested.** Any change to `calculate`, `pmt`, `trajectory`, `taxStatus`, or `feedbackFor` must update `tests/finance.test.jsx`. Model assumptions are listed in `.github/skills/israeli-retirement-rules/SKILL.md`.
6. **Accessibility.** Keyboard access, focus management in dialogs, and the axe checks in `tests/e2e` must keep passing.

## Workflow

- Run `npm run check` (unit tests, build, Playwright e2e on desktop and mobile) before opening or updating a PR.
- Use a branch and a PR for every change. Production deployment to Azure Static Web Apps is planned to run only through CI from `main`; once it exists, never deploy manually.
- Commit messages are imperative and describe the user-visible change.

## Project agents and skills

| Type | Name | When to use |
| --- | --- | --- |
| Agent | `code-reviewer` | Every PR: correctness, regressions, tests, and the rules above |
| Agent | `finance-reviewer` | Changes to formulas, tax rules, ages, or result wording |
| Agent | `rtl-ux-reviewer` | UI, copy, layout, mobile, or accessibility changes |
| Agent | `privacy-guard` | Dependencies, CSP, headers, deployment config, or any I/O |
| Skill | `code-review-checklist` | The shared review checklist used by every reviewer agent |
| Skill | `israeli-retirement-rules` | The source of truth for the tax and pension assumptions |
| Skill | `hebrew-copy-style` | Terminology and voice for Hebrew copy |
| Skill | `azure-static-web-apps-deploy` | Azure Static Web Apps hosting and CI/CD |

Useful general skills: `web-design-guidelines` (UI audits), `azure-prepare`, `azure-validate`, `azure-deploy`, `azure-rbac` (least-privilege OIDC), and `azure-cost-optimization`. Use the built-in `security-review` agent for workflow and header changes.
