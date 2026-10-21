---
name: code-review-checklist
description: Shared review checklist for Retirator pull requests. Use when reviewing a diff, responding to review feedback, or preparing a PR for merge.
---

# Retirator code review checklist

## Before requesting a review

- [ ] `npm run check` passes locally (Vitest, build, Playwright desktop and mobile).
- [ ] The PR description explains the user-visible change and how it was verified.
- [ ] Screenshots are attached for UI changes (desktop and mobile).

## Correctness

- [ ] Financial changes have unit tests, including the edge cases: zero rate, zero bridge months, unreachable target (negative PMT), and ages 59/60, 64/65, 66/67.
- [ ] Draft vs. committed state still works: results change only after "חשב סימולציה", and deltas show while dirty.
- [ ] Validation errors block calculation and are announced to screen readers.

## Project rules (see AGENTS.md)

- [ ] No network calls, storage, analytics, or third-party runtime code.
- [ ] Production CSP is unchanged, or the change is justified and approved by `privacy-guard`.
- [ ] All new UI text is Hebrew, RTL-correct, and follows `hebrew-copy-style`.
- [ ] Disclaimer wording is consistent across the entry dialog, `#disclaimer`, and the README.

## CI/CD and deployment

- [ ] Workflow `permissions` are minimal; `id-token: write` only on deploy jobs.
- [ ] No secrets are printed or passed to untrusted steps; `pull_request_target` is not used.
- [ ] Deploys run only after the test job succeeds.

## Handling review feedback

1. Fix every blocking comment, or reply with a clear reason when you decline one.
2. Reply to each thread with what changed and resolve it.
3. Re-run `npm run check` and push.
4. Merge only when CI is green and no blocking comments remain. Use squash merge and delete the branch.
