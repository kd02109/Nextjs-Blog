'use client';

import LoadingIcon from '@/components/svg/Loading';
import { $ } from '@/lib/core';
import { Form } from '@/types/email';
import contactEmail from '@/util/contact';
import { ChangeEvent, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const LABEL_STYLE = 'my-4 text-2xl font-bold';
const INPUT_STYLE = 'px-4 py-2 rounded-lg';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Form>({
    from: '',
    subject: '',
    message: '',
  });

  const handleForm = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await contactEmail(form)
      .then(() => {
        toast.success('메일 발송에 성공했습니다.', { icon: '❤️' });
      })
      .catch(() => {
        toast.error('메일 발송에 실패했습니다.', { icon: '😥' });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-3xl  gap-4 m-4 p-4 drop-shadow-lg dark:drop-shadow-[0_10px_8px_rgba(255,255,255,0.25)]">
        <label htmlFor="email" className={LABEL_STYLE}>
          Your Email
        </label>
        <input
          type="email"
          id="email"
          name="from"
          required
          autoFocus
          value={form.from}
          onChange={handleForm}
          className={INPUT_STYLE}
        />
        <label htmlFor="subject" className={LABEL_STYLE}>
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          value={form.subject}
          onChange={handleForm}
          className={INPUT_STYLE}
        />
        <label htmlFor="message" className={LABEL_STYLE}>
          Message
        </label>
        <textarea
          rows={10}
          id="message"
          name="message"
          required
          autoFocus
          value={form.message}
          onChange={handleForm}
          className={$(INPUT_STYLE, 'resize-none')}
        />
        <button
          className="bg-green-600 text-2xl text-wh font-bold py-2 rounded-lg hover:scale-95 transition flex justify-center items-center"
          disabled={loading ? true : false}>
          {!loading && 'Submit'}
          {loading && <LoadingIcon width="30px" height="30px" />}
        </button>
      </form>
      <Toaster position="top-right" />
    </>
  );
}
