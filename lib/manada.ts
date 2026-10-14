import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { sitioUrl } from "@/lib/sitio";

/**
 * La manada AllPetcr.com (13/10/2026): registro desde el QR de la tienda.
 *
 * Flujo con Google ("iniciar sesión con Google", OpenID Connect, flujo de
 * código): el navegador va a Google, vuelve con un código de un solo uso, y
 * ESTE servidor lo canjea directamente con Google por los datos de la cuenta.
 * El navegador nunca toca el secreto ni el token de Google, y el correo llega
 * confirmado por Google (`email_verified`) — por eso a ese cliente se le puede
 * mostrar el cupón en pantalla. A quien se registra solo con su correo, el
 * código le llega únicamente por correo (lo decide el ERP).
 *
 * Entre la ida a Google y la vuelta, y entre la vuelta y la página de
 * bienvenida, los datos viajan en cookies FIRMADAS (HMAC con MANADA_SECRETO):
 * el cliente las puede leer (son sus propios datos), pero no fabricarlas ni
 * cambiarlas. Sin MANADA_SECRETO el botón de Google se apaga solo.
 */

export const COOKIE_OAUTH = "manada_oauth";
export const COOKIE_BIENVENIDA = "manada_bienvenida";
/** Marca de "ya es de la manada" para dejar de mostrarle las invitaciones.
 * Visible al navegador a propósito (no httpOnly): no tiene nada secreto, solo
 * esconde avisos, y los avisos se deciden en el navegador. */
export const COOKIE_MIEMBRO = "manada_miembro";
export const opcionesMiembro = {
  httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const,
  path: "/", maxAge: 365 * 86400,
};

const GOOGLE_AUTORIZAR = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const EMISORES_GOOGLE = new Set(["accounts.google.com", "https://accounts.google.com"]);

function secreto(): string | null {
  const s = process.env.MANADA_SECRETO;
  // Una llave corta se adivina; mejor apagar el registro con Google que
  // firmar con algo débil sin que nadie se entere.
  return s && s.length >= 32 ? s : null;
}

export function googleConfigurado(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && secreto());
}

export function urlRetornoGoogle(): string {
  return `${sitioUrl}/api/manada/google/callback`;
}

// --- Cookies firmadas --------------------------------------------------------

const b64url = (b: Buffer) => b.toString("base64url");

export function firmar(datos: Record<string, unknown>, segundos: number): string {
  const llave = secreto();
  if (!llave) throw new Error("MANADA_SECRETO no está configurado.");
  const cuerpo = b64url(Buffer.from(JSON.stringify({ ...datos, exp: Math.floor(Date.now() / 1000) + segundos })));
  const firma = b64url(createHmac("sha256", llave).update(cuerpo).digest());
  return `${cuerpo}.${firma}`;
}

export function verificar<T = Record<string, unknown>>(valor: string | undefined | null): T | null {
  const llave = secreto();
  if (!llave || !valor) return null;
  const [cuerpo, firma] = valor.split(".");
  if (!cuerpo || !firma) return null;
  const esperada = createHmac("sha256", llave).update(cuerpo).digest();
  const recibida = Buffer.from(firma, "base64url");
  if (recibida.length !== esperada.length || !timingSafeEqual(recibida, esperada)) return null;
  try {
    const datos = JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8"));
    if (typeof datos !== "object" || datos === null) return null;
    if (typeof datos.exp !== "number" || datos.exp < Math.floor(Date.now() / 1000)) return null;
    return datos as T;
  } catch {
    return null;
  }
}

export const aleatorio = () => randomBytes(24).toString("base64url");

// --- Google -----------------------------------------------------------------

export function urlAutorizacionGoogle(state: string, nonce: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: urlRetornoGoogle(),
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    // Que siempre pregunte con cuál cuenta: en el celular de alguien de la
    // familia, entrar callado con la cuenta equivocada le da el cupón a otro.
    prompt: "select_account",
  });
  return `${GOOGLE_AUTORIZAR}?${params.toString()}`;
}

export interface CuentaGoogle {
  sub: string;
  email: string;
  nombre: string;
}

/** Revisa lo que dice el id_token. No hace falta verificar su firma: llegó
 * directo de Google por HTTPS en respuesta a nuestro canje (OpenID Connect
 * Core §3.1.3.7, punto 6). Sí hay que revisar para quién es, quién lo emitió,
 * que no esté vencido y que traiga el `nonce` que mandamos nosotros. */
export function leerIdToken(idToken: string, nonce: string, ahora = Date.now()): CuentaGoogle {
  const partes = idToken.split(".");
  if (partes.length !== 3) throw new Error("id_token mal formado");
  const c = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8"));
  if (!EMISORES_GOOGLE.has(c.iss)) throw new Error("emisor inesperado");
  const aud = Array.isArray(c.aud) ? c.aud : [c.aud];
  if (!aud.includes(process.env.GOOGLE_CLIENT_ID)) throw new Error("token para otra aplicación");
  if (typeof c.exp !== "number" || c.exp * 1000 < ahora) throw new Error("token vencido");
  if (!nonce || c.nonce !== nonce) throw new Error("nonce no coincide");
  if (c.email_verified !== true || typeof c.email !== "string") throw new Error("correo no verificado");
  if (typeof c.sub !== "string" || !c.sub) throw new Error("sin identificador de cuenta");
  return { sub: c.sub, email: c.email, nombre: typeof c.name === "string" ? c.name : "" };
}

export async function canjearCodigoGoogle(codigo: string, nonce: string): Promise<CuentaGoogle> {
  const respuesta = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: codigo,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: urlRetornoGoogle(),
      grant_type: "authorization_code",
    }).toString(),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  const cuerpo = (await respuesta.json().catch(() => null)) as { id_token?: string } | null;
  if (!respuesta.ok || !cuerpo?.id_token) throw new Error(`Google respondió ${respuesta.status}`);
  return leerIdToken(cuerpo.id_token, nonce);
}

// --- Datos del formulario ---------------------------------------------------

/** De dónde llegó (el QR lleva ?o=qr-tienda). Solo letras, números y guiones. */
export function limpiarFuente(valor: unknown): string {
  return typeof valor === "string" ? valor.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40) : "";
}

export function limpiarTelefono(valor: unknown): string {
  return typeof valor === "string" ? valor.replace(/[^\d+]/g, "").slice(0, 16) : "";
}

// --- Freno contra abuso -----------------------------------------------------
// Cada registro por correo manda un correo de verdad. Sin freno, cualquiera
// podría usar el formulario para mandarle cientos de correos a un tercero.
// En memoria del proceso: basta para una tienda (un solo servidor); si un día
// el sitio corre en varias máquinas, cada una frena por su cuenta.
const intentos = new Map<string, number[]>();

export function permitido(clave: string, maximo: number, ventanaMs: number, ahora = Date.now()): boolean {
  const recientes = (intentos.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  if (recientes.length >= maximo) {
    intentos.set(clave, recientes);
    return false;
  }
  recientes.push(ahora);
  intentos.set(clave, recientes);
  if (intentos.size > 5000) {
    for (const [k, v] of intentos) if (v.every((t) => ahora - t >= ventanaMs)) intentos.delete(k);
  }
  return true;
}

export function ipDe(request: Request): string {
  // DigitalOcean pone la IP real del visitante en este encabezado.
  const reenviada = request.headers.get("x-forwarded-for") ?? "";
  return reenviada.split(",")[0].trim() || "sin-ip";
}

// --- Lo que se le muestra al cliente después de Google ----------------------

export interface Bienvenida {
  nombre: string;
  codigo?: string;
  porcentaje?: string;
  descripcion?: string;
  vence_en?: string | null;
  estado?: string;
  nuevo?: boolean;
  token_mascotas?: string;
  correo_enviado?: boolean;
}

export interface RespuestaRegistroErp {
  nombre: string;
  cliente_nuevo: boolean;
  ya_era_miembro?: boolean;
  correo_enviado: boolean;
  mascotas_pendientes: boolean;
  cupon: null | {
    codigo?: string;
    porcentaje: string;
    descripcion: string;
    vence_en: string | null;
    estado: "DISPONIBLE" | "USADO" | "VENCIDO";
    nuevo: boolean;
  };
  token_mascotas?: string;
}

export function aBienvenida(r: RespuestaRegistroErp): Bienvenida {
  return {
    nombre: r.nombre,
    codigo: r.cupon?.codigo,
    porcentaje: r.cupon?.porcentaje,
    descripcion: r.cupon?.descripcion,
    vence_en: r.cupon?.vence_en ?? null,
    estado: r.cupon?.estado,
    nuevo: r.cupon?.nuevo,
    token_mascotas: r.token_mascotas,
    correo_enviado: r.correo_enviado,
  };
}

export const opcionesCookie = (segundos: number, path: string) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path,
  maxAge: segundos,
});
