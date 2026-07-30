import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad.
 *
 * La CSP permite 'unsafe-inline' en estilos porque Tailwind y Next inyectan
 * estilos en línea; en scripts NO se permite salvo lo que Next necesita para
 * hidratar, y por eso frame-ancestors va en 'none'. El iframe del mapa se
 * habilita de forma explícita en frame-src: es la única excepción y conviene
 * que se vea, en vez de abrir la política entera.
 *
 * 'unsafe-eval' va SOLO en desarrollo: el recargado en caliente de Turbopack
 * lo necesita. En producción no hace falta —el código no usa eval ni
 * new Function, y las únicas dependencias en runtime son React, Next y las
 * fuentes— y dejarlo abriría una vía de XSS sin ninguna ventaja.
 */
const esDesarrollo = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    // Cuando el ERP exponga imágenes de producto vía API/CDN, agregar aquí el
    // dominio remoto. Los formatos modernos reducen mucho el peso de las
    // fotos de catálogo, que es el punto donde más se degrada el móvil.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
