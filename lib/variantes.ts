import type { Producto } from "./types";
import { normalizar } from "./busqueda";

/**
 * TALLAS DE UN MISMO PRODUCTO (28/10/2026, pedido de Oscar)
 *
 * En el ERP cada talla es un producto aparte, con su propio código, precio y
 * existencias ("Arnés Flyharness Slam talla 2", "… talla 3", "… talla 4").
 * Eso está bien para la caja y el inventario, pero en el catálogo el mismo
 * producto aparecía tres o cuatro veces seguidas con la misma foto.
 * Medido en producción: 34 productos en varias tallas = 87 tarjetas.
 *
 * El sitio los agrupa SOLO para mostrarlos:
 *  - en el catálogo, una tarjeta por producto con «Tallas S · M · L» y
 *    «Elegir talla»;
 *  - en la ficha, botones para pasar de una talla a otra.
 * Cada talla conserva su código y su página: el carrito, el checkout, el
 * ERP y Google no cambian.
 *
 * Regla de agrupado: mismo nombre sin la talla final + misma categoría.
 * Solo se reconoce la talla al FINAL del nombre ("… talla M",
 * "… talla 30 cm"); un nombre que dice la talla en otro lado no se agrupa
 * (mejor una tarjeta de más que juntar dos productos distintos).
 */

const TALLA_FINAL = /\s+talla\s+(XXXL|XXL|XL|XXS|XS|S|M|L|\d+(?:[.,]\d+)?(?:\s?cm)?)\s*$/i;

const ORDEN_LETRAS = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export function separarTalla(nombre: string): { base: string; talla: string } | null {
  const m = nombre.match(TALLA_FINAL);
  if (!m) return null;
  const base = nombre.slice(0, m.index).trim();
  if (!base) return null;
  return { base, talla: m[1].replace(/\s?cm$/i, " cm").toUpperCase().replace(" CM", " cm") };
}

/** Para ordenar tallas: letras en su orden natural, números de menor a mayor. */
export function pesoTalla(talla: string): number {
  const i = ORDEN_LETRAS.indexOf(talla.toUpperCase());
  if (i >= 0) return i;
  const n = parseFloat(talla.replace(",", "."));
  return Number.isFinite(n) ? 100 + n : 1000;
}

export function claveGrupo(p: Pick<Producto, "nombre" | "categoria_id">): string | null {
  const s = separarTalla(p.nombre);
  return s ? `${normalizar(s.base)}|${p.categoria_id ?? ""}` : null;
}

/** Clave para "no repetir lo mismo dos veces" (vitrina, recomendados). */
export function claveVisual(p: Pick<Producto, "nombre" | "categoria_id">): string {
  return claveGrupo(p) ?? `nombre|${p.nombre}`;
}

export interface ItemCatalogo {
  /** El producto que representa la tarjeta (y al que lleva el enlace). */
  principal: Producto;
  /** Todas las tallas, ordenadas. Un solo elemento = producto normal. */
  tallas: Producto[];
}

function elegirPrincipal(tallas: Producto[]): Producto {
  // Lo que se puede comprar hoy, con foto, y la talla más chica.
  return (
    tallas.find((p) => p.disponible && p.imagen) ??
    tallas.find((p) => p.disponible) ??
    tallas.find((p) => p.imagen) ??
    tallas[0]
  );
}

function ordenarTallas(tallas: Producto[]): Producto[] {
  return [...tallas].sort(
    (a, b) => pesoTalla(separarTalla(a.nombre)?.talla ?? "") - pesoTalla(separarTalla(b.nombre)?.talla ?? ""),
  );
}

/**
 * Agrupa una lista YA filtrada y ordenada. Cada grupo aparece donde estaba
 * su primera talla en esa lista (si se ordenó por precio, donde va la más
 * barata). Si un filtro deja una sola talla, se muestra como producto normal.
 */
export function agruparTallas(lista: Producto[]): ItemCatalogo[] {
  const porClave = new Map<string, Producto[]>();
  for (const p of lista) {
    const k = claveGrupo(p);
    if (!k) continue;
    const g = porClave.get(k) ?? [];
    g.push(p);
    porClave.set(k, g);
  }
  const vistos = new Set<string>();
  const items: ItemCatalogo[] = [];
  for (const p of lista) {
    const k = claveGrupo(p);
    const grupo = k ? porClave.get(k) : undefined;
    if (!k || !grupo || grupo.length < 2) {
      items.push({ principal: p, tallas: [p] });
      continue;
    }
    if (vistos.has(k)) continue;
    vistos.add(k);
    const tallas = ordenarTallas(grupo);
    items.push({ principal: elegirPrincipal(tallas), tallas });
  }
  return items;
}

/** Las tallas hermanas de un producto (incluido él), ordenadas; [] si no tiene. */
export function tallasDe(producto: Producto, catalogo: Producto[]): Producto[] {
  const k = claveGrupo(producto);
  if (!k) return [];
  const grupo = catalogo.filter((p) => claveGrupo(p) === k);
  if (!grupo.some((p) => p.sku === producto.sku)) grupo.push(producto);
  return grupo.length > 1 ? ordenarTallas(grupo) : [];
}
