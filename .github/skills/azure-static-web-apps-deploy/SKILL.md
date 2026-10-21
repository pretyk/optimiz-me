---
name: azure-static-web-apps-deploy
description: How Retirator is hosted on Azure Static Web Apps and deployed by GitHub Actions. Use when adding or changing CI/CD, infrastructure, security headers, or the custom domain.
---

# Azure Static Web Apps deployment

## Current setup

| Item | Value |
| --- | --- |
| Subscription | Visual Studio Enterprise Subscription (`462f5dd1-…`), tenant `acb287ca-…` |
| Resource group | `rg-retirator` (westeurope) |
| Static Web App | `swa-retirator`, Free tier, https://nice-pebble-0150fe203.2.azurestaticapps.net |
| Deploy identity | `id-retirator-github` (user-assigned managed identity) |
| Role | Custom "Retirator Static Web App deployer" with only `staticSites/read` and `staticSites/listSecrets/action`, assigned on the site |
| GitHub environments | `production` only (branch `main` only) |
| Infrastructure | `infra/main.bicep` (subscription scope) and `infra/app.bicep` |
| Workflow | `.github/workflows/ci-cd.yml` |
| Headers | `public/staticwebapp.config.json`, checked by `tests/deploy-config.test.js` |

## Design

- **Hosting:** Azure Static Web Apps, Free tier, staging environments disabled. The app is static `dist/` output with no API, no auth, and no database.
- **Infrastructure as code:** Bicep in `infra/` for the resource group, the Static Web App, the identity, and the role. Deployments are incremental, so delete removed resources manually.
- **Pipeline (GitHub Actions):**
  1. On a pull request: `npm ci` and `npm run check` only. No deployment.
  2. On a push to `main`: `npm run check`, then deploy the tested `dist` artifact to production.
- **No PR previews (security decision):** a Static Web App has one deployment token, and it can deploy to production. If any non-`main` subject could read it, a branch workflow could publish to production or exfiltrate the token. Do not re-add previews unless they use a separate Static Web App with its own identity.
- **Authentication:** GitHub OIDC with one federated credential, `repo:pretyk@4295591/retirator@1427245824:environment:production`. The repository uses GitHub's immutable OIDC subject format (`owner@ownerId/repo@repoId`); check it with `gh api repos/pretyk/retirator/actions/oidc/customization/sub`. The credential is on a user-assigned managed identity (`azure/login`). The workflow fetches the SWA deployment token at run time with `az staticwebapp secrets list`, masks it, and never stores it as a GitHub secret. Reset the token with `az staticwebapp secrets reset-api-key` if it may have leaked.
- **Build in CI, upload only:** run `npm run build` in the test job and deploy the `dist` folder with `skip_app_build: true`, so the deployed files are exactly the ones that were tested.

## `staticwebapp.config.json`

Serve the security headers as real HTTP headers. Browsers enforce both a header CSP and the build-time meta CSP, so the header must copy the full policy from `vite.config.js` and only add header-only directives:

- `Content-Security-Policy`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`. The app needs `'unsafe-inline'` styles and `data:` images.
- `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy: same-origin`, and a `Permissions-Policy` denying camera, microphone, geolocation, and browsing-topics. Do not use the retired `interest-cohort` feature; Chrome logs it as an error.
- `/.auth/login/github`, `/.auth/login/aad`, and `/.auth/login/twitter` return 404, because the app has no sign-in. Azure does not honor a `/.auth/*` wildcard, so list each provider.
- `navigationFallback` to `/index.html`. The app uses hash routes, so no other rewrites are needed.

Do not enable Application Insights, analytics, or SWA auth providers. See the `privacy-guard` agent.

## Useful general skills

`azure-prepare` → `azure-validate` → `azure-deploy` for setup, `azure-rbac` for roles, and `azure-cost-optimization` to confirm it stays on the free tier. Run the built-in `security-review` agent on workflow changes.
