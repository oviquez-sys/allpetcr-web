"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useCarrito, resolverCarrito } from "@/lib/carrito";
import { formatoColones, presentacionVisible, tinteDeSku } from "@/lib/formato";
import type { Producto } from "@/lib/types";

function Cantidad({
  valor, onCambio, nombre,
}: { valor: number; onCambio: (n: number) => void; nombre: string }) {
  const [borrador, setBorrador] = useState(String(valor));
  const [previo, setPrevio] = useState(valor);
  if (previo !== valor) { setPrevio(valor); setBorrador(String(valor)); }
  return (
    <div className="inline-flex items-center rounded-full border border-crema-400 bg-white">
      <button
        type="button"
        onClick={() => onCambio(valor - 1)}
        disabled={valor <= 1}
        aria-label={`Quitar una unidad de ${nombre}`}
        className="grid h-10 w-10 place-items-center rounded-full text-navy-400 transition-colors hover:bg-crema-200 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
      </button>
      <input
        type="number"
        min={1}
        max={99}
        value={borrador}
        onChange={(e) => setBorrador(e.target.value)}
        onBlur={() => {
          const numero = Number(borrador);
          if (Number.isInteger(numero) && numero >= 1 && numero <= 99) onCambio(numero);
          else setBorrador(String(valor));
        }}
        aria-label={`Cantidad de ${nombre}`}
        className="w-11 border-0 bg-transparent text-center text-sm font-medium text-navy-500 outline-none [appearance:textfield] focus-visible:ring-2 focus-visible:ring-navy-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onCambio(valor + 1)}
        disabled={valor >= 99}
        aria-label={`Agregar una unidad de ${nombre}`}
        className="grid h-10 w-10 place-items-center rounded-full text-navy-400 transition-colors hover:bg-crema-200 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>
  );
}

export default function CarritoCliente({ productos }: { productos: Producto[] }) {
  const { lineas, cambiarCantidad, quitar, vaciar, listo } = useCarrito();
  const { items, total, hayProblemas } = useMemo(
    () => resolverCarrito(lineas, productos),
    [lineas, productos],
  );

  // Mientras se lee localStorage no se sabe si el carrito tiene algo. Mostrar
  // "vacío" y luego cambiarlo es peor que mostrar un espacio neutro un instante.
  if (!listo) {
    return (
      <div className="mx-auto max-w-contenido px-6 py-20">
        <div className="h-8 w-40 animate-pulse rounded bg-crema-300" />
        <div className="mt-8 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-card bg-crema-200" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-contenido px-6 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-crema-300">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
              className="text-navy-300" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h1 className="mt-7 font-display text-headline text-navy-500">
            Tu carrito está vacío
          </h1>
          <p className="mt-3 text-[15px] font-light leading-relaxed text-navy-400">
            Buscá lo que necesita tu mascota y agregalo desde el catálogo.
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

  const comprables = items.filter((i) => i.producto && i.producto.disponible);
  const puedeSeguir = comprables.length > 0;

  return (
    <div className="mx-auto max-w-contenido px-6 py-12">
      <h1 className="font-display text-headline text-navy-500">Tu carrito</h1>
      <p className="mt-2 text-sm text-navy-400">
        {items.length} {items.length === 1 ? "producto" : "productos"}
      </p>

      {hayProblemas && (
        <div
          role="status"
          className="mt-6 rounded-card border border-dorado-300 bg-dorado-50 px-5 py-4 text-sm text-dorado-900"
        >
          <p className="font-medium">Revisá tu pedido antes de continuar</p>
          <p className="mt-1 font-light leading-relaxed">
            Algunos productos cambiaron desde que los agregaste. Los marcamos
            abajo para que decidas vos, en vez de ajustarlo en silencio.
          </p>
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
                  item.descatalogado || agotado ? "border-crema-500 bg-crema-200/50" : "border-crema-400"
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
                      <Image
                        src={p.imagen}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-contain p-1.5"
                      />
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
                        Ya no está en el catálogo. Quitalo para continuar.
                      </p>
                    )}
                    {agotado && (
                      <p className="mt-2 text-xs font-medium text-dorado-800">
                        Sin existencias por el momento. No se incluye en el total.
                      </p>
                    )}
                    {item.precioCambio && p && (
                      <p className="mt-2 text-xs font-medium text-dorado-800">
                        El precio cambió: antes {formatoColones(item.precioAnterior)}, ahora{" "}
                        {formatoColones(p.precio_venta)}.
                      </p>
                    )}

                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                      {item.descatalogado ? (
                        <span className="text-sm text-navy-400">—</span>
                      ) : (
                        <Cantidad
                          valor={item.cantidad}
                          nombre={nombre}
                          onCambio={(n) => cambiarCantidad(item.sku, n)}
                        />
                      )}
                      <div className="text-right">
                        {p && !agotado && (
                          <>
                            <p className="text-[15px] font-medium text-navy-500">
                              {formatoColones(item.subtotal)}
                            </p>
                            {item.cantidad > 1 && (
                              <p className="text-[11px] text-navy-400">
                                {formatoColones(p.precio_venta)} c/u
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => quitar(item.sku)}
                      className="mt-3 rounded text-xs text-navy-400 underline underline-offset-2 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-card border border-crema-400 bg-white p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-navy-400">
              Resumen
            </h2>
            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-navy-400">Productos</dt>
                <dd className="text-navy-500">{formatoColones(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy-400">Retiro en tienda</dt>
                <dd className="text-dorado-700">Sin costo</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-crema-400 pt-5">
              <span className="text-sm font-medium text-navy-500">Total</span>
              <span aria-live="polite" className="text-[26px] font-medium text-navy-500">
                {formatoColones(total)}
              </span>
            </div>

            <p className="mt-4 text-[11.5px] font-light leading-relaxed text-navy-400">
              Los precios incluyen impuestos. El pedido se confirma por
              WhatsApp: no se cobra nada en línea.
            </p>

            {puedeSeguir ? (
              <Link
                href="/checkout"
                className="mt-5 block rounded-full bg-navy-500 py-3.5 text-center text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
              >
                Continuar con el pedido
              </Link>
            ) : (
              <p className="mt-5 rounded-full bg-crema-300 py-3.5 text-center text-sm text-navy-400">
                No hay productos disponibles
              </p>
            )}

            <Link
              href="/catalogo"
              className="mt-3 block rounded-full border border-crema-400 py-3 text-center text-sm text-navy-400 transition-colors hover:border-navy-300 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
            >
              Seguir comprando
            </Link>

            <button
              type="button"
              onClick={() => {
                // Acción destructiva de un clic: antes borraba el pedido
                // armado sin red de seguridad. confirm() nativo es
                // suficiente acá — no amerita un diálogo custom para una
                // sola acción de baja frecuencia.
                if (window.confirm("¿Vaciar el carrito? Se quitan todos los productos agregados.")) {
                  vaciar();
                }
              }}
              className="mt-4 w-full rounded text-xs text-navy-400 underline underline-offset-2 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
            >
              Vaciar carrito
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
