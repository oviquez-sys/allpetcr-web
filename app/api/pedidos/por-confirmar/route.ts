import { NextResponse } from "next/server";
import { ErpRespuestaError } from "@/lib/erpServidor";
import { anotarPedidoEnErp, inscribirEnErp, leerCampana, mensajeDelErp } from "@/lib/campanaServidor";
import { ajustarAZona, CAMPANA_IMPRESA, COOKIE_PARTICIPA } from "@/lib/campana";
import { COOKIE_MIEMBRO, ipDe, limpiarFuente, limpiarTelefono, opcionesMiembro, permitido } from "@/lib/manada";
import { leerLineas } from "@/lib/lineasPedido";

/**
 * Anota en el ERP el pedido que el cliente está por mandar por WhatsApp
 * (16/11/2026). El ERP devuelve su número (WEB-12) y lo que le da la campaña;
 * la caja lo busca por ese número al cobrar y ahí se acreditan los números
 * del sorteo a esa persona.
 *
 * `clave` la genera el navegador una vez por pedido: si la conexión falla y
 * el cliente reintenta, el ERP devuelve el mismo WEB-n en vez de anotar otro.
 *
 * Si el cliente marcó «inscribirme al sorteo», primero se le inscribe: así
 * esta misma compra le cuenta. Si el ERP no responde, el pedido igual se
 * puede mandar por WhatsApp (sin número): nunca se bloquea una venta por esto.
 */
const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  if (!permitido(`por-confirmar:${ipDe(request)}`, 30, 10 * 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos seguidos. Esperá unos minutos." }, { status: 429 });
  }
  let d: Record<string, unknown>;
  try {
    const crudo = await request.text();
    if (crudo.length > 32_768) return NextResponse.json({ error: "El pedido es demasiado grande." }, { status: 413 });
    d = JSON.parse(crudo);
    if (typeof d !== "object" || d === null) throw new Error();
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const lineas = leerLineas(d.lineas);
  const clave = texto(d.clave, 64);
  const nombre = texto(d.nombre, 150);
  const telefono = limpiarTelefono(d.telefono);
  if (!lineas || !/^[A-Za-z0-9_-]{8,64}$/.test(clave) || !nombre || telefono.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ error: "Revisá los datos del pedido." }, { status: 400 });
  }
  const entrega = d.entrega === "ENV" ? "ENV" : "RET";
  const origen = texto(d.origen, 80);
  const campana = await leerCampana();
  const lugar = ajustarAZona(texto(d.canton, 60), texto(d.distrito, 60), campana.erp?.envio_gratis?.zonas ?? []);

  let inscrito: "si" | "ya" | "cerrada" | "error" | null = null;
  if (d.inscribir === true && d.acepta_bases === true) {
    try {
      const r = await inscribirEnErp({
        nombre, telefono, email: "", acepta_promociones: d.promos === true,
        origen: limpiarFuente(d.fuente) || "checkout",
      });
      inscrito = r.ya_participaba ? "ya" : "si";
    } catch (e) {
      inscrito = e instanceof ErpRespuestaError && /cerraron|activa|empieza/i.test(mensajeDelErp(e.cuerpo)) ? "cerrada" : "error";
    }
  }

  try {
    const r = await anotarPedidoEnErp({
      clave, nombre, telefono, entrega, lineas, origen,
      provincia: texto(d.provincia, 40), ...lugar, senas: texto(d.senas, 300), nota: texto(d.nota, 300),
    });
    const respuesta = NextResponse.json({
      numero: r.numero, clienteReconocido: r.cliente_reconocido, beneficios: r.beneficios
        ? { activa: true, ...r.beneficios } : null, inscrito,
    }, { headers: { "Cache-Control": "no-store" } });
    if (inscrito === "si" || inscrito === "ya") {
      respuesta.cookies.set(COOKIE_MIEMBRO, "1", opcionesMiembro);
      respuesta.cookies.set(COOKIE_PARTICIPA, CAMPANA_IMPRESA.slug, { ...opcionesMiembro, httpOnly: false });
    }
    return respuesta;
  } catch {
    return NextResponse.json({ numero: null, sinConexion: true, inscrito }, { headers: { "Cache-Control": "no-store" } });
  }
}
