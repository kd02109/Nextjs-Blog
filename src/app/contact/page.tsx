import ContactForm from '@/components/ContactForm';

export default async function ContactPage() {
  return (
    <section className="flex flex-col items-center">
      <h2 className="text-3xl font-bold my-4">Send Me An Email</h2>
      <ContactForm />
    </section>
  );
}
