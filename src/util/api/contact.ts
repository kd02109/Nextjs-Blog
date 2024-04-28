import { Form } from '@/types/email';

export default async function contactEmail(email: Form) {
  const response = await fetch('/api/email', {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(email),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '서버 요청에 실패하였습니다.');
  }
  return data;
}
