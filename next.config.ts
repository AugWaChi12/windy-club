import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "pbxt.replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "cujhbssftphcdqubalru.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Performance: compress responses
  compress: true,
  // Performance: enable React strict mode for catching issues
  reactStrictMode: true,
  // Performance: reduce bundle size
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },
};

export default nextConfig;
