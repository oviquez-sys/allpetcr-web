import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder: cuando el ERP exponga imágenes de producto vía API/CDN,
    // agregar aquí el dominio remoto correspondiente (remotePatterns).
    remotePatterns: [],
  },
};

export default nextConfig;
