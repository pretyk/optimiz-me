---
name: azure-static-web-apps-deploy
description: How Optimiz.me is hosted on Azure Static Web Apps and deployed by GitHub Actions. Use when adding or changing CI/CD, infrastructure, security headers, or the custom domain.
---

# Azure Static Web Apps deployment

## Target design

- **Hosting:** Azure Static Web Apps, Free tier. The app is static `dist/` output with no API, no auth, and no database.
- **Infrastructure as code:** Bicep in `infra/` for the resource group and the Static Web App.
- **Pipeline (GitHub Actions):**
  1. On a pull request: `npm ci`, `npm run check`, then deploy to a PR preview environment. Close the preview when the PR closes.
  2. On a push to `main`: `npm run check`, then deploy to production.
  3. Deploy jobs need `needs: test`, and run only for branches in this repository, not forks.
- **Authentication:** prefer GitHub OIDC with a federated credential (`azure/login`) and least-privilege roles (use the `azure-rbac` skill). If the SWA deployment token is used instead, store it only as the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret and never print it.
- **Build in CI, upload only:** run `npm run build` in the test job and deploy the `dist` folder with `skip_app_build: true`, so the deployed files are exactly the ones that were tested.

## `staticwebapp.config.json`

Serve the security headers as real HTTP headers. Browsers enforce both a header CSP and the build-time meta CSP, so the header must copy the full policy from `vite.config.js` and only add header-only directives:

- `Content-Security-Policy`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`. The app needs `'unsafe-inline'` styles and `data:` images.
- `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `Permissions-Policy` denying camera, microphone, geolocation, and interest-cohort.
- `navigationFallback` to `/index.html`. The app uses hash routes, so no other rewrites are needed.

Do not enable Application Insights, analytics, or SWA auth providers. See the `privacy-guard` agent.

## Useful general skills

`azure-prepare` → `azure-validate` → `azure-deploy` for setup, `azure-rbac` for roles, and `azure-cost-optimization` to confirm it stays on the free tier. Run the built-in `security-review` agent on workflow changes.
