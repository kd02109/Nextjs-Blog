const { withContentlayer } = require('next-contentlayer');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: { domains: ['i.imgur.com'] },
};

module.exports = withContentlayer(nextConfig);
