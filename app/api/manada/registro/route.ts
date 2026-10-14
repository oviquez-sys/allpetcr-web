import { NextResponse } from "next/server";
import { erpPost, ErpNoConfiguradoError, ErpRespuestaError } from "@/lib/erpServidor";
import {
  COOKIE_BIENVENIDA, COOKIE_MIEMBRO, aBienvenida, opcionesMiembro, firmar, ipDe, limpiarFuente, limpiarTelefono, opcionesCookie, permitido,
  type RespuestaRegistroErp,
} from "@/lib/manada";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CUERPO_BYTES = 4_096;

/**
 * Registro llenando los datos a mano (14/10/2026): nombre y WhatsApp, correo
 * opcional. Mucha gente —sobre todo mayor— no se acuerda del correo ni de la
 * contraseña de Google, así que esto no pide ninguna de las dos cosas.
 *
 * Si el cupón se acaba de crear, el ERP devuelve el código y se le muestra en
 * pantalla igual que con Google (misma cookie, misma página de bienvenida).
 * Si el número ya estaba registrado, NO se muestra el código de esa persona:
 * se le dice que lo pida en caja, donde basta con dar el número.
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
  if (!nombre) return NextResponse.json({ error: "Escribí tu nombre." }, { status: 400 });
  if (telefono.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ error: "Revisá tu número de WhatsApp: son 8 números." }, { status: 400 });
  }
  if (email && (email.length > 254 || !CORREO_VALIDO.test(email))) {
    return NextResponse.json({ error: "Revisá el correo, o dejalo en blanco: es opcional." }, { status: 400 });
  }
  if (datos.acepto !== true) {
    return NextResponse.json({ error: "Para unirte tenés que aceptar la política de privacidad." }, { status: 400 });
  }
  // Por IP y por número: cada registro nuevo entrega un cupón, así que se
  // frena a quien pruebe números al azar desde un mismo celular.
  if (!permitido(`registro:${ipDe(request)}`, 8, 10 * 60_000) || !permitido(`tel:${telefono}`, 3, 60 * 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá unos minutos y probá de nuevo." }, { status: 429 });
  }

  let r: RespuestaRegistroErp;
  try {
    r = await erpPost<RespuestaRegistroErp>("/api/manada/registro/", {
      nombre, telefono, email,
      verificado: false,
      acepta_promociones: datos.promos === true,
      fuente: limpiarFuente(datos.fuente),
    });
  } catch (e) {
    if (e instanceof ErpNoConfiguradoError) {
      return NextResponse.json({ error: "El registro todavía no está disponible." }, { status: 503 });
    }
    if (e instanceof ErpRespuestaError && e.status === 400) {
      return NextResponse.json({ error: "Revisá los datos: el número o el correo no parecen válidos." }, { status: 400 });
    }
    return NextResponse.json({ error: "No pudimos registrarte en este momento. Probá de nuevo en un rato." }, { status: 502 });
  }

  if (!r.cupon?.codigo) {
    // Ya era de la manada (o no hay regalía activa): sin código ajeno en pantalla.
    const ya = NextResponse.json({
      ok: true, yaEraMiembro: r.ya_era_miembro === true, cuponUsado: r.cupon?.estado === "USADO",
      sinRegalia: !r.cupon,
    });
    ya.cookies.set(COOKIE_MIEMBRO, "1", opcionesMiembro);
    return ya;
  }
  const respuesta = NextResponse.json({ ok: true, ir: "/manada/bienvenida" });
  respuesta.cookies.set(COOKIE_MIEMBRO, "1", opcionesMiembro);
  respuesta.cookies.set(COOKIE_BIENVENIDA, firmar({ ...aBienvenida(r) }, 7 * 86400),
    opcionesCookie(7 * 86400, "/manada"));
  return respuesta;
}
