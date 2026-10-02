/** @type {import('next').NextConfig} */
const isGithubPages = process.env.DEPLOY_TARGET === 'gh-pages';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  // Use static export for GitHub Pages, standard for Vercel/Node
  output: isGithubPages ? 'export' : undefined,
  basePath: isGithubPages && basePath ? basePath : undefined,
  assetPrefix: isGithubPages && basePath ? basePath : undefined,
  trailingSlash: isGithubPages,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  ...(isGithubPages
    ? {}
    : {
        async rewrites() {
          const backendTarget = process.env.BACKEND_PROXY_URL || 'https://researchmate-backend-2zu6.onrender.com';
          return [
            {
              source: '/api/v1/:path*',
              destination: `${backendTarget}/api/v1/:path*`,
            },
          ];
        },
      }),
};

module.exports = nextConfig;

