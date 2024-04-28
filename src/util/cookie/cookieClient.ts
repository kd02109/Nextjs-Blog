'use client';

import { getCookie, setCookie, CookieValueTypes } from 'cookies-next';

export function getCookieClient(name: string) {
  const cookies = getCookie(name);

  return !!cookies;
}

export function makeCookieClient(name: string) {
  setCookie(name, name);
}
