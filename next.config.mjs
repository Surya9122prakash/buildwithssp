/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during builds so that compilation finishes cleanly
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
