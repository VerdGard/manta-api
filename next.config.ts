import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img-dm.l-il.cn',
      },
      {
        protocol: 'https',
        hostname: 'cdn.l-il.cn',
      },
      {
        protocol: 'https',
        hostname: 'ae-pic-a1.aliexpress-media.com',
      },
    ],
  },
};

export default nextConfig;
