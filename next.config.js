/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
