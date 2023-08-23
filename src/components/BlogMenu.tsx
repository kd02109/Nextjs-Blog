'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
type Toc = { title: string; slug: string };
type Prop = {
  toc: Toc[];
};

const useScroll = (tableOfContents: Toc[]) => {
  const [currentSectionSlug, setCurrentSectionSlug] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (tableOfContents.length === 0) return;

    let headings: { id: string; top: number }[];

    function onResize() {
      headings = Array.from(
        document.querySelectorAll<HTMLElement>(
          '.prose h2:not(#table-of-contents),h3:not(#table-of-contents)',
        ),
      ).map(element => ({ id: element.id, top: element.offsetTop }));
    }

    function onScroll() {
      if (!headings) return;

      const top = window.scrollY + 150;

      let current: typeof currentSectionSlug = undefined;
      for (let i = 0; i < headings.length; i++) {
        if (top >= headings[i].top) {
          current = headings[i].id;
        }
      }
      setCurrentSectionSlug(current);
    }

    onResize();
    onScroll();
    window.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', onResize, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize, { capture: true });
    };
  }, [tableOfContents]);

  return { tableOfContents, currentSectionSlug };
};

export default function BlogMenu({ toc }: Prop) {
  const { currentSectionSlug } = useScroll(toc);
  console.log(currentSectionSlug);
  return (
    <div className="overflow-hidden rounded-xl border-2 border-neutral-200 transition-all dark:border-neutral-800">
      <div className="p-3">
        <p
          id="toc-header"
          className="text-primary text-sm font-extrabold leading-6 mb-2">
          Content Table
        </p>
        <div className="flex flex-col gap-3">
          {toc.map(({ title, slug }) => (
            <Link
              href={`#${slug}`}
              key={slug}
              className={`hover:text-yellow-400 ${
                currentSectionSlug === slug && `text-yellow-400`
              }`}>
              {title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
