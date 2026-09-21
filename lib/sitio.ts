/**
 * Dominio oficial e indexación (21/09/2026: lanzamiento en www.allpetcr.com).
 *
 * Por defecto el sitio se presenta como www.allpetcr.com y deja que Google lo
 * indexe. Las variables de entorno solo sirven para apagar eso en una copia de
 * prueba: NEXT_PUBLIC_SITE_INDEXABLE=false y NEXT_PUBLIC_SITE_URL=<otra URL>.
 * Son de compilación (NEXT_PUBLIC_), así que un cambio exige volver a publicar.
 */
export const sitioIndexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE !== "false";
export const sitioUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.allpetcr.com").replace(/\/$/, "");
