import type { LineaEntrada } from "./checkoutServidor";

/** Lee solo `sku` y `cantidad` de cada línea: nunca un precio que mande el
 *  navegador. Compartido por /api/checkout y las rutas de la campaña. */
const MAX_LINEAS = 100;
const MAX_SKU_CARACTERES = 100;

export function leerLineas(datos: unknown): LineaEntrada[] | null {
  if (!Array.isArray(datos) || datos.length === 0 || datos.length > MAX_LINEAS) return null;
  const lineas: LineaEntrada[] = [];
  for (const linea of datos) {
    if (typeof linea !== "object" || linea === null) return null;
    const { sku, cantidad } = linea as Record<string, unknown>;
    if (typeof sku !== "string" || !sku.trim() || sku.length > MAX_SKU_CARACTERES ||
        typeof cantidad !== "number" || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
      return null;
    }
    lineas.push({ sku: sku.trim(), cantidad });
  }
  return lineas;
}

