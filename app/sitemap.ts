import type { MetadataRoute } from "next";
import { getProductos } from "@/lib/data";
import { negocio } from "@/lib/negocio";

/**
 * Sitemap generado desde el catálogo.
 *
 * Se genera, no se escribe a mano: con 184 productos y creciendo, una lista
 * manual queda desactualizada en la primera semana. Las fichas de producto son
 * páginas estáticas que ningún menú enumera de forma exhaustiva, así que sin
 * sitemap Google tendría que descubrirlas a tientas.
 *
 * /carrito y /checkout quedan fuera a propósito: son páginas de sesión, no
 * contenido indexable.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = negocio.sitioUrl;
  const productos = await getProductos();

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contacto`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/sobre-nosotros`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/envios`, changeFrequency: "monthly", priority: 0.5 },
    ...productos.map((p) => ({
      url: `${base}/producto/${encodeURIComponent(p.sku)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
