import '@/styles/globals.css';
import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import PageShell from '@/components/layout/PageShell';
import NextThemeProvider from '@/components/ThemeProvider';
import GoogleAnalytics from '@/components/layout/GoogleAnalytics';
import { sharedOpenGraphMetadata, siteConfig } from '@/config';

export const revalidate = 360;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: '웹 개발 관련 학습한 내용, 회고, 프로젝트 등을 정리합니다.',
  keywords: ['react', 'typescript', 'javascript', 'codingTest', 'next.js'],
  authors: [{ name: siteConfig.author.name }],
  verification: {
    google: 'vX5KRBC3xVzJD7VebebY5_AuQq9VHZHdA4jom0Q2y9c',
    other: {
      'naver-site-verification': 'ef16034ef27e71574bf1c4ae39576acc4e17b002',
    },
  },
  alternates: { canonical: '/' },
  openGraph: {
    ...sharedOpenGraphMetadata,
    url: '/',
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/apple-icon-57x57.png"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </head>
      <body>
        <GoogleAnalytics />

        <NextThemeProvider>
          <a className="site-skip-link" href="#main">
            본문으로 건너뛰기
          </a>
          <Header />
          <main id="main">
            <PageShell className="site-main-inner">{children}</PageShell>
          </main>
          <Footer />
        </NextThemeProvider>
      </body>
    </html>
  );
}
