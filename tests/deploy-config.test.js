import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { CONTENT_SECURITY_POLICY } from '../vite.config.js';

const config = JSON.parse(readFileSync(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8'));
const headers = config.globalHeaders;

describe('Azure Static Web Apps config', () => {
  test('serves the build-time CSP plus frame-ancestors as an HTTP header', () => {
    expect(headers['Content-Security-Policy']).toBe(`${CONTENT_SECURITY_POLICY}; frame-ancestors 'none'`);
    expect(CONTENT_SECURITY_POLICY).toContain("connect-src 'none'");
  });

  test('sends privacy and hardening headers', () => {
    expect(headers['Referrer-Policy']).toBe('no-referrer');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Permissions-Policy']).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
  });

  test('disables built-in auth routes and adds no backend', () => {
    for (const provider of ['github', 'aad', 'twitter']) {
      expect(config.routes).toContainEqual({ route: `/.auth/login/${provider}`, statusCode: 404 });
    }
    expect(config).not.toHaveProperty('auth');
    expect(config).not.toHaveProperty('platform');
    expect(config.navigationFallback.rewrite).toBe('/index.html');
  });
});
