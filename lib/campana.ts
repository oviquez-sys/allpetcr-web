/**
 * CAMPAÑA NAVIDAD ALLPET 2026 (16/11/2026, pedido de Oscar)
 *
 * El ERP es la fuente oficial: quién participa, cuántos números da cada
 * compra, si el envío sale gratis y cuándo cierra (app `campanas`, ver
 * campanas/reglas.py en allpetcr-erp). Este archivo NO calcula números ni
 * envíos: solo decide QUÉ MOSTRAR según lo que el ERP responde, y guarda lo
 * que ya está impreso en las tarjetas para cuando el ERP no contesta.
 *
 * Archivo sin "server-only": lo usan tanto las páginas como los componentes
 * del navegador (tipos, estado, textos).
 */

/** Lo que dice la tarjeta impresa. Si el ERP no responde, el sitio usa estas
 *  fechas para no quedarse mudo frente a quien escaneó el QR. */
export const CAMPANA_IMPRESA = {
  slug: "navidad-2026",
  nombre: "Navidad AllPet 2026",
  /** Último momento para inscribirse y para que una compra dé números. */
  cierre: "2026-12-23T23:59:00-06:00",
  sorteo: "2026-12-24T12:00:00-06:00",
  /** Hasta cuándo la portada sigue diciendo «Este sorteo finalizó» a quien
   *  llega con la tarjeta en la mano. Después la portada vuelve a la normal
   *  (la página /navidad sigue respondiendo). */
  avisoFinalHasta: "2027-01-31T23:59:00-06:00",
  umbral: 20000,
} as const;

/** Respuesta de GET /api/campana/ del ERP. */
export interface CampanaErp {
  activa: boolean;
  slug?: string;
  nombre?: string;
  premio?: string;
  inscripcion_abierta?: boolean;
  inicio?: string;
  cierre?: string;
  sorteo_en?: string;
  numeros?: {
    por_inscribirse: number;
    por_compra: number;
    bono: number;
    umbral: string;
    compra_minima: string;
  };
  envio_gratis?: { activo: boolean; hasta: string; zonas: string[] };
  reemplaza_bienvenida?: boolean;
  plazo_reclamo_dias?: number;
  suplentes?: number;
  bases?: string;
}

/**
 * Lo que el sitio sabe de la campaña:
 *  - `erp`: lo que respondió el ERP (null si no respondió);
 *  - `conectado`: false si el ERP no contestó (caído, sin configurar).
 */
export interface LecturaCampana {
  conectado: boolean;
  erp: CampanaErp | null;
}

/**
 *  abierta     se puede inscribir (formulario visible)
 *  cerrada     ya cerraron las inscripciones; el sorteo todavía no se hace
 *  finalizada  el sorteo ya pasó: «Este sorteo finalizó»
 *  ninguna     no hay campaña que mostrar (antes de activarla en el ERP, o
 *              después de avisoFinalHasta)
 */
export type EstadoCampana = "abierta" | "cerrada" | "finalizada" | "ninguna";

const ms = (iso: string | undefined, respaldo: string) => {
  const t = Date.parse(iso ?? "");
  return Number.isFinite(t) ? t : Date.parse(respaldo);
};

export function estadoCampana(l: LecturaCampana, ahora = Date.now()): EstadoCampana {
  const finVisible = Date.parse(CAMPANA_IMPRESA.avisoFinalHasta);
  const c = l.erp;
  if (c?.activa) {
    if (c.inscripcion_abierta) return "abierta";
    // Activa pero sin inscripción: o todavía no empieza (el ERP no la
    // devuelve antes del inicio) o ya pasó el cierre.
    return ahora < ms(c.sorteo_en, CAMPANA_IMPRESA.sorteo) ? "cerrada" : "finalizada";
  }
  const cierre = Date.parse(CAMPANA_IMPRESA.cierre);
  const sorteo = Date.parse(CAMPANA_IMPRESA.sorteo);
  // El ERP ya no la tiene activa (la finalizaron) o no contesta: lo impreso
  // manda. Después del cierre la tarjeta tiene que seguir llevando a algo.
  if (ahora > cierre && ahora <= finVisible) return ahora < sorteo ? "cerrada" : "finalizada";
  // ERP caído en plena campaña: se sigue mostrando e invitando; el
  // formulario avisa si no puede confirmar y deja reintentar.
  if (!l.conectado && ahora <= cierre) return "abierta";
  return "ninguna";
}

/** "20000.00" → 20000 */
export function plata(valor: string | number | undefined | null): number {
  const n = typeof valor === "number" ? valor : Number.parseFloat(valor ?? "");
  return Number.isFinite(n) ? n : 0;
}

/** Fecha del sorteo como la dice la tarjeta: «24 de diciembre de 2026». */
export function fechaLarga(iso: string): string {
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric", month: "long", year: "numeric", timeZone: "America/Costa_Rica",
  }).format(new Date(iso));
}

// --- Beneficios de un carrito (POST /api/campana/beneficios/ del ERP) -------

export interface BeneficiosErp {
  activa: boolean;
  campana?: string;
  monto_evaluado?: string;
  umbral?: string;
  supera_umbral?: boolean;
  falta_para_bono?: string;
  participa?: boolean;
  da_numeros?: boolean;
  numeros?: { habituales: number; bono: number; total: number };
  envio?: { aplica: boolean; gratis: boolean; motivo: string };
}

/** Lo que el carrito y la confirmación muestran, ya en palabras. */
export interface ResumenBeneficios {
  /** Línea principal: cuántos números da la compra. */
  numeros: string | null;
  /** Lo que falta para el bono (y el envío gratis), si falta. */
  faltante: string | null;
  /** Qué pasa con el envío, si eligió envío. */
  envio: string | null;
  envioGratis: boolean;
  participa: boolean;
}

const colones = (n: number) =>
  new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(n);

/** `participaLocal`: este navegador ya se inscribió (cookie), aunque el
 *  carrito todavía no sepa el WhatsApp de la persona. */
export function resumirBeneficios(b: BeneficiosErp | null, participaLocal = false): ResumenBeneficios | null {
  if (!b?.activa) return null;
  const participa = Boolean(b.participa) || participaLocal;
  const n = b.numeros ?? { habituales: 0, bono: 0, total: 0 };
  let numeros: string | null = null;
  if (b.da_numeros && n.total > 0) {
    const detalle = n.bono > 0
      ? ` (${n.habituales} por la compra + ${n.bono} de bono por superar ${colones(plata(b.umbral))})`
      : "";
    numeros = `${participa ? "Esta compra te suma" : "Si estás inscrito, esta compra suma"} ${n.total} ${n.total === 1 ? "número" : "números"} para el sorteo${detalle}.`;
  }
  const falta = plata(b.falta_para_bono);
  const faltante = b.supera_umbral || falta <= 0 ? null
    : `Te faltan ${colones(falta)} para superar ${colones(plata(b.umbral))}: ${
      b.da_numeros ? "ganás doble puntaje y, en pedidos web, envío gratis en nuestra zona de Heredia"
        : "en pedidos web, el envío es gratis en nuestra zona de Heredia"}.`;
  const envio = b.envio?.aplica ? b.envio.motivo || null : null;
  return { numeros, faltante, envio, envioGratis: Boolean(b.envio?.gratis), participa };
}

// --- Zona de envío ----------------------------------------------------------

const plano = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * El ERP compara cantón y distrito al pie de la letra («Heredia / Mercedes»).
 * La dirección del sitio se escribe a mano o la sugiere el mapa, que a veces
 * dice «Mercedes Norte», «Heredia Central» o «San Francisco de Heredia».
 * Esto acerca lo escrito al nombre de la zona SOLO cuando es claramente esa
 * zona; si no, lo manda tal cual y el ERP decide.
 */
export function ajustarAZona(canton: string, distrito: string, zonas: string[]): { canton: string; distrito: string } {
  const c = plano(canton).replace(/\b(central|canton|centro)\b/g, "").trim();
  const d = plano(distrito);
  for (const zona of zonas) {
    const [zc, zd = ""] = zona.split("/").map((p) => p.trim());
    if (!zc || plano(zc) !== c) continue;
    if (!zd) return { canton: zc, distrito: distrito.trim() };
    const pd = plano(zd);
    if (d === pd || d.startsWith(`${pd} `) || (pd === plano(zc) && /^(centro|central)$/.test(d))) {
      return { canton: zc, distrito: zd };
    }
  }
  return { canton: canton.trim(), distrito: distrito.trim() };
}

/** «Heredia / Mercedes» … → «Heredia, Mercedes, San Francisco y Ulloa». */
export function zonasLegibles(zonas: string[]): string {
  const nombres = zonas.map((z) => (z.split("/")[1] ?? z.split("/")[0]).trim()).filter(Boolean);
  if (nombres.length <= 1) return nombres.join("");
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

// --- Para saber en el navegador que esta persona ya participa ---------------

/** Cookie legible por la página (sin datos personales: solo el slug). */
export const COOKIE_PARTICIPA = "campana_participa";

export function yaParticipaEnNavegador(slug: string = CAMPANA_IMPRESA.slug): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(/;\s*/).some((c) => c === `${COOKIE_PARTICIPA}=${slug}`);
}

/** Referencia del local: la misma de lib/negocio.ts (una sola fuente). */
export { REFERENCIA_LOCAL } from "./negocioReferencia";
