/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: { domains: ['i.imgur.com', 'source.unsplash.com', 'imgur.com'] },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
