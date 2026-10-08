'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';

import type { Form } from '@/types/email';
import contactEmail from '@/util/api/contact';

type FieldErrors = Partial<Record<keyof Form, string>>;
type Feedback = { type: 'success' | 'error'; message: string };

const emptyForm: Form = { from: '', subject: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const field = event.target.name as keyof Form;
    setForm(previous => ({ ...previous, [field]: event.target.value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const payload: Form = {
      from: form.from.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };
    const nextErrors: FieldErrors = {};
    if (!payload.from) nextErrors.from = '답장받을 이메일을 입력해 주세요.';
    if (!payload.subject) nextErrors.subject = '제목을 입력해 주세요.';
    if (!payload.message) nextErrors.message = '메시지를 입력해 주세요.';
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await contactEmail(payload);
      setForm(emptyForm);
      setFeedback({
        type: 'success',
        message: response.message || '메일을 성공적으로 보냈습니다.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : '메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="contact-form"
      aria-label="문의 폼"
      aria-busy={loading}
      onSubmit={handleSubmit}>
      <div className="contact-row">
        <div className="contact-field">
          <label htmlFor="contact-email">이메일</label>
          <input
            id="contact-email"
            name="from"
            type="email"
            autoComplete="email"
            placeholder="답장을 받을 이메일"
            required
            maxLength={254}
            value={form.from}
            onChange={handleChange}
            aria-invalid={Boolean(errors.from)}
            aria-describedby={errors.from ? 'contact-email-error' : undefined}
          />
          {errors.from && (
            <p id="contact-email-error" className="contact-field-error">
              {errors.from}
            </p>
          )}
        </div>
        <div className="contact-field">
          <label htmlFor="contact-subject">제목</label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder="이야기의 주제를 적어주세요"
            required
            maxLength={120}
            value={form.subject}
            onChange={handleChange}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={
              errors.subject ? 'contact-subject-error' : undefined
            }
          />
          {errors.subject && (
            <p id="contact-subject-error" className="contact-field-error">
              {errors.subject}
            </p>
          )}
        </div>
      </div>
      <div className="contact-field">
        <label htmlFor="contact-message">메시지</label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="함께 나누고 싶은 내용을 적어주세요"
          required
          maxLength={5000}
          value={form.message}
          onChange={handleChange}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? 'contact-message-error' : undefined
          }
        />
        {errors.message && (
          <p id="contact-message-error" className="contact-field-error">
            {errors.message}
          </p>
        )}
      </div>
      <div className="contact-actions">
        <p>보내기를 누르면 입력한 내용이 이메일로 전송됩니다.</p>
        <button className="contact-submit" type="submit" disabled={loading}>
          {loading ? '보내는 중' : '메시지 보내기'}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      {feedback && (
        <p
          className="contact-feedback"
          data-state={feedback.type}
          role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.message}
        </p>
      )}
    </form>
  );
}
