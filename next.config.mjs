/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_SOLVER_API_URL: process.env.NEXT_PUBLIC_SOLVER_API_URL || 'http://localhost:8000',
  },
  experimental: {
    serverComponentsExternalPackages: ['react-big-calendar'],
  },
};

export default nextConfig;
