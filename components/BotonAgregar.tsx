"use client";

import { useEffect, useRef, useState } from "react";
import { useCarrito } from "@/lib/carrito";
import type { Producto } from "@/lib/types";

interface Props {
  producto: Producto;
  /** "grande" en la ficha de producto, "chico" en las tarjetas del catálogo. */
  tamano?: "grande" | "chico";
  className?: string;
}

/**
 * Agrega al carrito con confirmación visual.
 *
 * La confirmación importa más de lo que parece: sin una señal clara de que el
 * producto entró, el cliente pulsa dos y tres veces y termina con cantidades
 * que no quería. El cambio de estado a "Agregado ✓" durante dos segundos es
 * la señal, y el aria-live la comunica a quien usa lector de pantalla.
 */
export default function BotonAgregar({ producto, tamano = "grande", className = "" }: Props) {
  const { agregar } = useCarrito();
  const [confirmado, setConfirmado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  const alPulsar = () => {
    agregar(producto, 1);
    setConfirmado(true);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setConfirmado(false), 2000);
  };

  const agotado = !producto.disponible;
  const idAyuda = `disp-${producto.sku}`;

  if (tamano === "chico") {
    return (
      <>
        <button
          type="button"
          onClick={alPulsar}
          disabled={agotado}
          aria-describedby={agotado ? idAyuda : undefined}
          className={`h-11 w-full rounded-full text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 ${
            agotado
              ? "cursor-not-allowed bg-crema-300 text-navy-300"
              : confirmado
                ? "bg-dorado-500 text-white"
                : "bg-navy-500 text-crema-100 hover:bg-navy-600"
          } ${className}`}
        >
          {agotado ? "Sin existencias" : confirmado ? "Agregado ✓" : "Agregar"}
        </button>
        {agotado && (
          <span id={idAyuda} className="sr-only">
            Este producto no está disponible por el momento
          </span>
        )}
        <span aria-live="polite" className="sr-only">
          {confirmado ? `${producto.nombre} agregado al carrito` : ""}
        </span>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={alPulsar}
        disabled={agotado}
        aria-describedby={agotado ? idAyuda : undefined}
        className={`rounded-full px-8 py-3.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 ${
          agotado
            ? "cursor-not-allowed bg-crema-300 text-navy-300"
            : confirmado
              ? "bg-dorado-500 text-white"
              : "bg-navy-500 text-crema-100 hover:bg-navy-600"
        } ${className}`}
      >
        {agotado ? "Sin existencias" : confirmado ? "Agregado al carrito ✓" : "Agregar al carrito"}
      </button>
      {agotado && (
        <span id={idAyuda} className="sr-only">
          Este producto no está disponible por el momento. Podés consultarnos
          por WhatsApp para saber cuándo vuelve.
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {confirmado ? `${producto.nombre} agregado al carrito` : ""}
      </span>
    </>
  );
}
