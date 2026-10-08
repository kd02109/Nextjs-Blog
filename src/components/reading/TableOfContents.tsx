'use client';

import useScroll from '@/components/hook/useScroll';
import type { Toc } from '@/util/findH';

type Props = { toc: Toc[] };

export default function TableOfContents({ toc }: Props) {
  const { currentSectionSlug } = useScroll(toc);

  return (
    <aside className="reading-toc">
      <nav aria-label="글 목차">
        <strong>ON THIS PAGE</strong>
        {toc.length > 0 ? (
          <ol>
            {toc.map(({ title, slug, id }) => (
              <li
                key={slug}
                className={id === 'sub' ? 'reading-toc-sub' : undefined}>
                <a
                  href={`#${slug}`}
                  aria-current={
                    currentSectionSlug === slug ? 'location' : undefined
                  }>
                  {title}
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <p>이 글에는 별도 목차가 없습니다.</p>
        )}
        <a href="#comments">댓글로 이어가기 ↓</a>
      </nav>
    </aside>
  );
}
