import type { Categoria, Producto } from "./types";
import { idsRama } from "./navegacion";

/**
 * FILTROS DEL CATÁLOGO: MARCA Y SUBCATEGORÍA (28/10/2026)
 *
 * Después de la mejora de fichas en el ERP, 377 de 693 productos traen marca
 * (36 marcas) y las categorías tienen subcategorías. El catálogo solo filtraba
 * por categoría raíz y especie. Acá viven las reglas, separadas del
 * componente para poder probarlas.
 */

/** Clave de marca: sin mayúsculas, tildes ni signos. "Zee.Dog" = "ZeeDog" = "zee dog". */
export function claveMarca(marca: string | undefined | null): string {
  return (marca ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export interface OpcionMarca {
  clave: string;
  nombre: string;
  cuantos: number;
}

/**
 * Marcas para el filtro, de la más a la menos frecuente.
 *  - Se juntan las escrituras que solo difieren en mayúsculas o signos
 *    ("Buen Amigo" y "buen amigo"); se muestra la escritura más usada.
 *  - Solo marcas con 2 o más productos: una marca con un producto no ayuda a
 *    filtrar y alarga la lista. Las elegidas se conservan aunque bajen a 1
 *    (no se puede "perder" un filtro activo de la pantalla).
 *  - NO se adivinan typos ("Gosby" ≠ "Gosbi"): eso se corrige en el ERP.
 */
export function opcionesMarca(productos: Producto[], elegidas: string[] = [], minimo = 2): OpcionMarca[] {
  const porClave = new Map<string, { cuantos: number; escrituras: Map<string, number> }>();
  for (const p of productos) {
    const nombre = (p.marca ?? "").trim();
    const clave = claveMarca(nombre);
    if (!clave) continue;
    const g = porClave.get(clave) ?? { cuantos: 0, escrituras: new Map() };
    g.cuantos++;
    g.escrituras.set(nombre, (g.escrituras.get(nombre) ?? 0) + 1);
    porClave.set(clave, g);
  }
  const lista: OpcionMarca[] = [];
  for (const [clave, g] of porClave) {
    if (g.cuantos < minimo && !elegidas.includes(clave)) continue;
    // La escritura más usada; si empatan, la que trae mayúsculas ("Buen Amigo" antes que "buen amigo").
    const conMayus = (t: string) => Number(t !== t.toLowerCase());
    const nombre = [...g.escrituras.entries()].sort(
      (a, b) => b[1] - a[1] || conMayus(b[0]) - conMayus(a[0]) || a[0].localeCompare(b[0]),
    )[0][0];
    lista.push({ clave, nombre, cuantos: g.cuantos });
  }
  for (const clave of elegidas) {
    if (!lista.some((m) => m.clave === clave)) lista.push({ clave, nombre: clave, cuantos: 0 });
  }
  return lista.sort((a, b) => b.cuantos - a.cuantos || a.nombre.localeCompare(b.nombre, "es"));
}

export interface OpcionSub {
  id: number;
  nombre: string;
  cuantos: number;
}

/**
 * Subcategorías de una raíz, solo si sirven para filtrar.
 *
 * Regla del 90 %: se ofrecen si al menos el 90 % de los productos de esa raíz
 * están asignados a una subcategoría. Si muchos quedaron en la raíz (hoy
 * Paseo: 79 de 124), el filtro «Collares» escondería collares que el ERP
 * dejó sin subcategoría, y el cliente creería que no hay. Cuando el ERP
 * termine de asignarlos, el filtro aparece solo, sin tocar el sitio.
 */
export const UMBRAL_SUBCATEGORIAS = 0.9;

export function opcionesSubcategoria(
  categorias: Categoria[],
  productos: Producto[],
  raizId: number,
): OpcionSub[] {
  const hijas = categorias
    .filter((c) => c.padre_id === raizId)
    .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"));
  if (hijas.length < 2) return [];
  const rama = new Set(idsRama(categorias, raizId));
  const enRama = productos.filter((p) => p.categoria_id !== null && rama.has(p.categoria_id));
  if (enRama.length === 0) return [];
  const enRaiz = enRama.filter((p) => p.categoria_id === raizId).length;
  if ((enRama.length - enRaiz) / enRama.length < UMBRAL_SUBCATEGORIAS) return [];
  const opciones = hijas
    .map((h) => {
      const ids = new Set(idsRama(categorias, h.id));
      return {
        id: h.id,
        nombre: h.nombre,
        cuantos: enRama.filter((p) => ids.has(p.categoria_id as number)).length,
      };
    })
    .filter((o) => o.cuantos > 0);
  // Una sola subcategoría con productos no es una elección.
  return opciones.length >= 2 ? opciones : [];
}
