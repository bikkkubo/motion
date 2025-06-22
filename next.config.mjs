/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_SOLVER_API_URL: process.env.NEXT_PUBLIC_SOLVER_API_URL || 'http://localhost:8000',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    GOOGLE_PUSH_ENDPOINT: process.env.GOOGLE_PUSH_ENDPOINT,
  },
  experimental: {
    serverComponentsExternalPackages: ['react-big-calendar'],
  },
};

export default nextConfig;
