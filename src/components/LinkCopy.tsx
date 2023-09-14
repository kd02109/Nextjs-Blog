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
    <button onClick={handleCopy}>
      <CopyUrl />
      <Toaster position="top-right" />
    </button>
  );
}
