import type { Categoria, Producto } from "./types";
import productosJson from "@/data/productos.json";
import categoriasJson from "@/data/categorias.json";

// Capa única de acceso a datos del catálogo.
//
// HOY: lee de data/productos.json y data/categorias.json (local).
// MAÑANA: cuando el ERP exponga una API (ver AUDITORIA_TECNICA_2026-07-22.md —
// hoy no existe, no hay Django REST Framework instalado), estas dos funciones
// son el ÚNICO lugar que cambia: reemplazar el import/JSON por un fetch()
// al endpoint real. Ningún componente de página debe leer los JSON
// directamente — todos pasan por aquí.

export async function getProductos(): Promise<Producto[]> {
  return productosJson as Producto[];
}

export async function getCategorias(): Promise<Categoria[]> {
  return categoriasJson as Categoria[];
}

export async function getProductoPorSku(sku: string): Promise<Producto | undefined> {
  const productos = await getProductos();
  return productos.find((p) => p.sku === sku);
}
