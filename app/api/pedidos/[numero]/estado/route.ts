import { NextResponse } from "next/server";
import { erpGet, ErpNoConfiguradoError, ErpRespuestaError } from "@/lib/erpServidor";

/**
 * Proxy a GET /api/pedidos/<numero>/estado/ del ERP (ítem 34).
 *
 * El teléfono viaja como querystring hacia acá igual que hacia el ERP: es
 * el mismo control liviano que ya tiene el ERP (ver
 * api/views.py::EstadoPedidoView) — número Y teléfono, o nada. No se
 * confirma con un 403 que el número existe: un teléfono que no coincide
 * da la MISMA respuesta que un número inexistente.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ numero: string }> },
) {
  const { numero } = await params;
  const telefono = new URL(request.url).searchParams.get("telefono") ?? "";
  if (!telefono) {
    return NextResponse.json({ error: "Falta el teléfono." }, { status: 400 });
  }

  try {
    const estado = await erpGet(
      `/api/pedidos/${encodeURIComponent(numero)}/estado/?telefono=${encodeURIComponent(telefono)}`,
    );
    return NextResponse.json(estado);
  } catch (e) {
    if (e instanceof ErpNoConfiguradoError) {
      return NextResponse.json({ error: "El sitio todavía no está conectado al ERP." }, { status: 503 });
    }
    if (e instanceof ErpRespuestaError && e.status === 404) {
      return NextResponse.json({ error: "No se encontró ese pedido con ese teléfono." }, { status: 404 });
    }
    if (e instanceof ErpRespuestaError) {
      return NextResponse.json({ error: "No se pudo consultar el pedido." }, { status: 502 });
    }
    return NextResponse.json({ error: "Error inesperado." }, { status: 500 });
  }
}
