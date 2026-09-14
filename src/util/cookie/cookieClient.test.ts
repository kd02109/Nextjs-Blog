import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getCookieClient, makeCookieClient } from './cookieClient';

describe('client cookie facade', () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  let cookieHeader = '';
  let writes: string[] = [];

  beforeEach(() => {
    cookieHeader = '';
    writes = [];

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {},
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: Object.defineProperty({}, 'cookie', {
        configurable: true,
        get: () => cookieHeader,
        set: (serialized: string) => {
          writes.push(serialized);
          cookieHeader = serialized.split(';', 1)[0];
        },
      }),
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: originalDocument,
    });
  });

  it('round-trips the view marker through the upgraded browser API', () => {
    expect(getCookieClient('post-slug')).toBe(false);

    makeCookieClient('post-slug');

    expect(getCookieClient('post-slug')).toBe(true);
    expect(writes).toEqual(['post-slug=post-slug; Path=/']);
  });
});
