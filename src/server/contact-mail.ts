import 'server-only';

import { getMailEnv } from '@/config/env';
import { Form } from '@/types/email';
import nodemailer from 'nodemailer';

export async function sendContactMail(form: Form) {
  const environment = getMailEnv();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: environment.NEXT_EMAIL_ID,
      pass: environment.NEXT_EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    to: environment.NEXT_EMAIL_ID,
    from: environment.NEXT_EMAIL_ID,
    replyTo: form.from,
    subject: `[NEXTJS BLOG] ${form.subject}`,
    text: `${form.message}\n\n보낸이: ${form.from}`,
  });
}
