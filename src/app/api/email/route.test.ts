import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendMail } = vi.hoisted(() => ({
  sendMail: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail })),
  },
}));

vi.mock('server-only', () => ({}));

import { POST } from './route';

const operatorEmail = 'operator@example.com';
const visitorEmail = 'visitor@example.com';

function request(body: unknown) {
  return new Request('http://localhost/api/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/email', () => {
  beforeEach(() => {
    Object.assign(process.env, {
      NEXT_EMAIL_ID: operatorEmail,
      NEXT_EMAIL_PASSWORD: 'test-password',
    });
    sendMail.mockReset();
    sendMail.mockResolvedValue({});
  });

  it('sends untrusted contact content only as text under the operator identity', async () => {
    const maliciousMessage = '<img src="https://attacker.example/pixel">';

    const response = await POST(
      request({
        from: visitorEmail,
        subject: 'Help needed',
        message: maliciousMessage,
      }),
    );

    expect(response.status).toBe(200);
    expect(sendMail).toHaveBeenCalledWith({
      to: operatorEmail,
      from: operatorEmail,
      replyTo: visitorEmail,
      subject: '[NEXTJS BLOG] Help needed',
      text: `${maliciousMessage}\n\n보낸이: ${visitorEmail}`,
    });
  });

  it.each([
    ['a subject longer than 120 characters', { subject: 'a'.repeat(121) }],
    ['a message longer than 5,000 characters', { message: 'a'.repeat(5001) }],
    ['an invalid visitor email', { from: 'not-an-email' }],
  ])('returns 400 for %s', async (_description, override) => {
    const response = await POST(
      request({
        from: visitorEmail,
        subject: 'Question',
        message: 'Can you help?',
        ...override,
      }),
    );

    expect(response.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      }),
    );

    expect(response.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('returns a generic 500 response when SMTP delivery fails', async () => {
    sendMail.mockRejectedValue(
      new Error('smtp://internal.example credential failure'),
    );

    const response = await POST(
      request({
        from: visitorEmail,
        subject: 'Question',
        message: 'Can you help?',
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: '메일 수신에 실패했습니다.',
    });
  });
});
