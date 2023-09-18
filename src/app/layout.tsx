import '@/styles/globals.css';
import type { Metadata } from 'next';
import { nanum } from '@/font/font';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NextThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: "Son's blog",
  description: '웹 개발 관련 학습한 내용, 회고, 프로젝트 등을 정리합니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="vX5KRBC3xVzJD7VebebY5_AuQq9VHZHdA4jom0Q2y9c"
        />
        <meta
          name="naver-site-verification"
          content="ef16034ef27e71574bf1c4ae39576acc4e17b002"
        />
        <meta name="title" content="Son Blog" />
        <meta
          name="description"
          content="개발하면서 느낀점, 배운점을 기록합니다."
        />
        <meta
          name="keywords"
          content="react, typescript, javascript, codingTest, next.js"
        />
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
      <body
        className={`mx-auto max-w-3xl px-6 lg:max-w-6xl lg:px-8 ${nanum.className}`}>
        <NextThemeProvider>
          <Header />
          <main className="px-2">{children}</main>
          <Footer />
        </NextThemeProvider>
      </body>
    </html>
  );
}
