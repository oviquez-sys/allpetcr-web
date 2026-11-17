import { NextResponse, type NextRequest } from "next/server";
import { erpPost, ErpRespuestaError } from "@/lib/erpServidor";
import { enlaceMascota, inscribirEnErp, mensajeDelErp, type RespuestaInscripcionErp } from "@/lib/campanaServidor";
import { CAMPANA_IMPRESA, COOKIE_PARTICIPA } from "@/lib/campana";
import {
  COOKIE_BIENVENIDA, COOKIE_MIEMBRO, COOKIE_OAUTH, COOKIE_RESULTADO_CAMPANA, opcionesMiembro, aBienvenida, canjearCodigoGoogle, firmar, opcionesCookie,
  verificar, type RespuestaRegistroErp,
} from "@/lib/manada";
import { sitioUrl } from "@/lib/sitio";

interface DatosIda {
  state: string;
  nonce: string;
  telefono: string;
  promos: boolean;
  fuente: string;
  /** "campana" si vino del formulario del sorteo (16/11/2026). */
  destino?: string;
}

/** Vuelta de Google: canjea el código, registra en el ERP y lleva a la
 * página de bienvenida con el cupón. Cualquier falla vuelve a /manada con un
 * mensaje claro, nunca a una página de error técnica. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const idaPrevia = verificar<DatosIda>(request.cookies.get(COOKIE_OAUTH)?.value);
  const pagina = idaPrevia?.destino === "campana" ? "/navidad" : "/manada";
  const volver = (error: string) => {
    const r = NextResponse.redirect(`${sitioUrl}${pagina}?error=${error}#registro`, 303);
    r.cookies.delete({ name: COOKIE_OAUTH, path: "/api/manada/google" });
    return r;
  };

  // La persona tocó "Cancelar" en la pantalla de Google.
  if (url.searchParams.get("error")) return volver("cancelado");

  const ida = verificar<DatosIda>(request.cookies.get(COOKIE_OAUTH)?.value);
  const state = url.searchParams.get("state");
  const codigo = url.searchParams.get("code");
  // Sin la cookie de ida, o con un `state` distinto, esta vuelta no la
  // empezó este navegador: es la defensa contra que alguien le "regale" a
  // otro una sesión armada por él.
  if (!ida || !state || state !== ida.state || !codigo) return volver("sesion-vencida");

  let cuenta;
  try {
    cuenta = await canjearCodigoGoogle(codigo, ida.nonce);
  } catch {
    return volver("google");
  }

  if (ida.destino === "campana") {
    let r: RespuestaInscripcionErp;
    try {
      r = await inscribirEnErp({
        nombre: cuenta.nombre, email: cuenta.email, telefono: ida.telefono,
        acepta_promociones: ida.promos, origen: ida.fuente,
        google_sub: cuenta.sub, verificado: true,
      });
    } catch (e) {
      const cerrada = e instanceof ErpRespuestaError && e.status === 400 && /cerraron|activa|empieza/i.test(mensajeDelErp(e.cuerpo));
      return volver(cerrada ? "cerrada" : "sistema");
    }
    const listo = NextResponse.redirect(`${sitioUrl}/navidad?listo=1#registro`, 303);
    listo.cookies.delete({ name: COOKIE_OAUTH, path: "/api/manada/google" });
    listo.cookies.set(COOKIE_RESULTADO_CAMPANA,
      firmar({
        nombre: cuenta.nombre, numeros: r.numeros, ya: r.ya_participaba === true,
        mascotaUrl: enlaceMascota(r), bonoMascota: r.bono_mascota === "otorgado" ? "otorgado" : null,
      }, 3600),
      opcionesCookie(3600, "/navidad"));
    listo.cookies.set(COOKIE_MIEMBRO, "1", opcionesMiembro);
    listo.cookies.set(COOKIE_PARTICIPA, CAMPANA_IMPRESA.slug, { ...opcionesMiembro, httpOnly: false });
    return listo;
  }

  let registro: RespuestaRegistroErp;
  try {
    registro = await erpPost<RespuestaRegistroErp>("/api/manada/registro/", {
      email: cuenta.email,
      nombre: cuenta.nombre,
      google_sub: cuenta.sub,
      verificado: true,
      telefono: ida.telefono,
      acepta_promociones: ida.promos,
      fuente: ida.fuente,
    });
  } catch {
    return volver("sistema");
  }

  const respuesta = NextResponse.redirect(`${sitioUrl}/manada/bienvenida`, 303);
  respuesta.cookies.delete({ name: COOKIE_OAUTH, path: "/api/manada/google" });
  // Una semana: si cierra la pestaña y vuelve al rato en la tienda, el
  // código sigue a mano. También le llegó por correo.
  respuesta.cookies.set(COOKIE_BIENVENIDA, firmar({ ...aBienvenida(registro) }, 7 * 86400),
    opcionesCookie(7 * 86400, "/manada"));
  respuesta.cookies.set(COOKIE_MIEMBRO, "1", opcionesMiembro);
  return respuesta;
}
