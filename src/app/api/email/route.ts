import { senaEmail } from '@/server/nodeMail';
import { NextResponse, NextRequest } from 'next/server';
import * as yup from 'yup';

const bodySchema = yup.object().shape({
  from: yup.string().email().required(),
  subject: yup.string().required(),
  message: yup.string().required(),
});

export async function POST(req: Request) {
  const text = await req.json();
  if (!bodySchema.isValidSync(text)) {
    console.log('test');
    return new Response(
      JSON.stringify({ message: '모든 입력 요청을 채우셔야 합니다.' }),
      { status: 400 },
    );
  }

  console.log(text);
  return senaEmail(text)
    .then(
      () =>
        new Response(
          JSON.stringify({ message: '메일을 성공적으로 보냈습니다.' }),
          { status: 200 },
        ),
    )
    .catch(error => {
      console.error(error);
      return new Response(
        JSON.stringify({ message: '메일 수신에 실패했습니다.' }),
        { status: 500 },
      );
    });
}
