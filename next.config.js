/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
    ],
    domains: ["localhost"],
    unoptimized: true, // Disable image optimization for local uploads
  },
  typescript: {
    ignoreBuildErrors: true, // This will skip type checking
  },
  eslint: {
    ignoreDuringBuilds: true, // This disables linting during build
  },
};

module.exports = nextConfig;
