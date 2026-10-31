import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A self-contained server in .next/standalone, so the Docker image ships without node_modules.
  output: "standalone",
  devIndicators: false,
  experimental: {
    // The /api rewrite gives up after 30 s by default. Without REDIS_URL the backend transcodes an episode upload
    // inside the request, which takes minutes: the browser got a 500 while the delivery went on and succeeded.
    proxyTimeout: 60 * 60_000,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
