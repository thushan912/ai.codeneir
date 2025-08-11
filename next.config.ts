import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Remove assetPrefix for static export to avoid font loading issues
  // assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  basePath: '',
  // Remove experimental esmExternals as it's not recommended
};

export default nextConfig;
