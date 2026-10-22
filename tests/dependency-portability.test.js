import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8');
const lock = JSON.parse(source);

describe('committed dependency portability', () => {
  it('contains no Microsoft-specific package-feed URLs', () => {
    const hasMicrosoftFeed = /https?:\/\/[^"\s]*(?:pkgs\.visualstudio\.com|pkgs\.dev\.azure\.com|packagefeedproxy\.microsoft\.io)/i.test(source);
    expect(hasMicrosoftFeed, 'Remove Microsoft-specific package feeds from package-lock.json').toBe(false);
  });

  it('locks every dependency to an unauthenticated public npm tarball with SHA-512 integrity', () => {
    for (const [path, pkg] of Object.entries(lock.packages)) {
      if (path === '') continue;
      const url = new URL(pkg.resolved);
      expect(url.origin, path).toBe('https://registry.npmjs.org');
      expect(url.username, path).toBe('');
      expect(url.password, path).toBe('');
      expect(url.search, path).toBe('');
      expect(pkg.integrity, path).toMatch(/^sha512-[A-Za-z0-9+/]{86}==$/);
    }
  });
});
