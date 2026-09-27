import type { FichaAlimento, Producto } from "./types";

/**
 * Utilidades de las fichas de alimento (26/09/2026).
 *
 * `precioPorKg` NO se muestra todavía: queda lista para el comparador de
 * alimentos. Existe ya para que el cálculo viva en un solo lugar y con
 * pruebas, en vez de reinventarse en cada pantalla que lo necesite.
 */

const A_KG: Record<string, number> = { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125 };

/** Contenido neto en kg, o null si el producto no tiene peso cargado o la
 *  unidad no es de masa (litros, unidades). */
export function pesoEnKg(producto: Pick<Producto, "peso_valor" | "peso_unidad">): number | null {
  const valor = Number(producto.peso_valor);
  const factor = A_KG[(producto.peso_unidad ?? "").toLowerCase()];
  if (!factor || !Number.isFinite(valor) || valor <= 0) return null;
  return valor * factor;
}

/** Colones por kilo, redondeado a entero; null si no hay peso. */
export function precioPorKg(producto: Pick<Producto, "precio_venta" | "peso_valor" | "peso_unidad">): number | null {
  const kg = pesoEnKg(producto);
  return kg ? Math.round(producto.precio_venta / kg) : null;
}

/** "Ideal para": solo lo que el fabricante declaró, en orden de lectura
 *  (especie → etapa → tamaño → necesidad → proteína). Sin repetidos. */
export function idealPara(ficha: FichaAlimento): string[] {
  const etapas = ficha.etapas.map((e) => e.etiqueta);
  const lista = [
    ficha.especie?.etiqueta,
    ...etapas,
    ...ficha.tamanos_raza.map((t) => t.etiqueta),
    ...ficha.necesidades.map((n) => n.etiqueta),
    ficha.proteina_principal ? `Con ${ficha.proteina_principal.toLowerCase()}` : "",
  ].filter((x): x is string => Boolean(x));
  return [...new Set(lista)];
}

/** "4020.0" → "4.020" (formato de Costa Rica, sin decimales cuando no hacen falta). */
export function formatoNumero(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) return "";
  return new Intl.NumberFormat("es-CR", { maximumFractionDigits: 2 }).format(Number(valor));
}
