import ActionLink from '@/components/ui/ActionLink';

import FeaturedNote from './FeaturedNote';
import type { HomePost } from './HomePostList';

export default function FieldNoteHero({ featured }: { featured: HomePost }) {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <p className="home-eyebrow">FRONTEND ENGINEERING · FIELD NOTES</p>
        <h1 id="home-title">
          만들면서 배우고,
          <br />
          배운 것은
          <br />
          <span>기록합니다.</span>
        </h1>
        <p className="home-hero-description">
          안녕하세요, 프론트엔드 개발자 손준석입니다. 화면을 만들다 만난 문제와
          그 문제를 풀어가는 과정을 글과 프로젝트로 남깁니다.
        </p>
        <div className="home-hero-actions">
          <ActionLink href="#writing" variant="primary">
            기록 읽어보기
          </ActionLink>
          <ActionLink href="#projects">프로젝트 살펴보기</ActionLink>
        </div>
        <p className="home-hero-signoff">
          <span>REACT · NEXT.JS · TYPESCRIPT</span>
          <span aria-hidden="true">/</span>
          <span>SON&apos;S BLOG</span>
        </p>
      </div>
      <FeaturedNote post={featured} />
    </section>
  );
}
