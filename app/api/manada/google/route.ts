import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_OAUTH, aleatorio, firmar, googleConfigurado, ipDe, limpiarFuente, limpiarTelefono,
  opcionesCookie, permitido, urlAutorizacionGoogle,
} from "@/lib/manada";
import { sitioUrl } from "@/lib/sitio";

/**
 * Ida a Google. Lo llama el formulario de /manada (POST normal, no fetch):
 * así el consentimiento y el WhatsApp opcional viajan junto con el clic, y el
 * navegador sigue la redirección a Google sin JavaScript de por medio.
 */
export async function POST(request: NextRequest) {
  const volver = (error: string) => NextResponse.redirect(`${sitioUrl}/manada?error=${error}#registro`, 303);

  if (!googleConfigurado()) return volver("google-no-disponible");
  if (!permitido(`google:${ipDe(request)}`, 20, 10 * 60_000)) return volver("demasiados-intentos");

  let datos: FormData;
  try {
    datos = await request.formData();
  } catch {
    return volver("datos");
  }
  if (datos.get("acepto") !== "si") return volver("falta-consentimiento");

  const state = aleatorio();
  const nonce = aleatorio();
  const respuesta = NextResponse.redirect(urlAutorizacionGoogle(state, nonce), 303);
  respuesta.cookies.set(
    COOKIE_OAUTH,
    firmar({
      state, nonce,
      telefono: limpiarTelefono(datos.get("telefono")),
      promos: datos.get("promos") === "si",
      fuente: limpiarFuente(datos.get("fuente")),
    }, 600),
    opcionesCookie(600, "/api/manada/google"),
  );
  return respuesta;
}
