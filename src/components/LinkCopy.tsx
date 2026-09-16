'use client';

import CopyUrl from '@/components/svg/CopyUrl';
import { Toaster, toast } from 'react-hot-toast';

export default function LinkCopy() {
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
    <button
      className="flex h-11 w-11 items-center justify-center"
      aria-label="현재 페이지 URL 복사"
      onClick={handleCopy}>
      <CopyUrl />
      <Toaster position="top-right" />
    </button>
  );
}
