'use client';

import { useState, useEffect } from 'react';
import type { Toc } from '@/util/findH';

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
          '.reading-body h2[id], .reading-body h3[id]',
        ),
      ).map(element => ({
        id: element.id,
        top: element.getBoundingClientRect().top + window.scrollY,
      }));
    }

    function onScroll() {
      if (!headings) return;

      const top = window.scrollY + 250;

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

export default useScroll;
