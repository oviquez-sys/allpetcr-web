"use client";

/**
 * Estado del carrito de compras.
 *
 * Decisiones que conviene entender antes de tocar esto:
 *
 * 1. PERSISTE EN localStorage. Un cliente que arma su pedido, cierra el
 *    navegador y vuelve al día siguiente encuentra su carrito intacto. Sin
 *    esto, cualquier recarga accidental borra el trabajo del cliente — es una
 *    de las causas más comunes de abandono.
 *
 * 2. GUARDA UNA COPIA DEL PRODUCTO, no solo el SKU. Si un producto cambia de
 *    precio o se descataloga entre una visita y otra, el carrito no se rompe
 *    ni muestra un precio equivocado en silencio: se compara contra el
 *    catálogo actual y se avisa al cliente de forma explícita.
 *
 * 3. VALIDA CONTRA EL CATÁLOGO al cargar la página. Los precios de la copia
 *    guardada nunca se usan para el total; el total siempre se calcula con el
 *    precio vigente. Mostrar un precio viejo en el checkout es la forma más
 *    rápida de perder la confianza de un cliente.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  useSyncExternalStore,
} from "react";
import type { Producto } from "./types";

const CLAVE = "allpet.carrito.v1";

export interface LineaCarrito {
  sku: string;
  cantidad: number;
  /** Copia del momento en que se agregó, solo para detectar cambios. */
  nombreGuardado: string;
  precioGuardado: number;
}

/** Línea ya resuelta contra el catálogo vigente, lista para mostrar. */
export interface LineaResuelta {
  sku: string;
  cantidad: number;
  producto: Producto | null;
  /** El producto ya no existe en el catálogo. */
  descatalogado: boolean;
  /** El precio cambió desde que se agregó. */
  precioCambio: boolean;
  precioAnterior: number;
  /** Precio vigente × cantidad. 0 si no se puede comprar. */
  subtotal: number;
}

interface CarritoContexto {
  lineas: LineaCarrito[];
  /** Total de unidades, para el contador de la cabecera. */
  unidades: number;
  agregar: (producto: Producto, cantidad?: number) => void;
  quitar: (sku: string) => void;
  cambiarCantidad: (sku: string, cantidad: number) => void;
  vaciar: () => void;
  contiene: (sku: string) => boolean;
  /** Ya se leyó localStorage. Evita parpadeos al hidratar. */
  listo: boolean;
}

const Ctx = createContext<CarritoContexto | null>(null);

const MAX_POR_LINEA = 99;

function leerAlmacen(): LineaCarrito[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CLAVE);
    if (!bruto) return [];
    const datos = JSON.parse(bruto);
    if (!Array.isArray(datos)) return [];
    // Sanear: datos de localStorage son entrada no confiable — pueden venir
    // de una versión anterior del sitio o haber sido editados a mano.
    return datos
      .filter(
        (l): l is LineaCarrito =>
          l && typeof l.sku === "string" && typeof l.cantidad === "number" &&
          Number.isFinite(l.cantidad) && l.cantidad > 0,
      )
      .map((l) => ({
        sku: l.sku,
        cantidad: Math.min(Math.floor(l.cantidad), MAX_POR_LINEA),
        nombreGuardado: typeof l.nombreGuardado === "string" ? l.nombreGuardado : "",
        precioGuardado: Number.isFinite(l.precioGuardado) ? l.precioGuardado : 0,
      }));
  } catch {
    return [];
  }
}

/**
 * Almacén externo con suscripción.
 *
 * Se usa useSyncExternalStore en vez de useState + useEffect porque
 * localStorage ES un almacén externo a React: leerlo dentro de un efecto y
 * volcarlo a estado provoca un render en cascada (React lo señala) y, sobre
 * todo, abre una ventana en la que la interfaz muestra un carrito vacío que
 * un instante después cambia. Esta API existe justamente para este caso.
 */
let cacheLineas: LineaCarrito[] = [];
let cacheJson = "";
const oyentes = new Set<() => void>();

function suscribir(cb: () => void) {
  oyentes.add(cb);
  // Entre pestañas: si el cliente tiene el sitio abierto dos veces, ambas
  // deben ver el mismo carrito.
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

/** Debe devolver la MISMA referencia si nada cambió, o React re-renderiza
 *  en bucle. Por eso se compara el JSON crudo antes de reconstruir. */
function instantanea(): LineaCarrito[] {
  const bruto = typeof window === "undefined" ? "" : window.localStorage.getItem(CLAVE) ?? "";
  if (bruto !== cacheJson) {
    cacheJson = bruto;
    cacheLineas = leerAlmacen();
  }
  return cacheLineas;
}

/** En el servidor el carrito siempre está vacío: no hay localStorage. */
const VACIO: LineaCarrito[] = [];
function instantaneaServidor(): LineaCarrito[] {
  return VACIO;
}

function guardar(lineas: LineaCarrito[]) {
  try {
    const json = JSON.stringify(lineas);
    window.localStorage.setItem(CLAVE, json);
    cacheJson = json;
    cacheLineas = lineas;
  } catch {
    // Almacenamiento lleno o modo privado: el carrito sigue funcionando en
    // memoria durante la sesión. No vale la pena molestar al cliente.
    cacheLineas = lineas;
    cacheJson = "";
  }
  notificar();
}

export function ProveedorCarrito({ children }: { children: React.ReactNode }) {
  const lineas = useSyncExternalStore(suscribir, instantanea, instantaneaServidor);

  // Tras la hidratación ya se puede confiar en lo leído del navegador. Se
  // usa para no pintar "carrito vacío" antes de saberlo.
  const [listo, setListo] = useState(false);
  useEffect(() => {
    // Fuera del render: no dispara cascada.
    const id = requestAnimationFrame(() => setListo(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const agregar = useCallback((producto: Producto, cantidad = 1) => {
    const prev = instantanea();
    const existente = prev.find((l) => l.sku === producto.sku);
    guardar(
      existente
        ? prev.map((l) =>
            l.sku === producto.sku
              ? { ...l, cantidad: Math.min(l.cantidad + cantidad, MAX_POR_LINEA) }
              : l,
          )
        : [
            ...prev,
            {
              sku: producto.sku,
              cantidad: Math.min(cantidad, MAX_POR_LINEA),
              nombreGuardado: producto.nombre,
              precioGuardado: producto.precio_venta,
            },
          ],
    );
  }, []);

  const quitar = useCallback((sku: string) => {
    guardar(instantanea().filter((l) => l.sku !== sku));
  }, []);

  const cambiarCantidad = useCallback((sku: string, cantidad: number) => {
    const n = Math.floor(cantidad);
    const prev = instantanea();
    if (!Number.isFinite(n) || n <= 0) {
      guardar(prev.filter((l) => l.sku !== sku));
      return;
    }
    guardar(
      prev.map((l) => (l.sku === sku ? { ...l, cantidad: Math.min(n, MAX_POR_LINEA) } : l)),
    );
  }, []);

  const vaciar = useCallback(() => guardar([]), []);

  const contiene = useCallback(
    (sku: string) => lineas.some((l) => l.sku === sku),
    [lineas],
  );

  const unidades = useMemo(
    () => lineas.reduce((suma, l) => suma + l.cantidad, 0),
    [lineas],
  );

  const valor = useMemo(
    () => ({ lineas, unidades, agregar, quitar, cambiarCantidad, vaciar, contiene, listo }),
    [lineas, unidades, agregar, quitar, cambiarCantidad, vaciar, contiene, listo],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useCarrito(): CarritoContexto {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <ProveedorCarrito>");
  return ctx;
}

/**
 * Cruza el carrito guardado con el catálogo vigente.
 * El precio que manda SIEMPRE es el del catálogo, nunca el guardado.
 */
export function resolverCarrito(
  lineas: LineaCarrito[],
  productos: Producto[],
): { items: LineaResuelta[]; total: number; hayProblemas: boolean } {
  const porSku = new Map(productos.map((p) => [p.sku, p]));
  const items: LineaResuelta[] = lineas.map((l) => {
    const producto = porSku.get(l.sku) ?? null;
    const descatalogado = producto === null;
    const precioCambio =
      producto !== null &&
      l.precioGuardado > 0 &&
      producto.precio_venta !== l.precioGuardado;
    // Un producto agotado NO suma al total. Cobrar por algo que no se puede
    // entregar es el peor error posible en un carrito: el cliente paga, llega
    // a la tienda y no está. El artículo se mantiene visible y marcado para
    // que decida el cliente, pero fuera del total.
    const comprable = producto !== null && producto.disponible;
    return {
      sku: l.sku,
      cantidad: l.cantidad,
      producto,
      descatalogado,
      precioCambio,
      precioAnterior: l.precioGuardado,
      subtotal: comprable ? producto.precio_venta * l.cantidad : 0,
    };
  });
  const total = items.reduce((s, i) => s + i.subtotal, 0);
  const hayProblemas = items.some(
    (i) => i.descatalogado || i.precioCambio || (i.producto && !i.producto.disponible),
  );
  return { items, total, hayProblemas };
}
