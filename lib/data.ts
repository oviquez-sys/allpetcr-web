import "server-only";
import { cache } from "react";
import type { Categoria, Producto } from "./types";
import productosJson from "@/data/productos.json";
import categoriasJson from "@/data/categorias.json";

// Catálogo en vivo en producción; JSON solo para desarrollo sin ERP.
const ERP_API_URL = process.env.ERP_API_URL;
const ERP_API_TOKEN = process.env.ERP_API_TOKEN;
const ERP_CONFIGURADO = Boolean(ERP_API_URL && ERP_API_TOKEN);

function permitirRespaldoLocal() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("El catálogo requiere configurar la conexión al ERP.");
  }
}

interface RespuestaPaginada<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
class ErrorCatalogo extends Error {
  constructor(public status: number) { super(`El catálogo respondió ${status}.`); }
}

function esProducto(valor: unknown): valor is Producto {
  if (typeof valor !== "object" || valor === null) return false;
  const p = valor as Record<string, unknown>;
  return typeof p.sku === "string" && p.sku.trim().length > 0 && p.sku.length <= 100 &&
    typeof p.nombre === "string" && p.nombre.trim().length > 0 &&
    (p.categoria_id === null || Number.isInteger(p.categoria_id)) &&
    typeof p.presentacion === "string" && typeof p.descripcion === "string" &&
    typeof p.mascota === "string" && typeof p.imagen === "string" &&
    typeof p.precio_venta === "number" && Number.isFinite(p.precio_venta) && p.precio_venta > 0 &&
    typeof p.disponible === "boolean";
}

function validarProductos(valores: unknown[]): Producto[] {
  if (!valores.every(esProducto)) throw new Error("El ERP devolvió productos con un formato inválido.");
  // Un SKU repetido es un defecto del ERP, pero no debe dejar la tienda
  // completa sin catálogo. Conservamos la primera ficha recibida para que
  // cada SKU tenga una sola representación en tarjetas, carrito y checkout.
  // La ficha individual y el checkout siguen validándose contra el ERP.
  const porSku = new Map<string, Producto>();
  for (const producto of valores) {
    if (!porSku.has(producto.sku)) porSku.set(producto.sku, producto);
  }
  return [...porSku.values()];
}

function esCategoria(valor: unknown): valor is Categoria {
  if (typeof valor !== "object" || valor === null) return false;
  const c = valor as Record<string, unknown>;
  return Number.isInteger(c.id) && typeof c.nombre === "string" && c.nombre.trim().length > 0 &&
    (c.padre_id === null || Number.isInteger(c.padre_id)) && Number.isInteger(c.orden);
}

function validarCategorias(valor: unknown): Categoria[] {
  if (!Array.isArray(valor) || !valor.every(esCategoria)) {
    throw new Error("El ERP devolvió categorías con un formato inválido.");
  }
  const ids = new Set(valor.map((c) => c.id));
  if (ids.size !== valor.length) throw new Error("El ERP devolvió categorías duplicadas.");
  return valor;
}

async function erpFetch<T>(ruta: string): Promise<T> {
  const url = new URL(ruta, ERP_API_URL).toString();
  if (new URL(url).origin !== new URL(ERP_API_URL!).origin) {
    throw new Error("Origen de catálogo inválido.");
  }
  const respuesta = await fetch(url, {
    headers: { Authorization: `Token ${ERP_API_TOKEN}` },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  if (!respuesta.ok) {
    throw new ErrorCatalogo(respuesta.status);
  }
  return respuesta.json() as Promise<T>;
}

const MAX_PAGINAS = 100;
/** Cuántas páginas se piden a la vez. Suficiente para bajar el tiempo de
 *  ~3 s a unas pocas vueltas, sin descargar 22 consultas de golpe sobre
 *  el ERP (que atiende también el mostrador). */
const PAGINAS_EN_PARALELO = 6;

/** Trae todas las páginas del catálogo. El catálogo (~500 productos) es
 * chico: pedirlo completo es más simple que enseñarle paginación a cada
 * página del sitio que hoy espera un array completo.
 *
 * RENDIMIENTO (26/09/2026): antes se seguía `next` de a una página por vez.
 * Con PAGE_SIZE 24 en el ERP y 526 productos eran 22 consultas en fila y
 * ~3 s antes de que el inicio o el catálogo mandaran el primer byte
 * (/contacto, que no consulta el catálogo, respondía en 0.4 s). Ahora la
 * primera página dice cuántos productos hay (`count`) y el resto se pide en
 * paralelo, en tandas de PAGINAS_EN_PARALELO.
 *
 * Las URLs de las demás páginas se arman a partir del `next` que devolvió
 * el propio ERP (mismo formato, solo cambia `page`), y cada una pasa por
 * erpFetch, que sigue rechazando cualquier origen que no sea el del ERP.
 * Si la respuesta no trae `count` o `next` no usa `?page=`, se vuelve al
 * recorrido de siempre, página por página. */
async function erpFetchTodasLasPaginas<T>(rutaInicial: string): Promise<T[]> {
  const primera: RespuestaPaginada<T> = await erpFetch<RespuestaPaginada<T>>(rutaInicial);
  if (!Array.isArray(primera.results)) throw new Error("Respuesta de catálogo inválida.");

  const tamano = primera.results.length;
  const urlSiguiente = primera.next ? new URL(primera.next, ERP_API_URL) : null;
  if (urlSiguiente && urlSiguiente.searchParams.has("page") && Number.isInteger(primera.count) && tamano > 0) {
    const totalPaginas = Math.ceil(primera.count / tamano);
    if (totalPaginas > MAX_PAGINAS) throw new Error("Paginación de catálogo inválida.");
    const rutas: string[] = [];
    for (let n = 2; n <= totalPaginas; n++) {
      urlSiguiente.searchParams.set("page", String(n));
      rutas.push(urlSiguiente.toString());
    }
    const paginas: RespuestaPaginada<T>[] = [];
    for (let i = 0; i < rutas.length; i += PAGINAS_EN_PARALELO) {
      paginas.push(...(await Promise.all(
        rutas.slice(i, i + PAGINAS_EN_PARALELO).map((r) => erpFetch<RespuestaPaginada<T>>(r)),
      )));
    }
    const items = [...primera.results];
    for (const pagina of paginas) {
      if (!Array.isArray(pagina.results)) throw new Error("Respuesta de catálogo inválida.");
      items.push(...pagina.results);
    }
    // Si entraron productos mientras se pedían las páginas, la última
    // todavía apunta a una siguiente: se sigue de a una desde ahí.
    const ultima = paginas.at(-1) ?? primera;
    if (ultima.next) items.push(...(await erpSeguirPaginas<T>(ultima.next)));
    return items;
  }

  return [...primera.results, ...(primera.next ? await erpSeguirPaginas<T>(primera.next) : [])];
}

/** Recorrido clásico: sigue `next` de a una página. */
async function erpSeguirPaginas<T>(rutaInicial: string): Promise<T[]> {
  const items: T[] = [];
  let ruta: string | null = rutaInicial;
  const visitadas = new Set<string>();
  while (ruta) {
    if (visitadas.has(ruta) || visitadas.size >= MAX_PAGINAS) throw new Error("Paginación de catálogo inválida.");
    visitadas.add(ruta);
    const pagina: RespuestaPaginada<T> = await erpFetch<RespuestaPaginada<T>>(ruta);
    if (!Array.isArray(pagina.results)) throw new Error("Respuesta de catálogo inválida.");
    items.push(...pagina.results);
    ruta = pagina.next;
  }
  return items;
}

// React cache deduplica por render, sin conservar precios entre visitas.
export const getProductos = cache(async (): Promise<Producto[]> => {
  if (!ERP_CONFIGURADO) {
    permitirRespaldoLocal();
    return productosJson as Producto[];
  }
  return validarProductos(await erpFetchTodasLasPaginas<unknown>("/api/catalogo/productos/"));
});

export const getCategorias = cache(async (): Promise<Categoria[]> => {
  if (!ERP_CONFIGURADO) {
    permitirRespaldoLocal();
    return categoriasJson as Categoria[];
  }
  return validarCategorias(await erpFetch<unknown>("/api/catalogo/categorias/"));
});

export const getProductoPorSku = cache(async (sku: string): Promise<Producto | undefined> => {
  if (!ERP_CONFIGURADO) return (await getProductos()).find((p) => p.sku === sku);
  try {
    const producto = await erpFetch<unknown>(`/api/catalogo/productos/${encodeURIComponent(sku)}/`);
    if (!esProducto(producto)) throw new Error("El ERP devolvió una ficha con un formato inválido.");
    return producto;
  } catch (error) {
    if (error instanceof ErrorCatalogo && error.status === 404) return undefined;
    throw error;
  }
});
