/** Activar indexación únicamente al lanzar el dominio oficial. */
export const sitioIndexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";
export const sitioUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://allpetcr-web-6h6iv.ondigitalocean.app").replace(/\/$/, "");
