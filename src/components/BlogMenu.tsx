'use client';

import CircleButton from '@/components/CustomButton';
import DarkSwitch from '@/components/DarkSwitch';
import Comment from '@/components/svg/Comment';
import CopyUrl from '@/components/svg/CopyUrl';
import Top from '@/components/svg/Top';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

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

export default function BlogMenu({ toc }: Prop) {
  const { currentSectionSlug } = useScroll(toc);
  const handleCopy = async () => {
    const url = window.document.location.href;
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      toast('url 복사에 성공하였습니다.', { icon: '⌨️' });
    } catch {
      toast.error('url 복사에 실패하였습니다.');
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border-2 border-neutral-200 transition-all dark:border-neutral-800">
      <div className="p-3 border-b-2 border-solid">
        <div
          id="toc-header"
          className="text-base py-1 font-extrabold leading-6 mb-4 border-b-2 border-solid">
          Content Table
        </div>
        <div className="flex flex-col gap-3  ">
          {toc.map(({ title, slug }) => (
            <Link
              href={`#${slug}`}
              key={slug}
              className={`hover:text-yellow-400 ${
                currentSectionSlug === slug && `text-yellow-400`
              }`}>
              • {title}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex gap-4 p-2 justify-around">
        <CircleButton
          className={
            'p-2 w-[30px] h-[30px] rounded-lg bg-slate-200 dark:bg-slate-600 left-1 top-1 flex items-center justify-center cursor-pointer max-sm:w-7 max-sm:h-7'
          }
          fn={() => {
            window.scrollTo({ top: 0 });
          }}>
          <Top />
        </CircleButton>
        <DarkSwitch
          className={
            'p-2 w-[30px] h-[30px] rounded-lg bg-slate-200 dark:bg-slate-600 left-1 top-1 flex items-center justify-center cursor-pointer max-sm:w-7 max-sm:h-7'
          }
        />
        <CircleButton
          className={
            'p-2 w-[30px] h-[30px] rounded-lg bg-slate-200 dark:bg-slate-600 left-1 top-1 flex items-center justify-center cursor-pointer max-sm:w-7 max-sm:h-7'
          }
          fn={() => {
            window.document.querySelector('#giscus')?.scrollIntoView();
          }}>
          <Comment />
        </CircleButton>
        <CircleButton
          className={
            'p-2 w-[30px] h-[30px] rounded-lg bg-slate-200 dark:bg-slate-600 left-1 top-1 flex items-center justify-center cursor-pointer max-sm:w-7 max-sm:h-7'
          }
          fn={handleCopy}>
          <CopyUrl />
          <Toaster position="top-right" />
        </CircleButton>
      </div>
    </div>
  );
}
