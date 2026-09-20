import "server-only";
import type { Producto } from "./types";

/** Verificación del pedido antes de preparar WhatsApp: precios y stock salen del ERP. */

export interface LineaEntrada {
  sku: string;
  cantidad: number;
}

export interface LineaCalculada {
  sku: string;
  nombre: string;
  presentacion: string;
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
    const cantidad = Number(linea.cantidad);

    if (!producto) {
      problemas.push(`${linea.sku}: no existe en el catálogo.`);
      continue;
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0 || cantidad > MAX_CANTIDAD_POR_LINEA) {
      problemas.push(`${linea.sku}: cantidad inválida.`);
      continue;
    }
    if (!producto.disponible) {
      problemas.push(`${producto.sku}: sin existencias.`);
      continue;
    }
    if (!Number.isFinite(producto.precio_venta) || producto.precio_venta <= 0) {
      problemas.push(`${producto.sku}: precio no disponible.`);
      continue;
    }

    // El precio SIEMPRE sale de `producto` (el catálogo real recién
    // pedido), nunca de `linea` — `LineaEntrada` ni siquiera tiene un
    // campo de precio que se pudiera leer por error.
    items.push({
      sku: producto.sku,
      nombre: producto.nombre,
      presentacion: producto.presentacion,
      cantidad,
      precioUnitario: producto.precio_venta,
      subtotal: producto.precio_venta * cantidad,
    });
  }

  const total = items.reduce((suma, i) => suma + i.subtotal, 0);
  return { items, total, problemas };
}
