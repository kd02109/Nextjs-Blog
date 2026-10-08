import type { Metadata } from 'next';
import Link from 'next/link';

import ContactForm from '@/components/ContactForm';
import PageBreadcrumb from '@/components/ui/PageBreadcrumb';
import SectionHeading from '@/components/ui/SectionHeading';
import { sharedOpenGraphMetadata, siteConfig } from '@/config';
import '@/styles/about-contact.css';

export const metadata: Metadata = {
  title: '연락',
  description: '손준석에게 작업 제안이나 기술에 관한 이야기를 보내주세요.',
  alternates: { canonical: '/contact' },
  openGraph: {
    ...sharedOpenGraphMetadata,
    url: '/contact',
    title: '연락',
    description: '손준석에게 작업 제안이나 기술에 관한 이야기를 보내주세요.',
  },
};

export default function ContactPage() {
  return (
    <div className="contact-page">
      <PageBreadcrumb
        className="contact-breadcrumb"
        items={[
          { label: 'SON.', href: '/' },
          { label: 'ABOUT', href: '/about' },
          { label: 'CONTACT' },
        ]}
      />
      <header className="contact-hero">
        <div>
          <p className="contact-kicker">CONTACT / SAY HELLO</p>
          <h1 className="contact-title">
            새로운 이야기를
            <br />
            <em>시작해 볼까요?</em>
          </h1>
          <p className="contact-lead">
            작업 제안, 기술에 관한 질문, 함께 나누고 싶은 이야기를 보내주세요.
            아래에서 내용을 정리하거나 이메일로 바로 연락할 수 있습니다.
          </p>
        </div>
        <aside>
          <strong>좋은 대화의 시작</strong>
          <p>
            어떤 일을 함께 하고 싶은지, 지금 고민 중인 문제가 무엇인지
            알려주시면 대화의 방향을 잡는 데 도움이 됩니다.
          </p>
        </aside>
      </header>
      <div className="contact-layout">
        <section aria-labelledby="contact-form-heading">
          <SectionHeading
            id="contact-form-heading"
            eyebrow="MESSAGE / 01"
            title="메시지 작성"
            description="답장받을 이메일과 이야기의 주제를 알려주세요."
          />
          <ContactForm />
        </section>
        <aside className="contact-card" aria-label="다른 연락 방법">
          <div>
            <span>ALSO HERE</span>
            <strong>다른 곳에서 연결하기</strong>
            <small>편한 방법으로 연락하거나 작업 기록을 살펴보세요.</small>
          </div>
          <a href={`mailto:${siteConfig.author.contacts.email}`}>
            <span>EMAIL ↗</span>
            <strong>메일로 바로 연락</strong>
            <small>{siteConfig.author.contacts.email}</small>
          </a>
          <a
            href={siteConfig.author.contacts.github}
            target="_blank"
            rel="noopener noreferrer">
            <span>GITHUB ↗</span>
            <strong>GitHub에서 보기</strong>
            <small>github.com/kd02109</small>
          </a>
          <Link href="/projects">
            <span>SELECTED WORK ↗</span>
            <strong>프로젝트 둘러보기</strong>
            <small>만든 서비스와 작업 기록 5개</small>
          </Link>
        </aside>
      </div>
    </div>
  );
}
