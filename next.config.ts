import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "upgrade-insecure-requests;",
          },
        ],
      },
    ];
  },
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
