/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "codesense.mlrit.ac.in",
      },
    ],
    domains: ["localhost", "codesense.mlrit.ac.in"],
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
