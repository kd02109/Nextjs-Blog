import { cookies } from 'next/headers';

export async function getCookieServer(name: string) {
  'use server';
  const cookieStore = await cookies();
  return cookieStore.has(name);
}
