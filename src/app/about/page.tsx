import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '소개',
  description: '프론트엔드 개발자 손준석의 소개와 연락처입니다.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <section className="site-intro" aria-labelledby="about-title">
      <p className="site-intro-eyebrow">ABOUT / JUNSEOK SON</p>
      <h1 id="about-title">소개</h1>
      <p>
        안녕하세요, 프론트엔드 개발자 손준석입니다. 만들면서 배운 것과 문제를
        풀어가는 과정을 글과 프로젝트로 기록합니다.
      </p>
      <Link href="/contact" className="site-intro-link">
        연락하기 <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
