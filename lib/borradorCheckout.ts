/**
 * Borrador del formulario de checkout (auditoría F6-01, 16/10/2026).
 *
 * Antes, ir "Atrás" y "Adelante" en el navegador vaciaba nombre y dirección y
 * volvía a marcar "Retiro en tienda": el cliente tenía que escribir todo otra
 * vez y podía terminar pidiendo otra modalidad de entrega sin darse cuenta.
 *
 * Se guarda en sessionStorage, no en localStorage: vive solo en esa pestaña y
 * se borra al cerrarla. Lo que NO se guarda, a propósito: la aceptación de
 * términos (debe marcarla el cliente cada vez, Reglamento 37899-MEIC art. 188)
 * ni nada del pedido preparado.
 */
import type { DireccionEntrega } from "@/components/DireccionEntregaCliente";

export const CLAVE_BORRADOR = "allpet:checkout-borrador";

export interface BorradorCheckout {
  nombre: string;
  telefono: string;
  entrega: "retiro" | "coordinar";
  direccion: DireccionEntrega;
  nota: string;
  codigoManada: string;
}

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const numero = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Lee y sanea lo guardado; cualquier cosa rara devuelve null. */
export function interpretarBorrador(crudo: string | null): BorradorCheckout | null {
  if (!crudo) return null;
  try {
    const d = JSON.parse(crudo) as Record<string, unknown>;
    if (typeof d !== "object" || d === null) return null;
    const dir = (typeof d.direccion === "object" && d.direccion !== null ? d.direccion : {}) as Record<string, unknown>;
    return {
      nombre: texto(d.nombre, 150),
      telefono: texto(d.telefono, 30),
      entrega: d.entrega === "coordinar" ? "coordinar" : "retiro",
      direccion: {
        lat: numero(dir.lat),
        lng: numero(dir.lng),
        provincia: texto(dir.provincia, 80),
        canton: texto(dir.canton, 80),
        distrito: texto(dir.distrito, 80),
        senas: texto(dir.senas, 500),
      },
      nota: texto(d.nota, 300),
      codigoManada: texto(d.codigoManada, 40),
    };
  } catch {
    return null;
  }
}

export function leerBorrador(): BorradorCheckout | null {
  try {
    return interpretarBorrador(window.sessionStorage.getItem(CLAVE_BORRADOR));
  } catch {
    return null;
  }
}

export function guardarBorrador(b: BorradorCheckout): void {
  try {
    window.sessionStorage.setItem(CLAVE_BORRADOR, JSON.stringify(b));
  } catch {
    // Navegación privada o almacenamiento lleno: el formulario sigue
    // funcionando, solo que sin recordar lo escrito.
  }
}
