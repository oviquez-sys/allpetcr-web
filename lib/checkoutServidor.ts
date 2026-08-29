import "server-only";
import type { Producto } from "./types";

/**
 * Cálculo del checkout, del lado del servidor (Bloque 5, ítem 30).
 *
 * REGLA DURA: el precio y el total NUNCA salen de lo que manda el
 * navegador. Esta función recibe SOLO sku y cantidad de cada línea —
 * cualquier `precio_venta` que el cliente incluya en el body se ignora
 * (ver LineaEntrada: el tipo ni siquiera lo admite) — y busca el precio
 * real en `productos`, que el caller tiene que haber pedido fresco al
 * catálogo (nunca de una copia guardada en el navegador).
 *
 * Hoy nada de esto está conectado al botón de "Enviar pedido" (que sigue
 * yendo por WhatsApp — ver el porqué en CheckoutCliente.tsx: cobrar en
 * línea necesita cuenta de comercio y una definición fiscal que todavía no
 * existe). Es la pieza que queda lista para el día que haya una pasarela
 * de pago real detrás del checkout — igual que la facturación electrónica
 * en el ERP: construida y probada, apagada hasta que haga falta.
 */

export interface LineaEntrada {
  sku: string;
  cantidad: number;
}

export interface LineaCalculada {
  sku: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ResultadoCheckout {
  items: LineaCalculada[];
  total: number;
  /** SKUs pedidos que no existen, no están disponibles, o con cantidad
   * inválida — el caller decide si eso bloquea el pedido o no. */
  problemas: string[];
}

const MAX_CANTIDAD_POR_LINEA = 99;

export function calcularTotalCheckout(
  lineas: LineaEntrada[],
  productos: Producto[],
): ResultadoCheckout {
  const porSku = new Map(productos.map((p) => [p.sku, p]));
  const items: LineaCalculada[] = [];
  const problemas: string[] = [];

  for (const linea of lineas) {
    const producto = porSku.get(linea.sku);
    const cantidad = Math.floor(Number(linea.cantidad));

    if (!producto) {
      problemas.push(`${linea.sku}: no existe en el catálogo.`);
      continue;
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0 || cantidad > MAX_CANTIDAD_POR_LINEA) {
      problemas.push(`${linea.sku}: cantidad inválida.`);
      continue;
    }
    if (!producto.disponible) {
      problemas.push(`${producto.sku}: sin existencias.`);
      continue;
    }

    // El precio SIEMPRE sale de `producto` (el catálogo real recién
    // pedido), nunca de `linea` — `LineaEntrada` ni siquiera tiene un
    // campo de precio que se pudiera leer por error.
    items.push({
      sku: producto.sku,
      nombre: producto.nombre,
      cantidad,
      precioUnitario: producto.precio_venta,
      subtotal: producto.precio_venta * cantidad,
    });
  }

  const total = items.reduce((suma, i) => suma + i.subtotal, 0);
  return { items, total, problemas };
}
