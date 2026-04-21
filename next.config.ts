import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage でアップロードされた画像用
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    // Server Actions は 14.x デフォルト ON
  },
};

export default nextConfig;
