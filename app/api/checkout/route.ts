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
const MAX_CUERPO_BYTES = 32_768;
const MAX_LINEAS = 100;
const MAX_SKU_CARACTERES = 100;

function leerLineas(datos: unknown): LineaEntrada[] | null {
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

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    const texto = await request.text();
    if (new TextEncoder().encode(texto).byteLength > MAX_CUERPO_BYTES) {
      return NextResponse.json({ error: "El pedido es demasiado grande." }, { status: 413 });
    }
    cuerpo = JSON.parse(texto);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const lineasCrudas = (cuerpo as { lineas?: unknown })?.lineas;
  const lineas = leerLineas(lineasCrudas);
  if (!lineas) {
    return NextResponse.json({ error: "Revisá las líneas del carrito." }, { status: 400 });
  }

  if (new Set(lineas.map((l) => l.sku)).size !== lineas.length) {
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
