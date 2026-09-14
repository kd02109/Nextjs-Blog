import 'server-only';

import { Form } from '@/types/email';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NEXT_EMAIL_ID,
    pass: process.env.NEXT_EMAIL_PASSWORD,
  },
});

export async function sendContactMail(form: Form) {
  await transporter.sendMail({
    to: process.env.NEXT_EMAIL_ID,
    from: process.env.NEXT_EMAIL_ID,
    replyTo: form.from,
    subject: `[NEXTJS BLOG] ${form.subject}`,
    text: `${form.message}\n\n보낸이: ${form.from}`,
  });
}
