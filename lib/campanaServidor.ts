import "server-only";
import { erpGet, erpPost } from "./erpServidor";
import type { BeneficiosErp, CampanaErp, LecturaCampana } from "./campana";

/**
 * La campaña vigente según el ERP (GET /api/campana/).
 *
 * Con caché de 60 s: la franja de arriba sale en TODAS las páginas y no vale
 * la pena preguntarle al ERP en cada visita. Cuando Oscar activa, cierra o
 * finaliza la campaña en el ERP, el sitio lo refleja en un minuto.
 */
export async function leerCampana(): Promise<LecturaCampana> {
  const url = process.env.ERP_API_URL;
  const token = process.env.ERP_API_TOKEN;
  if (!url || !token) return { conectado: false, erp: null };
  try {
    const r = await fetch(new URL("/api/campana/", url).toString(), {
      headers: { Authorization: `Token ${token}`, Accept: "application/json" },
      // CAMPANA_REVALIDAR solo para pruebas (0 = preguntar siempre).
      next: { revalidate: Number(process.env.CAMPANA_REVALIDAR ?? 60), tags: ["campana"] },
      signal: AbortSignal.timeout(5000),
    });
    // 404: el ERP todavía no tiene la campaña instalada. Para el sitio es
    // lo mismo que «no hay campaña activa»: no se promete nada.
    if (r.status === 404) return { conectado: true, erp: { activa: false } };
    if (!r.ok) return { conectado: false, erp: null };
    return { conectado: true, erp: (await r.json()) as CampanaErp };
  } catch {
    return { conectado: false, erp: null };
  }
}

export interface RespuestaInscripcionErp {
  participa: boolean;
  ya_participaba: boolean;
  numeros: number;
  cliente_nuevo: boolean;
  miembro_nuevo: boolean;
  campana: string;
  /** Llave de un solo uso para /manada/mascota, solo si todavía no ganó el
   *  número extra por su mascota (17/11/2026). */
  token_mascotas?: string;
  /** "pendiente": puede ganarlo; "otorgado": ya lo tiene. */
  bono_mascota?: "pendiente" | "otorgado";
}

/** Enlace al formulario de la mascota, si el ERP dio la llave. */
export function enlaceMascota(r: Pick<RespuestaInscripcionErp, "token_mascotas">): string | null {
  return typeof r.token_mascotas === "string" && /^[A-Za-z0-9_-]{16,200}$/.test(r.token_mascotas)
    ? `/manada/mascota?t=${encodeURIComponent(r.token_mascotas)}`
    : null;
}

export function inscribirEnErp(datos: {
  nombre: string; telefono: string; email: string; acepta_promociones: boolean; origen: string;
  google_sub?: string; verificado?: boolean;
}) {
  return erpPost<RespuestaInscripcionErp>("/api/campana/inscripcion/", { ...datos, acepta_bases: true });
}

export function beneficiosEnErp(datos: {
  lineas: { sku: string; cantidad: number }[]; entrega: "RET" | "ENV";
  canton?: string; distrito?: string; telefono?: string;
}) {
  return erpPost<BeneficiosErp>("/api/campana/beneficios/", datos);
}

export interface RespuestaPedidoPorConfirmar {
  numero: string;
  estado: string;
  subtotal_productos: string;
  cliente_reconocido: boolean;
  beneficios: Omit<BeneficiosErp, "activa" | "campana"> | null;
}

export function anotarPedidoEnErp(datos: Record<string, unknown>) {
  return erpPost<RespuestaPedidoPorConfirmar>("/api/pedidos/por-confirmar/", datos);
}

export function participanteEnErp(telefono: string) {
  return erpGet<{ activa: boolean; participa: boolean; numeros: number }>(
    `/api/campana/participante/?telefono=${encodeURIComponent(telefono)}`,
  );
}

/** El ERP manda los errores de validación como lista o como {detail}. */
export function mensajeDelErp(cuerpo: unknown): string {
  if (Array.isArray(cuerpo)) return cuerpo.map(String).join(" ");
  if (cuerpo && typeof cuerpo === "object") {
    const d = (cuerpo as Record<string, unknown>).detail;
    if (typeof d === "string") return d;
    return Object.values(cuerpo as Record<string, unknown>).flat().map(String).join(" ");
  }
  return "";
}
