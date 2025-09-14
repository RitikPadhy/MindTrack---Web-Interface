// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://mindtracker.dedyn.io/:path*", // your backend domain
      },
    ];
  },
};

export default nextConfig;