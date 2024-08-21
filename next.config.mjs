// next.config.mjs
/** @type {import('next').NextConfig} */

const CONFIG = {
  authUrls: [
    '^/login/?$',
    '^/register/?$',
    '^/password/reset/?$',
    '^/?$',
  ],
  dynamicPublicUrls: [
    '^/dashboard/quiz/[^/]+/view$',
    '^/dashboard/quiz/response/[^/]+',
    '^/pub/[^/]+',
  ],
};

const nextConfig = {
  env: {
    CONFIG: JSON.stringify(CONFIG),
  },
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'pbs.twimg.com',
    ],
  },
};

export default nextConfig;
