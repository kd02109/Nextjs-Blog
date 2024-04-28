import { getCookie } from 'cookies-next';
import { cookies } from 'next/headers';

export async function getCookieServer(name: string) {
  'use server';
  return !!getCookie(name, { cookies });
}
