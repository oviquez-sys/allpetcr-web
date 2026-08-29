import { NextResponse } from "next/server";
import { firmaValida } from "@/lib/firmaWebhook";
import { erpPost, ErpNoConfiguradoError, ErpRespuestaError } from "@/lib/erpServidor";

/**
 * Webhook de pago (Bloque 5, ítem 35) — CONSTRUIDO Y PROBADO, SIN CONECTAR
 * a ninguna pasarela real todavía (no hay credenciales reales; el encargo
 * lo prohíbe explícitamente). Es la pieza que queda lista para el día que
 * exista una pasarela: cuando se elija una, se ajusta el nombre del
 * encabezado de firma y la forma del body a lo que esa pasarela mande —
 * la verificación de firma, la idempotencia y el resto del flujo no
 * cambian.
 *
 * VERIFICACIÓN DE FIRMA: header `X-Firma-Pago`, HMAC-SHA256 del cuerpo
 * crudo con PAGO_WEBHOOK_SECRET (ver lib/firmaWebhook.ts). Sin firma
 * válida, 401 — ni se mira el contenido.
 *
 * IDEMPOTENCIA: las pasarelas reenvían el mismo aviso más de una vez (el
 * encargo lo pide probado explícitamente). No se lleva un registro propio
 * de "ya procesado" acá: eso duplicaría la fuente de verdad. La
 * idempotencia real vive en el ERP (pedidos.services.crear_pedido, Bloque
 * 2), que ya está probada bajo concurrencia real, no solo "llamado dos
 * veces seguidas" — dos webhooks simultáneos con la misma referencia_pago
 * producen UN pedido y el stock baja una sola vez. Este endpoint solo
 * reenvía; confiar en una sola fuente de verdad es más simple y más
 * seguro que mantener dos.
 */
export async function POST(request: Request) {
  const secreto = process.env.PAGO_WEBHOOK_SECRET;
  const cuerpoCrudo = await request.text();
  const firma = request.headers.get("x-firma-pago");

  if (!secreto || !firmaValida(secreto, cuerpoCrudo, firma)) {
    return NextResponse.json({ error: "Firma inválida o ausente." }, { status: 401 });
  }

  let datos: unknown;
  try {
    datos = JSON.parse(cuerpoCrudo);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const pedido = await erpPost("/api/pedidos/", datos);
    return NextResponse.json(pedido, { status: 201 });
  } catch (e) {
    if (e instanceof ErpNoConfiguradoError) {
      return NextResponse.json({ error: "El sitio todavía no está conectado al ERP." }, { status: 503 });
    }
    if (e instanceof ErpRespuestaError) {
      return NextResponse.json({ error: "El ERP rechazó el pedido.", detalle: e.cuerpo }, { status: 502 });
    }
    return NextResponse.json({ error: "Error inesperado." }, { status: 500 });
  }
}
