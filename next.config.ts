import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Suppress hydration warnings from browser extensions
    reactStrictMode: true,
    // Production output
    output: "standalone",
};

export default nextConfig;
