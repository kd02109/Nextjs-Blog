'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

export default function BlogComment() {
  const { resolvedTheme } = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);
  const giscusTheme =
    resolvedTheme === 'dark' ? 'noborder_dark' : 'noborder_light';

  useEffect(() => {
    // Keep the mounted custom element in sync without replacing the discussion iframe.
    hostRef.current
      ?.querySelector('giscus-widget')
      ?.setAttribute('theme', giscusTheme);
  }, [giscusTheme]);

  return (
    <div ref={hostRef} className="giscus-host">
      <Giscus
        repo="kd02109/Nextjs-Blog"
        repoId="R_kgDOKD_Xgg"
        mapping="pathname"
        category="General"
        categoryId="DIC_kwDOKD_Xgs4CY7-G"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        lang="ko"
        theme={giscusTheme}
      />
    </div>
  );
}
