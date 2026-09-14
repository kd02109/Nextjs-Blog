import { sendContactMail } from '@/server/contact-mail';
import { NextResponse } from 'next/server';
import * as yup from 'yup';

const bodySchema = yup.object({
  from: yup.string().trim().email().max(254).required(),
  subject: yup.string().trim().min(1).max(120).required(),
  message: yup.string().trim().min(1).max(5000).required(),
});

export async function POST(req: Request) {
  let form;

  try {
    form = await bodySchema.validate(await req.json());
  } catch {
    return NextResponse.json(
      { message: '모든 입력 요청을 채우셔야 합니다.' },
      { status: 400 },
    );
  }

  try {
    await sendContactMail(form);
    return NextResponse.json({ message: '메일을 성공적으로 보냈습니다.' });
  } catch {
    return NextResponse.json(
      { message: '메일 수신에 실패했습니다.' },
      { status: 500 },
    );
  }
}
