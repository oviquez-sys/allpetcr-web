import { claveMarca } from "./filtrosCatalogo";
import type { Producto } from "./types";

/**
 * Marca para mostrar ARRIBA del nombre en la tarjeta (17/11/2026).
 *
 * Solo si el nombre no empieza ya con la marca: «ZEE.DOG / Arnés Flyharness»
 * suma; «BALANCE / Balance Adulto…» repite. La comparación ignora mayúsculas,
 * tildes y signos (Zee.Dog = ZeeDog).
 */
export function marcaVisible(p: Pick<Producto, "nombre" | "marca">): string | null {
  const marca = (p.marca ?? "").trim();
  if (!marca) return null;
  const clave = claveMarca(marca);
  if (!clave || claveMarca(p.nombre).startsWith(clave)) return null;
  return marca;
}
