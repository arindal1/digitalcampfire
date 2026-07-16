import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Limit referrer information leakage
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable browser features this app doesn't use
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Force HTTPS for 2 years (only effective in production behind TLS)
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;