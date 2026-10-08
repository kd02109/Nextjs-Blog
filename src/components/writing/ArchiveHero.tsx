import Link from 'next/link';

type ArchiveHeroProps = {
  kind: 'writing' | 'topics';
  count: number;
};

export default function ArchiveHero({ kind, count }: ArchiveHeroProps) {
  const writing = kind === 'writing';

  return (
    <>
      <nav className="archive-breadcrumb" aria-label="현재 위치">
        <Link href="/">SON.</Link>
        <span aria-hidden="true">/</span>
        {writing ? (
          <span>WRITING</span>
        ) : (
          <>
            <Link href="/blogs">WRITING</Link>
            <span aria-hidden="true">/</span>
            <span>TOPICS</span>
          </>
        )}
      </nav>
      <header className="archive-hero">
        <div>
          <p className="archive-kicker">
            {writing ? 'WRITING / NOTES FROM THE WORK' : 'EXPLORE / BY SUBJECT'}
          </p>
          <h1 className="archive-title">
            {writing ? '문제를 따라' : '관심사를 따라'}
            <br />
            <em>{writing ? '남긴 기록.' : '찾아보세요.'}</em>
          </h1>
          <p className="archive-lead">
            {writing
              ? '프론트엔드를 만들며 마주친 질문을 기술과 경험으로 풀어 썼습니다. 주제를 고르거나 궁금한 키워드를 검색해 보세요.'
              : '기술 이름이 곧 탐색의 시작점입니다. 블로그 글과 프로젝트 기록을 같은 주제 아래 모았습니다.'}
          </p>
        </div>
        <aside
          className="archive-folio"
          aria-label={writing ? '블로그 글 수' : '핵심 주제 수'}>
          <span className="archive-folio-number">
            {writing ? String(count).padStart(2, '0') : '04'}
          </span>
          <div>
            <strong>{writing ? 'WRITTEN NOTES' : 'CORE SUBJECTS'}</strong>
            <p>React · Next.js · JavaScript · TypeScript</p>
          </div>
        </aside>
      </header>
    </>
  );
}
