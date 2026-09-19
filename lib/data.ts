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

/** Sigue `next` hasta traer todas las páginas. El catálogo (~500
 * productos) es chico: pedirlo completo es más simple que enseñarle
 * paginación a cada página del sitio que hoy espera un array completo. */
async function erpFetchTodasLasPaginas<T>(rutaInicial: string): Promise<T[]> {
  const items: T[] = [];
  let ruta: string | null = rutaInicial;
  const visitadas = new Set<string>();
  while (ruta) {
    if (visitadas.has(ruta) || visitadas.size >= 100) throw new Error("Paginación de catálogo inválida.");
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
  return erpFetchTodasLasPaginas<Producto>("/api/catalogo/productos/");
});

export const getCategorias = cache(async (): Promise<Categoria[]> => {
  if (!ERP_CONFIGURADO) {
    permitirRespaldoLocal();
    return categoriasJson as Categoria[];
  }
  return erpFetch<Categoria[]>("/api/catalogo/categorias/");
});

export const getProductoPorSku = cache(async (sku: string): Promise<Producto | undefined> => {
  if (!ERP_CONFIGURADO) return (await getProductos()).find((p) => p.sku === sku);
  try {
    return await erpFetch<Producto>(`/api/catalogo/productos/${encodeURIComponent(sku)}/`);
  } catch (error) {
    if (error instanceof ErrorCatalogo && error.status === 404) return undefined;
    throw error;
  }
});
