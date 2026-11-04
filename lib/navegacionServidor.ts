import "server-only";
import { unstable_cache } from "next/cache";
import { getCategoriasPublico, getProductosPublico } from "./data";
import { construirNavegacion } from "./navegacion";
import { resumenOfertas } from "./ofertas";

async function cargarNavegacion() {
  const [categorias, productos] = await Promise.all([getCategoriasPublico(), getProductosPublico()]);
  return construirNavegacion(categorias, productos);
}

/**
 * El encabezado aparece en todas las rutas y solo necesita saber qué grupos
 * tienen inventario. Un minuto evita descargar todo el catálogo del ERP en
 * cada visita sin reutilizar esos precios en catálogo, carrito o checkout.
 */
export const getNavegacion = unstable_cache(
  cargarNavegacion,
  ["navegacion-catalogo-v2"],
  { revalidate: 60 },
);

/** La franja de arriba anuncia la promoción vigente (04/11/2026). Misma copia
 *  de un minuto que el menú: una oferta empieza o termina en el sitio a lo
 *  sumo un minuto después que en la caja. */
export const getResumenOfertas = unstable_cache(
  async () => resumenOfertas(await getProductosPublico()),
  ["resumen-ofertas-v1"],
  { revalidate: 60 },
);
