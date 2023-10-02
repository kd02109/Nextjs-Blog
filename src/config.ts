import { DefaultSeoProps } from 'next-seo';

export const headerConfig = {};

export const siteConfig = {
  url: 'https://nextjs-blog-kd02109.vercel.app/',
  title: `Son's blog`,
  description: '개발하면서 탐구한 것을 소소하게 기록하는 공간입니다.',
  copyright: 'kd02109 All rights reserved.',
  since: 2023,
  author: {
    name: 'Junseok Son',
    photo: '#',
    bio: 'Junior Frontend Engineer',
    contacts: {
      email: 'kd02109@naver.com',
      github: 'kd02109',
      velog: '@kd02109',
      linkedin: '',
      youtube: '',
      instagram: '',
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

export const seoConfig: DefaultSeoProps = {
  title: siteConfig.title,
  description: siteConfig.description,
  canonical: siteConfig.url,
  openGraph: {
    type: 'website',
    locale: 'ko-KR',
    url: siteConfig.url,
    siteName: siteConfig.title,
  },
  additionalMetaTags: [
    {
      name: 'author',
      content: siteConfig.author.name,
    },
  ],
};
