import { NextResponse } from "next/server";
import { ErpNoConfiguradoError, ErpRespuestaError } from "@/lib/erpServidor";
import { enlaceMascota, inscribirEnErp, mensajeDelErp } from "@/lib/campanaServidor";
import { CAMPANA_IMPRESA, COOKIE_PARTICIPA } from "@/lib/campana";
import { COOKIE_MIEMBRO, ipDe, limpiarFuente, limpiarTelefono, opcionesMiembro, permitido } from "@/lib/manada";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CUERPO_BYTES = 4_096;

/**
 * Inscripción al sorteo (16/11/2026). Mismo formulario que La manada (nombre,
 * WhatsApp, correo opcional), pero contra POST /api/campana/inscripcion/ del
 * ERP, que además deja a la persona como miembro.
 *
 * Reintentar no duplica: el ERP reconoce a la persona por su WhatsApp o su
 * correo y la segunda vez responde «ya participaba». Por eso, si la conexión
 * falla, el formulario ofrece reintentar con los mismos datos.
 */
export async function POST(request: Request) {
  let datos: Record<string, unknown>;
  try {
    const texto = await request.text();
    if (new TextEncoder().encode(texto).byteLength > MAX_CUERPO_BYTES) {
      return NextResponse.json({ error: "La solicitud es demasiado grande." }, { status: 413 });
    }
    const parseado = JSON.parse(texto);
    if (typeof parseado !== "object" || parseado === null) throw new Error();
    datos = parseado;
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const nombre = typeof datos.nombre === "string" ? datos.nombre.trim().slice(0, 150) : "";
  const telefono = limpiarTelefono(datos.telefono);
  const email = typeof datos.email === "string" ? datos.email.trim().toLowerCase() : "";
  if (!nombre) return NextResponse.json({ error: "Escribí tu nombre.", campo: "nombre" }, { status: 400 });
  if (telefono.replace(/\D/g, "").replace(/^506/, "").length !== 8) {
    return NextResponse.json({ error: "Revisá tu número de WhatsApp: son 8 números.", campo: "telefono" }, { status: 400 });
  }
  if (email && (email.length > 254 || !CORREO_VALIDO.test(email))) {
    return NextResponse.json({ error: "Revisá el correo, o dejalo en blanco: es opcional.", campo: "email" }, { status: 400 });
  }
  if (datos.acepta_bases !== true) {
    return NextResponse.json({ error: "Para participar, marcá que aceptás las bases del sorteo.", campo: "bases" }, { status: 400 });
  }
  if (!permitido(`campana:${ipDe(request)}`, 10, 10 * 60_000) || !permitido(`campana-tel:${telefono}`, 5, 60 * 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos seguidos. Esperá unos minutos y probá de nuevo." }, { status: 429 });
  }

  try {
    const r = await inscribirEnErp({
      nombre, telefono, email,
      acepta_promociones: datos.promos === true,
      origen: limpiarFuente(datos.fuente),
    });
    const respuesta = NextResponse.json({
      ok: true,
      yaParticipaba: r.ya_participaba === true,
      numeros: typeof r.numeros === "number" ? r.numeros : null,
      mascotaUrl: enlaceMascota(r),
      bonoMascota: r.bono_mascota === "otorgado" ? "otorgado" : null,
    });
    respuesta.cookies.set(COOKIE_MIEMBRO, "1", opcionesMiembro);
    respuesta.cookies.set(COOKIE_PARTICIPA, CAMPANA_IMPRESA.slug, { ...opcionesMiembro, httpOnly: false });
    return respuesta;
  } catch (e) {
    if (e instanceof ErpNoConfiguradoError) {
      return NextResponse.json({ error: "La inscripción no está disponible en este momento.", reintentar: true }, { status: 503 });
    }
    if (e instanceof ErpRespuestaError && e.status === 400) {
      const detalle = mensajeDelErp(e.cuerpo);
      if (/cerraron|no est[aá] activa|todav[ií]a no empieza/i.test(detalle)) {
        return NextResponse.json({ error: detalle, cerrada: true }, { status: 409 });
      }
      return NextResponse.json({ error: "Revisá los datos: el número o el correo no parecen válidos." }, { status: 400 });
    }
    // Sin respuesta clara del ERP: no sabemos si quedó inscrito. Reintentar es
    // seguro porque el ERP no duplica.
    return NextResponse.json({
      error: "No pudimos confirmar tu inscripción. Revisá tu internet y tocá «Reintentar»: no se duplica.",
      reintentar: true,
    }, { status: 502 });
  }
}
