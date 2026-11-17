/**
 * Clave de un pedido para el ERP (16/11/2026). El ERP anota un pedido por
 * clave: si la misma llega dos veces (el cliente reintenta porque se cortó
 * la conexión), devuelve el WEB-n que ya existía en vez de anotar otro.
 *
 * Mientras el pedido sea EL MISMO (mismas líneas, mismos datos), la clave se
 * conserva en esta pestaña; si cambia algo, es otro pedido y lleva otra.
 */
const CLAVE = "allpet:clave-pedido";

function nueva(): string {
  try {
    return crypto.randomUUID().replace(/-/g, "");
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function clavePedido(datos: unknown): string {
  const huella = JSON.stringify(datos);
  try {
    const guardado = JSON.parse(window.sessionStorage.getItem(CLAVE) ?? "null") as { huella: string; clave: string } | null;
    if (guardado?.huella === huella && /^[a-z0-9]{8,64}$/i.test(guardado.clave)) return guardado.clave;
    const clave = nueva();
    window.sessionStorage.setItem(CLAVE, JSON.stringify({ huella, clave }));
    return clave;
  } catch {
    return nueva();
  }
}
