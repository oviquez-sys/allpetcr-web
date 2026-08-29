"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useCarrito, resolverCarrito } from "@/lib/carrito";
import { formatoColones, presentacionVisible, tinteDeSku } from "@/lib/formato";
import {
  useRecompra,
  vigente,
  diasDesde,
  programarRecordatorio,
  descartarRecordatorio,
  olvidarPedido,
  DIAS_SUGERIDOS,
} from "@/lib/recompra";
import type { Producto } from "@/lib/types";

/**
 * "Repetir pedido".
 *
 * Muestra el último pedido preparado en ESTE navegador, resuelto otra vez
 * contra el catálogo vigente. Se reutiliza `resolverCarrito` a propósito: la
 * regla de que el precio guardado nunca manda ya está escrita ahí y no debe
 * existir una segunda copia que se pueda desincronizar.
 *
 * Lo que NO hace: no rearma el carrito solo. Agregar productos al carrito de
 * alguien sin que lo pida es el tipo de "ayuda" que termina en un pedido que
 * el cliente no revisó.
 */
export default function RecompraCliente({ productos }: { productos: Producto[] }) {
  const { estado, listo, ahora } = useRecompra();
  const { agregar } = useCarrito();
  const [agregados, setAgregados] = useState<number | null>(null);

  const disponible = listo && vigente(estado, ahora);

  const { items } = useMemo(
    () => resolverCarrito(disponible && estado ? estado.lineas : [], productos),
    [disponible, estado, productos],
  );

  const comprables = items.filter((i) => i.producto && i.producto.disponible);
  const total = comprables.reduce((s, i) => s + i.subtotal, 0);
  const hayProblemas = items.some(
    (i) => i.descatalogado || i.precioCambio || (i.producto && !i.producto.disponible),
  );

  function repetirTodo() {
    for (const i of comprables) agregar(i.producto!, i.cantidad);
    setAgregados(comprables.reduce((s, i) => s + i.cantidad, 0));
  }

  // Mientras se lee el navegador no se sabe si hay algo guardado. Mostrar
  // "no hay nada" y corregirlo un instante después es peor que un espacio.
  if (!listo) {
    return (
      <div className="mx-auto max-w-contenido px-6 py-20">
        <div className="h-8 w-56 animate-pulse rounded bg-crema-300" />
        <div className="mt-8 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-card bg-crema-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!disponible || items.length === 0) {
    return (
      <div className="mx-auto max-w-contenido px-6 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-crema-300">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
              className="text-navy-300" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </div>
          <h1 className="mt-7 font-display text-headline text-navy-500">
            Todavía no hay un pedido guardado
          </h1>
          <p className="mt-3 text-[15px] font-light leading-relaxed text-navy-400">
            Cuando confirmés un pedido desde este navegador, lo vas a encontrar
            acá para repetirlo en un toque. No guardamos nada en un servidor ni
            hace falta crear una cuenta.
          </p>
          <Link
            href="/catalogo"
            className="mt-8 inline-block rounded-full bg-navy-500 px-8 py-3.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  const dias = diasDesde(estado!.hecho, ahora);

  return (
    <div className="mx-auto max-w-contenido px-6 py-12">
      <h1 className="font-display text-headline text-navy-500">Repetir pedido</h1>
      <p className="mt-2 text-sm font-light text-navy-400">
        Tu último pedido, de hace {dias} {dias === 1 ? "día" : "días"}. Los precios
        y las existencias son los de hoy, no los de ese momento.
      </p>

      {hayProblemas && (
        <div
          role="status"
          className="mt-6 rounded-card border border-dorado-300 bg-dorado-50 px-5 py-4 text-sm text-dorado-900"
        >
          <p className="font-medium">Algo cambió desde tu último pedido</p>
          <p className="mt-1 font-light leading-relaxed">
            Lo marcamos abajo producto por producto. Preferimos que lo veas vos
            antes de repetir el pedido y no ajustarlo en silencio.
          </p>
        </div>
      )}

      {agregados !== null && (
        <div
          role="status"
          className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card border border-crema-400 bg-white px-5 py-4 text-sm text-navy-500"
        >
          <p className="font-light">
            Se agregaron {agregados} {agregados === 1 ? "unidad" : "unidades"} a tu
            carrito, sumadas a lo que ya tenías.
          </p>
          <Link
            href="/carrito"
            className="ml-auto rounded-full bg-navy-500 px-5 py-2.5 text-xs font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
          >
            Revisar carrito
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-4">
          {items.map((item) => {
            const p = item.producto;
            const nombre = p?.nombre ?? item.sku;
            const agotado = p !== null && !p.disponible;
            return (
              <li
                key={item.sku}
                className={`rounded-card border bg-white p-4 sm:p-5 ${
                  item.descatalogado || agotado
                    ? "border-crema-500 bg-crema-200/50"
                    : "border-crema-400"
                }`}
              >
                <div className="flex gap-4 sm:gap-5">
                  <div
                    className={`relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg sm:h-24 sm:w-24 ${
                      p?.imagen ? "bg-white" : tinteDeSku(item.sku)
                    }`}
                    aria-hidden="true"
                  >
                    {p?.imagen ? (
                      <Image src={p.imagen} alt="" fill sizes="96px" className="object-contain p-1.5" />
                    ) : (
                      <span className="px-1 text-center text-[9px] uppercase tracking-wider text-navy-400">
                        Foto pendiente
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {p ? (
                      <Link
                        href={`/producto/${encodeURIComponent(p.sku)}`}
                        className="rounded text-[15px] font-medium leading-snug text-navy-500 hover:text-dorado-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                      >
                        {nombre}
                      </Link>
                    ) : (
                      <span className="text-[15px] font-medium text-navy-400">{nombre}</span>
                    )}
                    {presentacionVisible(p?.presentacion) && (
                      <p className="mt-0.5 text-xs text-navy-400">
                        {presentacionVisible(p?.presentacion)}
                      </p>
                    )}

                    {item.descatalogado && (
                      <p className="mt-2 text-xs font-medium text-dorado-800">
                        Ya no está en el catálogo. Escribinos y te decimos con qué
                        reemplazarlo.
                      </p>
                    )}
                    {agotado && (
                      <p className="mt-2 text-xs font-medium text-dorado-800">
                        Sin existencias por el momento. No se agrega al carrito.
                      </p>
                    )}
                    {item.precioCambio && p && (
                      <p className="mt-2 text-xs font-medium text-dorado-800">
                        El precio cambió: antes {formatoColones(item.precioAnterior)}, ahora{" "}
                        {formatoColones(p.precio_venta)}.
                      </p>
                    )}

                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm font-light text-navy-400">
                        Pediste {item.cantidad}{" "}
                        {item.cantidad === 1 ? "unidad" : "unidades"}
                      </span>
                      {p && !agotado && (
                        <div className="text-right">
                          <p className="text-[15px] font-medium text-navy-500">
                            {formatoColones(item.subtotal)}
                          </p>
                          {item.cantidad > 1 && (
                            <p className="text-[11px] text-navy-400">
                              {formatoColones(p.precio_venta)} c/u
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {p && !agotado && (
                      <button
                        type="button"
                        onClick={() => {
                          agregar(p, item.cantidad);
                          setAgregados(item.cantidad);
                        }}
                        className="mt-3 rounded text-xs text-navy-400 underline underline-offset-2 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                      >
                        Agregar solo este
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-card border border-crema-400 bg-white p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-navy-400">
              Repetir
            </h2>
            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-navy-400">Productos disponibles</dt>
                <dd className="text-navy-500">{comprables.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy-400">Total a precios de hoy</dt>
                <dd className="text-price text-navy-500">{formatoColones(total)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={repetirTodo}
              disabled={comprables.length === 0}
              className="mt-6 w-full rounded-full bg-navy-500 px-6 py-3.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-crema-500 disabled:text-navy-300"
            >
              Agregar todo al carrito
            </button>
            <p className="mt-3 text-[12px] font-light leading-relaxed text-navy-400">
              Se suma a lo que ya tengas en el carrito. Podés revisarlo y
              ajustarlo antes de enviar el pedido.
            </p>
          </div>

          <div className="mt-5 rounded-card border border-crema-400 bg-crema-200 p-6">
            <h2 className="text-sm font-medium text-navy-500">Recordatorio</h2>
            <p className="mt-1.5 text-xs font-light leading-relaxed text-navy-400">
              Solo aparece cuando volvés a este navegador. No enviamos
              notificaciones ni compartimos tus datos.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {DIAS_SUGERIDOS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => programarRecordatorio(d)}
                  aria-pressed={estado!.dias === d}
                  className={`rounded-full border px-4 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${
                    estado!.dias === d
                      ? "border-navy-500 bg-navy-500 text-crema-100"
                      : "border-crema-400 text-navy-400 hover:border-navy-300 hover:text-navy-500"
                  }`}
                >
                  {d} días
                </button>
              ))}
            </div>
            {estado!.dias !== null && (
              <button
                type="button"
                onClick={descartarRecordatorio}
                className="mt-4 rounded text-xs text-navy-400 underline underline-offset-2 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
              >
                Quitar el recordatorio
              </button>
            )}
            <button
              type="button"
              onClick={olvidarPedido}
              className="mt-4 block rounded text-xs text-navy-400 underline underline-offset-2 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
            >
              Olvidar este pedido
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
