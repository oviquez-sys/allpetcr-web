import { NextResponse } from "next/server";
import { getProductos } from "@/lib/data";
import { calcularTotalCheckout, type LineaEntrada } from "@/lib/checkoutServidor";

/**
 * POST {lineas: [{sku, cantidad}]} -> total calculado en el servidor.
 *
 * A propósito, esta ruta IGNORA cualquier precio que venga en el body: lee
 * únicamente `sku` y `cantidad` de cada línea (ver leerLineas) y busca el
 * precio real en el catálogo recién pedido — nunca en lo que mandó el
 * navegador. Es la prueba de la regla dura del ítem 30, no una promesa en
 * un comentario.
 */
function leerLineas(datos: unknown): LineaEntrada[] {
  if (!Array.isArray(datos)) return [];
  return datos
    .filter((l): l is Record<string, unknown> => typeof l === "object" && l !== null)
    .map((l) => ({
      sku: typeof l.sku === "string" ? l.sku : "",
      cantidad: typeof l.cantidad === "number" ? l.cantidad : Number(l.cantidad),
    }))
    .filter((l) => l.sku);
}

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const lineasCrudas = (cuerpo as { lineas?: unknown })?.lineas;
  const lineas = leerLineas(lineasCrudas);
  if (lineas.length === 0) {
    return NextResponse.json({ error: "El pedido no tiene productos." }, { status: 400 });
  }

  if (lineas.length > 100 || new Set(lineas.map((l) => l.sku)).size !== lineas.length) {
    return NextResponse.json({ error: "Revisá las líneas del carrito." }, { status: 400 });
  }
  try {
    const productos = await getProductos();
    const resultado = calcularTotalCheckout(lineas, productos);
    return NextResponse.json(resultado, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No pudimos verificar precios y existencias. Tu carrito se conserva; intentá de nuevo." }, { status: 503 });
  }
}
