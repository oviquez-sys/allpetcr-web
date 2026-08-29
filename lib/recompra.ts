"use client";

/**
 * RECOMPRA — "volver a pedir lo mismo".
 *
 * Qué resuelve: en una tienda de mascotas la mayor parte de lo que se vende
 * se acaba y se repone. El cliente que ya compró un saco de 2 kg no está
 * eligiendo otra vez, está reponiendo. Obligarlo a rearmar el mismo pedido
 * desde el catálogo es fricción pura.
 *
 * Decisiones que conviene entender antes de tocar esto:
 *
 * 1. CLAVE SEPARADA DEL CARRITO. El carrito es la intención de ahora y se
 *    vacía al enviar el pedido; esto es el historial y tiene que sobrevivir a
 *    ese vaciado. Guardarlos juntos obligaría a que uno de los dos mienta.
 *
 * 2. NO HAY NOTIFICACIONES. No hay cuentas, ni backend, ni push: el
 *    recordatorio vive en el navegador de esta persona y solo aparece cuando
 *    vuelve al sitio. El texto del checkout promete exactamente eso y ni una
 *    palabra más. Prometer un aviso que nunca va a llegar es peor que no
 *    ofrecerlo.
 *
 * 3. EL PEDIDO GUARDADO NUNCA IMPONE PRECIOS VIEJOS. Se guarda una copia
 *    (nombre y precio del momento) solo para detectar cambios; el total
 *    siempre se recalcula contra el catálogo vigente con `resolverCarrito`.
 *    Es la misma regla del carrito y por la misma razón.
 *
 * 4. CADUCA A LOS 180 DÍAS. Un pedido de hace medio año ya no es referencia
 *    de nada, y conservar indefinidamente lo que alguien compró —aunque sea
 *    en su propio navegador— no tiene ninguna justificación.
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import type { LineaCarrito } from "./carrito";

const CLAVE = "allpet.recompra.v1";
const MS_DIA = 86_400_000;

/** Opciones que se le ofrecen al cliente en el checkout. */
export const DIAS_SUGERIDOS = [15, 30, 45] as const;

/** "Recordámelo después": cuánto se corre el aviso al posponerlo. */
export const POSPONER_DIAS = 7;

const MAX_DIAS = 365;
const MAX_LINEAS = 60;
const MAX_POR_LINEA = 99;

/** Pasado este plazo el pedido guardado deja de mostrarse y se descarta. */
const VIGENCIA_DIAS = 180;

export interface Recompra {
  lineas: LineaCarrito[];
  /** epoch ms del momento en que se preparó el pedido. */
  hecho: number;
  /** Días pedidos para el recordatorio. null = el cliente no pidió ninguno. */
  dias: number | null;
  /** epoch ms hasta el cual el aviso queda oculto. null = visible. */
  ocultoHasta: number | null;
}

// ─────────────────────────────────────────────────────────────────────────
//  Lógica pura (sin navegador). Está separada para poder probarla: todo lo
//  que decide QUÉ se muestra vive acá, y el resto solo lee y escribe.
// ─────────────────────────────────────────────────────────────────────────

function numeroFinito(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * localStorage es entrada NO confiable: puede venir de una versión anterior
 * del sitio o haber sido editada a mano. Cualquier cosa que no encaje se
 * descarta en silencio en vez de romper la página.
 */
export function sanear(bruto: unknown): Recompra | null {
  if (!bruto || typeof bruto !== "object") return null;
  const d = bruto as Record<string, unknown>;

  if (!Array.isArray(d.lineas)) return null;
  const lineas: LineaCarrito[] = d.lineas
    .filter(
      (l): l is LineaCarrito =>
        !!l &&
        typeof l === "object" &&
        typeof (l as LineaCarrito).sku === "string" &&
        (l as LineaCarrito).sku.length > 0 &&
        numeroFinito((l as LineaCarrito).cantidad) &&
        (l as LineaCarrito).cantidad > 0,
    )
    .slice(0, MAX_LINEAS)
    .map((l) => ({
      sku: l.sku,
      cantidad: Math.min(Math.floor(l.cantidad), MAX_POR_LINEA),
      nombreGuardado: typeof l.nombreGuardado === "string" ? l.nombreGuardado : "",
      precioGuardado: numeroFinito(l.precioGuardado) ? l.precioGuardado : 0,
    }));

  if (lineas.length === 0) return null;
  if (!numeroFinito(d.hecho) || d.hecho <= 0) return null;

  const dias =
    numeroFinito(d.dias) && d.dias >= 1 && d.dias <= MAX_DIAS
      ? Math.floor(d.dias)
      : null;

  return {
    lineas,
    hecho: d.hecho,
    dias,
    ocultoHasta: numeroFinito(d.ocultoHasta) ? d.ocultoHasta : null,
  };
}

/** El pedido guardado sigue siendo una referencia útil. */
export function vigente(estado: Recompra | null, ahora: number): boolean {
  if (!estado) return false;
  return ahora - estado.hecho < VIGENCIA_DIAS * MS_DIA;
}

/**
 * ¿Corresponde mostrar el aviso? Tres condiciones, todas necesarias:
 * el cliente pidió el recordatorio, ya se cumplió el plazo, y no lo pospuso.
 */
export function hayQueRecordar(estado: Recompra | null, ahora: number): boolean {
  if (!vigente(estado, ahora) || estado!.dias === null) return false;
  const e = estado!;
  if (ahora < e.hecho + e.dias! * MS_DIA) return false;
  if (e.ocultoHasta !== null && ahora < e.ocultoHasta) return false;
  return true;
}

/** Días enteros transcurridos desde el pedido. Nunca negativo. */
export function diasDesde(hecho: number, ahora: number): number {
  return Math.max(0, Math.floor((ahora - hecho) / MS_DIA));
}

// ─────────────────────────────────────────────────────────────────────────
//  Almacén externo con suscripción.
//
//  Mismo patrón que lib/carrito.tsx y por la misma razón: localStorage ES un
//  almacén externo a React. Leerlo en un efecto y volcarlo a estado abre una
//  ventana en la que el aviso aparece de golpe después del primer pintado.
// ─────────────────────────────────────────────────────────────────────────

let cacheEstado: Recompra | null = null;
let cacheJson = "";
const oyentes = new Set<() => void>();

function suscribir(cb: () => void) {
  oyentes.add(cb);
  // Entre pestañas: si cierra el aviso en una, debe desaparecer en la otra.
  const alCambiar = (e: StorageEvent) => {
    if (e.key === CLAVE) notificar();
  };
  window.addEventListener("storage", alCambiar);
  return () => {
    oyentes.delete(cb);
    window.removeEventListener("storage", alCambiar);
  };
}

function notificar() {
  for (const cb of oyentes) cb();
}

/** Debe devolver la MISMA referencia si nada cambió, o React re-renderiza en
 *  bucle. Por eso se compara el JSON crudo antes de reconstruir. */
function instantanea(): Recompra | null {
  const bruto =
    typeof window === "undefined" ? "" : window.localStorage.getItem(CLAVE) ?? "";
  if (bruto !== cacheJson) {
    cacheJson = bruto;
    try {
      cacheEstado = bruto ? sanear(JSON.parse(bruto)) : null;
    } catch {
      cacheEstado = null;
    }
  }
  return cacheEstado;
}

/** En el servidor no hay historial: no hay localStorage. */
function instantaneaServidor(): Recompra | null {
  return null;
}

function escribir(estado: Recompra | null) {
  try {
    if (estado === null) {
      window.localStorage.removeItem(CLAVE);
      cacheJson = "";
    } else {
      const json = JSON.stringify(estado);
      window.localStorage.setItem(CLAVE, json);
      cacheJson = json;
    }
    cacheEstado = estado;
  } catch {
    // Almacenamiento lleno o modo privado. El sitio sigue funcionando; lo
    // único que se pierde es el historial, que es una comodidad, no el
    // camino de compra. No vale la pena molestar al cliente con un error.
    cacheEstado = estado;
    cacheJson = "";
  }
  notificar();
}

export function leerRecompra(): Recompra | null {
  return instantanea();
}

// ─────────────────────────────────────────────────────────────────────────
//  Acciones
// ─────────────────────────────────────────────────────────────────────────

/**
 * Guarda el pedido recién preparado. Se llama desde el checkout, después de
 * abrir WhatsApp. Un pedido nuevo reemplaza al anterior y reinicia el
 * recordatorio: lo que el cliente eligió hace dos meses no aplica a esto.
 */
export function guardarUltimoPedido(lineas: LineaCarrito[]): void {
  if (typeof window === "undefined" || lineas.length === 0) return;
  escribir({
    lineas: lineas.slice(0, MAX_LINEAS),
    hecho: Date.now(),
    dias: null,
    ocultoHasta: null,
  });
}

/** El cliente eligió que se le recuerde en N días. */
export function programarRecordatorio(dias: number): void {
  const estado = instantanea();
  if (!estado) return;
  if (!Number.isFinite(dias) || dias < 1 || dias > MAX_DIAS) return;
  escribir({ ...estado, dias: Math.floor(dias), ocultoHasta: null });
}

/** "Todavía no": el aviso vuelve en una semana. */
export function posponerRecordatorio(): void {
  const estado = instantanea();
  if (!estado) return;
  escribir({ ...estado, ocultoHasta: Date.now() + POSPONER_DIAS * MS_DIA });
}

/** "Ya no me lo recuerdes": se conserva el pedido, se apaga el aviso. */
export function descartarRecordatorio(): void {
  const estado = instantanea();
  if (!estado) return;
  escribir({ ...estado, dias: null, ocultoHasta: null });
}

/** Borra el pedido guardado. Es el control que le queda al cliente sobre lo
 *  único que el sitio conserva de él. */
export function olvidarPedido(): void {
  if (typeof window === "undefined") return;
  escribir(null);
}

// ─────────────────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────────────────

/**
 * Devuelve el estado guardado, si ya se leyó el navegador, y el instante con
 * el que hay que evaluarlo.
 *
 * Por qué `ahora` sale de acá y no de un `Date.now()` en el componente: la
 * hora es impura. Llamarla durante el render hace que dos renders del mismo
 * estado puedan dar resultados distintos —el aviso aparecería o no según el
 * momento exacto en que React repinta— y la regla `react-hooks/purity` lo
 * marca como error. Se toma una sola vez, después de montar, y ese valor
 * manda para toda la visita.
 *
 * `listo` (= ya se tomó la hora) distingue "todavía no leí el navegador" de
 * "no hay nada guardado". Sin eso, el aviso y la página de recompra
 * parpadearían con el estado vacío durante la hidratación.
 *
 * Consecuencia aceptada: en una pestaña que quede abierta varios días el
 * aviso no aparece solo. Aparece en la siguiente carga, que es cuando la
 * persona de verdad está mirando.
 */
export function useRecompra(): { estado: Recompra | null; listo: boolean; ahora: number } {
  const estado = useSyncExternalStore(suscribir, instantanea, instantaneaServidor);
  const [ahora, setAhora] = useState(0);
  useEffect(() => {
    // Fuera del render: no dispara cascada.
    const id = requestAnimationFrame(() => setAhora(Date.now()));
    return () => cancelAnimationFrame(id);
  }, []);
  return { estado, listo: ahora > 0, ahora };
}
