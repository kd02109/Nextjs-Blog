export const siteConfig = {
  url: 'https://sonblog.vercel.app/',
  title: `Son's blog`,
  description: '개발하면서 탐구한 것을 소소하게 기록하는 공간입니다.',
  copyright: 'kd02109 All rights reserved.',
  since: 2023,
  author: {
    name: 'Junseok Son',
    photo: '#',
    bio: 'Junior Frontend Engineer',
    contacts: {
      email: 'kd02109@gmail.com',
      github: 'https://github.com/kd02109',
      notion:
        'https://nostalgic-marquis-7af.notion.site/Front-End-f0f3b7fcec3045c482c1cd33dfcf2abc?pvs=4',
      instagram: 'https://www.instagram.com/junseok.son.90/',
    },
  },
  menus: [
    {
      label: 'Blog',
      path: '/blogs',
    },
    {
      label: 'Projects',
      path: '/projects',
    },
    {
      label: 'Tag',
      path: '/tags',
    },
    {
      label: 'Contact',
      path: '/contact',
    },
  ],
};

export const sharedOpenGraphMetadata = {
  type: 'website' as const,
  locale: 'ko-KR',
  siteName: siteConfig.title,
};
