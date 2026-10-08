'use client';

import React, { useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function CodeBlock({
  children,
  className,
  ...props
}: React.ComponentProps<'pre'>) {
  const ref = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const text = ref.current?.querySelector('code')?.innerText;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success('코드를 복사했습니다.', { icon: '🖥️' });
    } catch {
      toast.error('코드 복사에 실패했습니다.');
    }
  };

  return (
    <div className="reading-code">
      <div className="reading-code-bar">
        <span>CODE / EXAMPLE</span>
        <button type="button" aria-label="코드 복사" onClick={handleCopy}>
          복사 ↗
        </button>
      </div>
      <pre
        {...props}
        ref={ref}
        className={[className, 'reading-code-content']
          .filter(Boolean)
          .join(' ')}>
        {children}
      </pre>
      <Toaster position="top-right" />
    </div>
  );
}
