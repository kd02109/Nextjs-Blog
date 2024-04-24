const { withContentlayer } = require('next-contentlayer');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: { domains: ['i.imgur.com', 'source.unsplash.com'] },
  experimental: {
    serverActions: true,
  },
};

module.exports = withContentlayer(nextConfig);
