import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['your-storage.com', 'cdn.example.com'], //  Add your Appwrite CDN domain
  },
  // other config options...
};

export default nextConfig;
