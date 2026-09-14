import 'server-only';

import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

const MIN_HASH_SECRET_LENGTH = 32;
const MAX_USER_AGENT_LENGTH = 512;

type HeaderReader = Pick<Headers, 'get'>;

export function createViewVisitorHash(headers: HeaderReader): string {
  const secret = process.env.VIEW_COUNT_HASH_SECRET;
  const clientAddress = headers.get('x-forwarded-for')?.split(',', 1)[0].trim();
  const userAgent = headers.get('user-agent')?.trim();

  if (
    !secret ||
    secret.length < MIN_HASH_SECRET_LENGTH ||
    !clientAddress ||
    isIP(clientAddress) === 0 ||
    !userAgent ||
    userAgent.length > MAX_USER_AGENT_LENGTH
  ) {
    throw new Error('Unable to derive view visitor.');
  }

  return createHmac('sha256', secret)
    .update(clientAddress)
    .update('\n')
    .update(userAgent)
    .digest('hex');
}
