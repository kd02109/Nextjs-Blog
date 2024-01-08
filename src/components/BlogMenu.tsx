'use client';

import CircleButton from '@/components/CustomButton';
import DarkSwitch from '@/components/DarkSwitch';
import useScroll from '@/components/hook/useScroll';
import Comment from '@/components/svg/Comment';
import CopyUrl from '@/components/svg/CopyUrl';
import Top from '@/components/svg/Top';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export type Toc = { title: string; slug: string; id: 'sub' | 'title' };
type Prop = {
  toc: Toc[];
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
        <div className="flex flex-col gap-3 max-h-80 overflow-hidden w-full hover:overflow-y-scroll">
          {toc.map(({ title, slug, id }) => (
            <Link
              href={`#${slug}`}
              key={slug}
              onClick={e => {
                e.preventDefault();

                const element = document.getElementById(slug);

                const offset = 100;
                const elementPosition = element
                  ? element.getBoundingClientRect().top + window.scrollY
                  : 0;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }}
              className={`hover:text-yellow-400 ${
                currentSectionSlug === slug && `text-yellow-400`
              }`}>
              {id === 'title' ? (
                <span>{title}</span>
              ) : (
                <span className="text-sm">&nbsp;&nbsp; - {title}</span>
              )}
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
