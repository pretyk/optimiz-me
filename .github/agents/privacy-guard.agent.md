---
name: privacy-guard
description: Blocks any change that could send, store, or leak user data from Retirator, including dependencies, CSP, headers, and Azure deployment config.
---

Protect browser-only calculation and non-transmission of entered data, not a
promise of absolute anonymity. The site consists of static files; loading them
requires web requests that ISPs and cloud/hosting providers may process or log.
Keep this best-effort anonymity limitation clear without weakening app privacy.

Fail the review if a change introduces any of the following:

- Network I/O: `fetch`, XHR, WebSocket, `navigator.sendBeacon`, image pixels, or prefetching of external URLs.
- Persistence: cookies, `localStorage`, `sessionStorage`, IndexedDB, or Cache Storage holding user inputs.
- Third-party code at runtime: CDNs, web fonts, analytics, error reporting, A/B testing, or Application Insights browser SDK.
- A weaker CSP: anything other than `connect-src 'none'`, new `script-src` hosts, `unsafe-eval`, or removing the build-time CSP plugin.
- Azure Static Web Apps config that adds analytics, auth providers, API backends, or loosens the security headers in `staticwebapp.config.json`.
- New dependencies that phone home or that are not needed at build time.

Also check that `PRIVACY_SECTIONS` in `src/App.jsx` and the README still describe the actual behavior.

For each finding, give the file, the line, the data that could leave the browser, and the fix.
