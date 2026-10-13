import { NextResponse, type NextRequest } from "next/server";
import { erpPost } from "@/lib/erpServidor";
import {
  COOKIE_BIENVENIDA, COOKIE_OAUTH, aBienvenida, canjearCodigoGoogle, firmar, opcionesCookie,
  verificar, type RespuestaRegistroErp,
} from "@/lib/manada";
import { sitioUrl } from "@/lib/sitio";

interface DatosIda {
  state: string;
  nonce: string;
  telefono: string;
  promos: boolean;
  fuente: string;
}

/** Vuelta de Google: canjea el código, registra en el ERP y lleva a la
 * página de bienvenida con el cupón. Cualquier falla vuelve a /manada con un
 * mensaje claro, nunca a una página de error técnica. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const volver = (error: string) => {
    const r = NextResponse.redirect(`${sitioUrl}/manada?error=${error}#registro`, 303);
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
  return respuesta;
}
