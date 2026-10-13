import { NextResponse } from "next/server";
import { erpPost, ErpNoConfiguradoError, ErpRespuestaError } from "@/lib/erpServidor";
import { ipDe, limpiarFuente, limpiarTelefono, permitido, type RespuestaRegistroErp } from "@/lib/manada";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CUERPO_BYTES = 4_096;

/**
 * Registro con el correo (para quien no usa Google). El código del cupón NO
 * vuelve en esta respuesta: el ERP se lo manda al correo. Así el correo
 * queda comprobado sin pedir contraseñas ni códigos de verificación aparte.
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

  const email = typeof datos.email === "string" ? datos.email.trim().toLowerCase() : "";
  const nombre = typeof datos.nombre === "string" ? datos.nombre.trim().slice(0, 150) : "";
  if (!nombre) return NextResponse.json({ error: "Escribí tu nombre." }, { status: 400 });
  if (email.length > 254 || !CORREO_VALIDO.test(email)) {
    return NextResponse.json({ error: "Revisá el correo: no parece válido." }, { status: 400 });
  }
  if (datos.acepto !== true) {
    return NextResponse.json({ error: "Para unirte tenés que aceptar la política de privacidad." }, { status: 400 });
  }
  // Por IP y por correo: lo segundo frena que alguien use el formulario
  // para llenarle el buzón a otra persona desde muchas IP.
  if (!permitido(`registro:${ipDe(request)}`, 8, 10 * 60_000) || !permitido(`correo:${email}`, 3, 60 * 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá unos minutos y probá de nuevo." }, { status: 429 });
  }

  try {
    const r = await erpPost<RespuestaRegistroErp>("/api/manada/registro/", {
      email, nombre,
      telefono: limpiarTelefono(datos.telefono),
      verificado: false,
      acepta_promociones: datos.promos === true,
      fuente: limpiarFuente(datos.fuente),
    });
    return NextResponse.json({
      ok: true,
      correoEnviado: r.correo_enviado,
      yaEraMiembro: !r.cliente_nuevo,
      cuponUsado: r.cupon?.estado === "USADO",
    });
  } catch (e) {
    if (e instanceof ErpNoConfiguradoError) {
      return NextResponse.json({ error: "El registro todavía no está disponible." }, { status: 503 });
    }
    if (e instanceof ErpRespuestaError && e.status === 400) {
      return NextResponse.json({ error: "Revisá los datos: el correo o el WhatsApp no parecen válidos." }, { status: 400 });
    }
    return NextResponse.json({ error: "No pudimos registrarte en este momento. Probá de nuevo en un rato." }, { status: 502 });
  }
}
