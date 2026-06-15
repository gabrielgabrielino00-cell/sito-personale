import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "web.archive.org",
      },
      {
        protocol: "https",
        hostname: "elettronica51.net",
      },
    ],
  },
};

export default nextConfig;