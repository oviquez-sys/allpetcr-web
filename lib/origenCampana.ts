/**
 * Origen de campaña (auditoría F13-02 y F13-03, 16/10/2026).
 *
 * El sitio no usa herramientas de analítica (ver /privacidad §3) y no se
 * instala ninguna a última hora. La medición mínima para el lanzamiento es
 * esta: si alguien entra por un enlace con etiquetas UTM (el de la biografía
 * de Instagram), el pedido que prepara por WhatsApp dice de qué campaña vino.
 * Así quien atiende puede contar los pedidos de la campaña sin cookies ni
 * terceros, y el cliente ve el dato en el mensaje antes de enviarlo.
 *
 * Vive en sessionStorage: dura lo que la pestaña y nunca sale del navegador
 * salvo dentro del mensaje que el propio cliente envía.
 */
export const CLAVE_ORIGEN = "allpet:origen-campana";

const LIMPIO = /^[a-z0-9_.-]{1,60}$/i;

/** "?utm_source=instagram&utm_campaign=lanzamiento_20261019" →
 *  "instagram / lanzamiento_20261019". Solo letras, números y _ . - */
export function origenDesdeUrl(busqueda: string): string | null {
  const p = new URLSearchParams(busqueda);
  const partes = [p.get("utm_source"), p.get("utm_campaign"), p.get("utm_content")]
    .filter((v): v is string => Boolean(v && LIMPIO.test(v)));
  return partes.length > 0 && p.get("utm_source") ? partes.join(" / ") : null;
}

export function recordarOrigen(busqueda: string): void {
  const origen = origenDesdeUrl(busqueda);
  if (!origen) return;
  try {
    window.sessionStorage.setItem(CLAVE_ORIGEN, origen);
  } catch {
    // Sin almacenamiento: el pedido sale igual, solo sin el origen.
  }
}

export function leerOrigen(): string {
  try {
    const v = window.sessionStorage.getItem(CLAVE_ORIGEN) ?? "";
    return LIMPIO.test(v.replace(/ \/ /g, "-")) ? v : "";
  } catch {
    return "";
  }
}
