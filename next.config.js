/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Allow imports from backend folders during migration
  transpilePackages: [],
}

module.exports = nextConfig