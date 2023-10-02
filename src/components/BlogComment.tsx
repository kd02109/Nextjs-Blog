'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

export default function BlogComment() {
  const { theme } = useTheme();
  return (
    <>
      <div id={'giscus'}></div>
      <Giscus
        repo={'kd02109/Nextjs-Blog'}
        repoId={'R_kgDOKD_Xgg'}
        mapping={'pathname'}
        category="General"
        categoryId="DIC_kwDOKD_Xgs4CY7-G"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        lang={'ko'}
        theme={theme === 'light' ? 'noborder_light' : 'noborder_dark'}
      />
    </>
  );
}
