import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

// Next.js carga .env DESPUÉS de evaluar next.config.ts (es un orden de
// arranque documentado, no un descuido de acá) — sin esta línea,
// process.env.ERP_API_URL todavía no existe cuando corre
// patronesDeImagenExternas() de abajo, y remotePatterns queda vacío en
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
//
// 10/09/2026: el ERP puede guardar las fotos en disco propio (URL bajo el
// mismo host del ERP, "/media/**") O en un bucket S3-compatible — Spaces,
// en este despliegue — cuando el ERP tiene MEDIA_STORAGE_BACKEND=s3. En ese
// caso api/serializers.py::get_imagen ya devuelve la URL del bucket
// directamente, NO la del ERP, así que hace falta declarar TAMBIÉN ese
// dominio o next/image la rechaza con "hostname no configurado". De ahí
// PRODUCTOS_CDN_URL, aparte de ERP_API_URL: son dos orígenes distintos que
// pueden estar activos a la vez.
function patronesDeImagenExternas() {
  const patrones: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
  if (process.env.ERP_API_URL) {
    const erp = new URL(process.env.ERP_API_URL);
    patrones.push({
      protocol: erp.protocol.replace(":", "") as "http" | "https",
      hostname: erp.hostname,
      port: erp.port || "",
      pathname: "/media/**",
    });
  }
  if (process.env.PRODUCTOS_CDN_URL) {
    const cdn = new URL(process.env.PRODUCTOS_CDN_URL);
    patrones.push({
      protocol: cdn.protocol.replace(":", "") as "http" | "https",
      hostname: cdn.hostname,
      port: cdn.port || "",
      pathname: "/**",
    });
  }
  return patrones;
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

// El origen del ERP y, si aplica, el del bucket de fotos entran en img-src
// (ver patronesDeImagenExternas arriba) solo cuando la variable respectiva
// está definida. Sin ellas, la CSP no se afloja para nada que no exista.
const origenErp = process.env.ERP_API_URL ? new URL(process.env.ERP_API_URL).origin : "";
const origenCdnFotos = process.env.PRODUCTOS_CDN_URL
  ? new URL(process.env.PRODUCTOS_CDN_URL).origin
  : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // *.tile.openstreetmap.org: los cuadros del mapa de MapaDireccion.tsx
  // (ítem 33) — Leaflet los carga como <img> normales, no via next/image,
  // así que entran por CSP y no por remotePatterns.
  `img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.tile.openstreetmap.org${origenErp ? ` ${origenErp}` : ""}${origenCdnFotos ? ` ${origenCdnFotos}` : ""}`,
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
    remotePatterns: patronesDeImagenExternas(),
    formats: ["image/avif", "image/webp"],
    // Sin esto, Next cachea cada variante optimizada (tamaño × formato) solo
    // 60 segundos (su valor por defecto) — pensado para imágenes que cambian
    // seguido, no para fotos de producto que son casi siempre las mismas
    // semanas seguidas. Con 60s, cada visitante nuevo fuera de esa ventana
    // vuelve a pagar el costo de generar la variante desde cero. 30 días deja
    // que una vez que ALGUIEN pidió, por ejemplo, "el arnés en 640px WebP",
    // el resto de los visitantes con ese mismo ancho de pantalla reciban la
    // copia ya generada — la primera visita de cada tamaño es la única lenta.
    // Si algún día se reemplaza una foto usando la MISMA url, puede tardar
    // hasta 30 días en verse el cambio; hoy las fotos no se reemplazan así.
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
