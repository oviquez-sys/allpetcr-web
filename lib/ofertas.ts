import type { Oferta, Producto } from "./types";

/**
 * Ofertas del sitio (04/11/2026, promociones del ERP: catalogo/promociones.py).
 *
 * El ERP manda el precio de oferta ya calculado en `precio_venta` y el normal
 * en `precio_antes`. Por eso el carrito, el checkout y el orden por precio no
 * cambian: cobran lo mismo que la caja de la tienda. Este módulo solo decide
 * cómo se MUESTRA (tachado, -40 %, hasta cuándo) y arma el resumen de la
 * franja de arriba y de la sección «Ofertas».
 *
 * Lo que el MEIC revisa en una oferta y por eso siempre se ve: la vigencia,
 * el precio anterior o el porcentaje, y el precio final. Lo que NO se
 * publica: cuántas unidades quedan (decisión de antes, ver types.ts).
 */

export type ProductoEnOferta = Producto & { oferta: Oferta; precio_antes: number };

export function enOferta(p: Producto): p is ProductoEnOferta {
  return !!p.oferta && typeof p.precio_antes === "number" && p.precio_antes > p.precio_venta;
}

/** Cuánto se ahorra en colones (0 sin oferta). */
export function ahorro(p: Producto): number {
  return enOferta(p) ? p.precio_antes - p.precio_venta : 0;
}

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

/** "AAAA-MM-DD" → "lun 30/11". La fecha es de Costa Rica y se arma a mano
 *  para que el servidor (UTC) y el navegador digan lo mismo. */
export function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return iso;
  const dia = DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
  return `${dia} ${d}/${m}`;
}

/** Fin de la oferta como instante: 23:59:59 del último día, hora de Costa
 *  Rica (UTC−6, sin horario de verano). */
export function finDeOferta(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 23 + 6, 59, 59));
}

/** Saca del JSON lo que no tenga forma de oferta: un dato raro del ERP no
 *  puede romper el catálogo, como mucho deja de mostrar el tachado. */
export function normalizarOferta<T extends Producto>(p: T): T {
  const o = p.oferta as Partial<Oferta> | null | undefined;
  // Sin oferta (lo normal): el producto pasa tal cual.
  if (o == null && p.precio_antes == null) return p;
  const valida =
    !!o && typeof o === "object" &&
    typeof o.pct === "number" && o.pct > 0 && o.pct < 100 &&
    typeof o.nombre === "string" && o.nombre.trim().length > 0 &&
    typeof o.hasta === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.hasta) &&
    typeof p.precio_antes === "number" && Number.isFinite(p.precio_antes) && p.precio_antes > p.precio_venta;
  if (valida) return { ...p, oferta: { ...(o as Oferta), en_ofertas: o!.en_ofertas !== false } };
  return { ...p, oferta: null, precio_antes: null };
}

export interface ResumenOfertas {
  /** El nombre de la promoción con más productos (la que se anuncia). */
  nombre: string;
  pctMax: number;
  /** El último día entre las ofertas que se anuncian. */
  hasta: string;
  cantidad: number;
}

/** Para la franja de arriba y el menú: solo lo disponible y marcado para la
 *  sección «Ofertas». null si no hay nada que anunciar. */
export function resumenOfertas(productos: Producto[]): ResumenOfertas | null {
  const lista = productos.filter((p) => p.disponible && enOferta(p) && p.oferta!.en_ofertas) as ProductoEnOferta[];
  if (!lista.length) return null;
  const porNombre = new Map<string, number>();
  for (const p of lista) porNombre.set(p.oferta.nombre, (porNombre.get(p.oferta.nombre) ?? 0) + 1);
  const nombre = [...porNombre.entries()].sort((a, b) => b[1] - a[1])[0][0];
  return {
    nombre,
    pctMax: Math.max(...lista.map((p) => p.oferta.pct)),
    hasta: lista.map((p) => p.oferta.hasta).sort().at(-1)!,
    cantidad: lista.length,
  };
}

export const HREF_OFERTAS = "/catalogo?ofertas=1";
