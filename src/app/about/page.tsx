import type { Metadata } from 'next';

import ActionLink from '@/components/ui/ActionLink';
import PageBreadcrumb from '@/components/ui/PageBreadcrumb';
import SectionHeading from '@/components/ui/SectionHeading';
import { sharedOpenGraphMetadata } from '@/config';
import '@/styles/about-contact.css';

export const metadata: Metadata = {
  title: '소개',
  description: '프론트엔드 개발자 손준석의 작업 방식과 연락처입니다.',
  alternates: { canonical: '/about' },
  openGraph: {
    ...sharedOpenGraphMetadata,
    url: '/about',
    title: '소개',
    description: '프론트엔드 개발자 손준석의 작업 방식과 연락처입니다.',
  },
};

const methods = [
  {
    number: '01 / QUESTION',
    title: '문제에서 시작',
    description:
      '프로젝트를 만들면서 실제로 막힌 지점을 질문으로 남깁니다. 왜 이 선택이 필요했는지부터 살펴봅니다.',
  },
  {
    number: '02 / BUILD',
    title: '직접 구현',
    description:
      '작은 예제에서 멈추지 않고 동작하는 서비스에 적용합니다. 완성한 작업은 프로젝트별로 모읍니다.',
  },
  {
    number: '03 / NOTE',
    title: '다시 쓸 수 있게 기록',
    description:
      '코드와 선택한 이유를 함께 정리합니다. 글은 기술별로, 프로젝트 기록은 작업별로 이어집니다.',
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <PageBreadcrumb
        className="about-breadcrumb"
        items={[{ label: 'SON.', href: '/' }, { label: 'ABOUT' }]}
      />
      <header className="about-hero">
        <div>
          <p className="about-kicker">ABOUT / THE PERSON BEHIND THE NOTES</p>
          <h1 className="about-title">
            만드는 과정까지
            <br />
            <em>남기는 사람.</em>
          </h1>
          <p className="about-lead">
            안녕하세요. 프론트엔드 개발자 손준석입니다. React, Next.js,
            TypeScript로 화면을 만들고, 작업 중 만난 문제와 해결 과정을 다음
            작업에 도움이 될 기록으로 남깁니다.
          </p>
          <p className="about-signature">
            <strong>JUNSEOK SON</strong> / FRONTEND ENGINEER
          </p>
          <div className="about-actions">
            <ActionLink href="/blogs" variant="primary">
              글 읽어보기
            </ActionLink>
            <ActionLink href="/projects">프로젝트 보기</ActionLink>
          </div>
        </div>
        <div
          className="about-portrait"
          role="img"
          aria-label="SON 이니셜을 활용한 손준석의 프로필 그래픽">
          <span className="about-portrait-initials">JS.</span>
          <div className="about-portrait-stamp">
            <span>FIELD NOTES</span>
            <span>EST. 2023</span>
          </div>
        </div>
      </header>
      <section aria-labelledby="about-method-heading">
        <SectionHeading
          id="about-method-heading"
          eyebrow="WORKING METHOD / 01"
          title="어떻게 작업하나요?"
          description="이 블로그의 콘텐츠를 구성하는 세 가지 흐름입니다."
        />
        <div className="about-methods">
          {methods.map(method => (
            <article key={method.number}>
              <span>{method.number}</span>
              <h3>{method.title}</h3>
              <p>{method.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="about-contact"
        id="contact"
        aria-labelledby="about-contact-heading">
        <div>
          <span>CONTACT / LET&apos;S TALK</span>
          <h2 id="about-contact-heading">같이 만들어 볼 이야기가 있나요?</h2>
          <p>
            작업 제안이나 기술 이야기 모두 환영합니다. 이메일과 GitHub에서
            연결할 수 있습니다.
          </p>
        </div>
        <ActionLink href="/contact">연락 화면으로</ActionLink>
      </section>
    </div>
  );
}
