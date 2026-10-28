"use client";

import { useEffect, useState } from "react";
import BotonAgregar from "@/components/BotonAgregar";
import { formatoColones } from "@/lib/formato";
import type { Producto } from "@/lib/types";

interface Props {
  producto: Producto;
  /** id del bloque de botones de la ficha: la barra se esconde mientras se ve. */
  idAcciones: string;
  /** Producto con consulta previa: en vez de comprar, abre WhatsApp. */
  consulta?: { href: string; texto: string } | null;
}

/**
 * Barra de compra fija abajo, solo en celular (27/10/2026).
 *
 * En el celular la foto ocupa la primera pantalla de la ficha y el botón
 * «Agregar al carrito» queda fuera de la vista: quien no baja, no lo
 * encuentra. La barra muestra el precio y el mismo botón de siempre (mismo
 * carrito, misma confirmación), y se esconde sola mientras los botones de la
 * ficha están a la vista, para no repetirlos uno encima del otro.
 *
 * No aparece en escritorio (ahí el botón ya se ve junto a la foto) ni en un
 * producto agotado (su acción es «Avisarme», que pide un correo y vive en la
 * ficha).
 */
export default function BarraCompraMovil({ producto, idAcciones, consulta }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const acciones = document.getElementById(idAcciones);
    if (!acciones || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        // Visible solo cuando los botones de la ficha NO se ven y el
        // cliente ya pasó la foto o todavía no llegó a ellos.
        setVisible(!entrada.isIntersecting);
      },
      { threshold: 0 },
    );
    observador.observe(acciones);
    return () => observador.disconnect();
  }, [idAcciones]);

  if (!producto.disponible) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-crema-300 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-200 ease-out motion-reduce:transition-none lg:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="mx-auto flex max-w-contenido items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-navy-400">{producto.nombre}</p>
          <p className="text-lg font-medium leading-tight text-navy-500">{formatoColones(producto.precio_venta)}</p>
        </div>
        <div className="w-[52%] max-w-[220px] shrink-0">
          {consulta ? (
            <a
              href={consulta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center rounded-full bg-navy-500 px-3 text-center text-[13px] font-medium leading-tight text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
            >
              {consulta.texto}
            </a>
          ) : (
            <BotonAgregar producto={producto} tamano="chico" />
          )}
        </div>
      </div>
    </div>
  );
}
