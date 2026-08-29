import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

// Next.js carga .env DESPUÉS de evaluar next.config.ts (es un orden de
// arranque documentado, no un descuido de acá) — sin esta línea,
// process.env.ERP_API_URL todavía no existe cuando corre
// patronesDeImagenDelErp() de abajo, y remotePatterns queda vacío en
// silencio (las imágenes del ERP se ven "no permitidas" con 400, no con un
// error claro). @next/env es el paquete que el propio Next.js usa para
// leer .env; llamarlo acá adelanta esa carga.
loadEnvConfig(process.cwd());

// Fotos de producto del ERP (Bloque 5, 2026-08-29): cuando ERP_API_URL está
// definida, api/serializers.py devuelve URLs absolutas a ESE host (ver el
// porqué en api/serializers.py::get_imagen). next/image exige que cada
// dominio remoto esté declarado a propósito — es justo la protección contra
// que cualquiera use tu optimizador de imágenes como proxy gratis de lo
// que sea. Sin ERP_API_URL, remotePatterns queda vacío: el sitio sigue
// sirviendo desde su propio public/ como siempre.
function patronesDeImagenDelErp() {
  if (!process.env.ERP_API_URL) return [];
  const erp = new URL(process.env.ERP_API_URL);
  return [
    {
      protocol: erp.protocol.replace(":", "") as "http" | "https",
      hostname: erp.hostname,
      port: erp.port || "",
      pathname: "/media/**",
    },
  ];
}

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

// El origen del ERP entra en img-src (las fotos de producto vienen de ahí,
// ver patronesDeImagenDelErp arriba) solo cuando ERP_API_URL está definida.
// Sin ella, la CSP no se afloja para nada que no exista.
const origenErp = process.env.ERP_API_URL ? new URL(process.env.ERP_API_URL).origin : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com${origenErp ? ` ${origenErp}` : ""}`,
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
    // Los formatos modernos reducen mucho el peso de las fotos de catálogo,
    // que es el punto donde más se degrada el móvil.
    remotePatterns: patronesDeImagenDelErp(),
    formats: ["image/avif", "image/webp"],
    // El ERP en desarrollo vive en localhost: next/image bloquea por
    // defecto traer imágenes de una IP privada/loopback (protección contra
    // SSRF vía el optimizador — alguien podría usarlo para sondear la red
    // interna del servidor). Es la protección correcta para producción,
    // donde el ERP debería tener un dominio real; en desarrollo, contra el
    // propio localhost del programador, no hay nada que proteger. Por eso
    // esto SOLO se activa fuera de producción — jamás con NODE_ENV=production.
    dangerouslyAllowLocalIP: esDesarrollo,
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
