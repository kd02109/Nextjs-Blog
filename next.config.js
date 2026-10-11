const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://giscus.app https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://source.unsplash.com https://images.unsplash.com https://i.imgur.com https://github.com https://*.githubusercontent.com https://www.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://giscus.app https://*.google-analytics.com https://*.analytics.google.com https://*.supabase.co wss://*.supabase.co",
  'frame-src https://giscus.app',
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'report-to csp-endpoint',
  'report-uri /api/csp-report',
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/blogs', destination: '/blog', permanent: true },
      {
        source: '/blogs/blog/:category/:slug',
        destination: '/blog/:category/:slug',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            // Enforcement remains gated on the documented observation period.
            key: 'Content-Security-Policy-Report-Only',
            value: contentSecurityPolicy,
          },
          {
            key: 'Reporting-Endpoints',
            value: 'csp-endpoint="/api/csp-report"',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/collection/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/towbLSY.png',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/UjNDTNc.png',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/y7xcTyo.png',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/A7BAUbv.png',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/asM0GGh.png',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/1bX5QH6.jpg',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/kd02109/react-article-study/assets/57277708/**',
      },
    ],
  },
};

module.exports = nextConfig;
