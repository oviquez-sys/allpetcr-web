/**
 * ⚠ ARCHIVO OBSOLETO — no usar. Reemplazado por `lib/navegacion.ts`.
 *
 * Aquí vivían las cuatro categorías destacadas del inicio, con enlaces a
 * /catalogo?c=Perros, ?c=Gatos, ?c=Higiene y ?c=Accesorios. Ninguna de esas
 * cuatro categorías existe en data/categorias.json: el filtro no encontraba
 * nada y mostraba el catálogo completo sin avisar. Las tarjetas de la portada
 * parecían filtrar y no filtraban.
 *
 * La sustitución (lib/navegacion.ts) hace tres cosas que esto no hacía:
 *   · filtra por id de categoría, no por nombre — no se rompe si alguien
 *     corrige una tilde en el ERP;
 *   · deriva los enlaces de las categorías que existen de verdad, así que un
 *     enlace roto es imposible de escribir sin que falle una prueba;
 *   · comparte la misma fuente con el encabezado y el pie, en vez de repetir
 *     la lista en tres archivos que se desincronizan.
 *
 * Este archivo se deja vacío en vez de borrarse para que quede el rastro de
 * por qué desapareció. Se puede eliminar sin consecuencias: no lo importa
 * nadie (verificado). El tipo se conserva por si algún import quedó suelto.
 */

export interface CategoriaDestacada {
  nombre: string;
  detalle: string;
  href: string;
  tinte: string;
  imagen?: string;
  posicion?: string;
}

/** @deprecated Usar `destacadas` de `lib/navegacion.ts`. */
export const categoriasDestacadas: CategoriaDestacada[] = [];
