/**
 * MEDICIÓN DE VISITAS — Cloudflare Web Analytics (decisión de Oscar, 27/10/2026)
 *
 * Por qué esta y no Google Analytics: es gratis, no usa cookies ni guarda
 * datos que identifiquen a la persona (no hace falta banner de cookies), y
 * mide lo que el negocio necesita para la campaña de Instagram: visitas,
 * páginas más vistas, de dónde llegan y desde qué dispositivo.
 *
 * El "token" es el código del sitio que da Cloudflare (Web Analytics → Add a
 * site → hostname www.allpetcr.com → "JS snippet", el valor de "token"). NO es
 * un secreto: viaja en la página de todos modos. Mientras esté vacío:
 *   - no se carga ningún script de medición,
 *   - la política de seguridad (CSP) no abre nada para Cloudflare,
 *   - la política de privacidad sigue diciendo que no se usa analítica.
 * Al ponerlo, las tres cosas cambian juntas en la misma publicación.
 */
export const TOKEN_ANALITICA = "";

export const analiticaActiva = TOKEN_ANALITICA.trim().length > 0;

/** Fecha en que se activó (para la vigencia de la política de privacidad). */
export const FECHA_ANALITICA = "28 de octubre de 2026";

export const ORIGEN_SCRIPT_ANALITICA = "https://static.cloudflareinsights.com";
export const ORIGEN_ENVIO_ANALITICA = "https://cloudflareinsights.com";
