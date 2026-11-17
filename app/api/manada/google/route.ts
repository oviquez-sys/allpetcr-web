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
  let datos: FormData | null = null;
  try {
    datos = await request.formData();
  } catch {
    datos = null;
  }
  // Desde el formulario del sorteo (16/11/2026) la vuelta es a /navidad y el
  // registro se hace como inscripción a la campaña.
  const campana = datos?.get("destino") === "campana";
  const pagina = campana ? "/navidad" : "/manada";
  const volver = (error: string) => NextResponse.redirect(`${sitioUrl}${pagina}?error=${error}#registro`, 303);

  if (!googleConfigurado()) return volver("google-no-disponible");
  if (!permitido(`google:${ipDe(request)}`, 20, 10 * 60_000)) return volver("demasiados-intentos");
  if (!datos) return volver("datos");
  if (datos.get("acepto") !== "si") return volver("falta-consentimiento");
  if (campana && datos.get("acepta_bases") !== "si") return volver("falta-bases");

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
      destino: campana ? "campana" : "manada",
    }, 600),
    opcionesCookie(600, "/api/manada/google"),
  );
  return respuesta;
}
