import 'server-only';

import { getViewMutationEnv } from '@/config/env';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

type HeaderReader = Pick<Headers, 'get'>;

export function createViewVisitorHash(headers: HeaderReader): string {
  const environment = getViewMutationEnv();
  // Vercel supplies this platform header independently of proxy-rewritten x-forwarded-for.
  // https://vercel.com/docs/headers/request-headers
  const clientAddress = headers.get('x-vercel-forwarded-for')?.trim();

  if (!clientAddress || isIP(clientAddress) === 0) {
    throw new Error('Unable to derive view visitor.');
  }

  return createHmac('sha256', environment.VIEW_COUNT_HASH_SECRET)
    .update(clientAddress)
    .digest('hex');
}
