import { NextResponse } from "next/server";
import { beneficiosEnErp, leerCampana } from "@/lib/campanaServidor";
import { ajustarAZona } from "@/lib/campana";
import { ipDe, limpiarTelefono, permitido } from "@/lib/manada";
import { leerLineas } from "@/lib/lineasPedido";

/**
 * POST {lineas, entrega: "RET"|"ENV", canton?, distrito?, telefono?}
 * → lo que la campaña le da a ese carrito, calculado por el ERP con SUS
 * precios (el sitio no manda precios). Lo usan el carrito y la confirmación.
 */
export async function POST(request: Request) {
  if (!permitido(`beneficios:${ipDe(request)}`, 120, 10 * 60_000)) {
    return NextResponse.json({ error: "Demasiadas consultas." }, { status: 429 });
  }
  let cuerpo: Record<string, unknown>;
  try {
    const texto = await request.text();
    if (texto.length > 32_768) return NextResponse.json({ error: "Demasiado grande." }, { status: 413 });
    cuerpo = JSON.parse(texto);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const lineas = leerLineas(cuerpo?.lineas);
  if (!lineas) return NextResponse.json({ error: "Revisá las líneas del carrito." }, { status: 400 });
  const entrega = cuerpo.entrega === "ENV" ? "ENV" : "RET";
  const texto = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const campana = await leerCampana();
  const zonas = campana.erp?.envio_gratis?.zonas ?? [];
  const lugar = ajustarAZona(texto(cuerpo.canton, 60), texto(cuerpo.distrito, 60), zonas);
  try {
    const b = await beneficiosEnErp({
      lineas, entrega, ...lugar, telefono: limpiarTelefono(cuerpo.telefono),
    });
    return NextResponse.json(b, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Sin respuesta: el carrito sigue funcionando, solo sin el aviso.
    return NextResponse.json({ activa: false, sinConexion: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
