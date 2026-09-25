import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos uploaded from the admin panel live in Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
    qualities: [60, 75, 85],
  },
};

export default nextConfig;
