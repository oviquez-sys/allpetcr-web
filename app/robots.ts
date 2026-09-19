import type { MetadataRoute } from "next";
import { negocio } from "@/lib/negocio";
import { sitioIndexable } from "@/lib/sitio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Páginas de sesión: no aportan nada al índice y no deben aparecer
      // en resultados de búsqueda.
      disallow: sitioIndexable ? ["/carrito", "/checkout", "/recompra", "/api/"] : ["/api/"],
    },
    sitemap: `${negocio.sitioUrl}/sitemap.xml`,
  };
}
