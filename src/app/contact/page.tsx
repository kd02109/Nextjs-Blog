import ContactForm from '@/components/ContactForm';
import type { Metadata } from 'next';
import { sharedOpenGraphMetadata } from '@/config';

export const metadata: Metadata = {
  title: 'Contact',
  alternates: { canonical: '/contact' },
  openGraph: {
    ...sharedOpenGraphMetadata,
    url: '/contact',
    title: 'Contact',
  },
};

export default async function ContactPage() {
  return (
    <section className="flex flex-col items-center">
      <h2 className="text-3xl font-bold my-4">Send Me An Email</h2>
      <ContactForm />
    </section>
  );
}
