# Copilot instructions for Retirator

Follow [`AGENTS.md`](../AGENTS.md). Retirator is a Hebrew RTL, 100% client-side React simulator for Israeli early retirement. All logic lives in `src/App.jsx`.

## When reviewing pull requests

Report only meaningful problems: bugs, regressions, privacy or security risks, missing tests, and violations of `AGENTS.md`. Skip style nits.

Treat these as blocking:

- Any network call, storage (cookies, `localStorage`, `sessionStorage`, IndexedDB), analytics, telemetry, or third-party runtime script or font.
- A weaker Content-Security-Policy than the one in `vite.config.js`, which includes `connect-src 'none'`.
- Changes to `calculate`, `pmt`, `trajectory`, `taxStatus`, or `feedbackFor` without matching tests in `tests/finance.test.jsx`.
- Financial assumptions that differ from `.github/skills/israeli-retirement-rules/SKILL.md` without updating it, the tests, and the README together.
- User-facing text that is not Hebrew, breaks RTL, or presents results as advice or guarantees instead of estimates.
- Dialog focus or keyboard regressions, or changes that would fail the axe checks in `tests/e2e`.
- GitHub Actions changes that broaden `permissions`, expose secrets, or use `pull_request_target`.

Use `.github/skills/code-review-checklist/SKILL.md` as the full checklist.
