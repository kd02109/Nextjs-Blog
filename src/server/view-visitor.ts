import 'server-only';

import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

const MIN_HASH_SECRET_LENGTH = 32;

type HeaderReader = Pick<Headers, 'get'>;

export function createViewVisitorHash(headers: HeaderReader): string {
  const secret = process.env.VIEW_COUNT_HASH_SECRET;
  // Vercel supplies this platform header independently of proxy-rewritten x-forwarded-for.
  // https://vercel.com/docs/headers/request-headers
  const clientAddress = headers.get('x-vercel-forwarded-for')?.trim();

  if (
    process.env.VERCEL !== '1' ||
    !secret ||
    secret.length < MIN_HASH_SECRET_LENGTH ||
    !clientAddress ||
    isIP(clientAddress) === 0
  ) {
    throw new Error('Unable to derive view visitor.');
  }

  return createHmac('sha256', secret).update(clientAddress).digest('hex');
}
