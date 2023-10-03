'use strict';

import { Form } from '@/types/email';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NEXT_EMAIL_ID,
    pass: process.env.NEXT_EMAIL_PASSWORD,
  },
});

export async function senaEmail(data: Form) {
  // send mail with defined transport object
  console.log(data);
  const mailData = {
    to: process.env.NEXT_EMAIL_ID,
    from: process.env.NEXT_EMAIL_ID,
    subject: `[NEXTJS BLOG] ${data.subject}`,
    message: data.message,
    html: `
        <h1>${data.subject}</h1>
        <div>${data.message}</div>
        <br/ >
        <p>보낸이 : ${data.from}</p>
    `,
  };
  return await transporter.sendMail(mailData);
}
