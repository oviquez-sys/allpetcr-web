"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCarrito } from "@/lib/carrito";
import { TEXTO_CONSULTA } from "@/lib/publicacion";
import type { Producto } from "@/lib/types";

interface Props {
  producto: Producto;
  /** "grande" en la ficha de producto, "chico" en la barra fija del
   *  celular, "icono" en las tarjetas (17/11/2026): botón redondo «+» al lado
   *  del precio. */
  tamano?: "grande" | "chico" | "icono";
  className?: string;
  /** Solo para el tamaño "chico". "contorno" (por defecto, 28/10/2026): en
   *  la grilla del catálogo 24 botones sólidos competían con las fotos; de
   *  contorno, el producto se ve primero y el botón se llena al pasar el
   *  mouse. "solido": donde el botón ES lo principal (barra de compra fija
   *  del celular). */
  variante?: "contorno" | "solido";
}

/**
 * Agrega al carrito con confirmación visual.
 *
 * La confirmación importa más de lo que parece: sin una señal clara de que el
 * producto entró, el cliente pulsa dos y tres veces y termina con cantidades
 * que no quería. El cambio de estado a "Agregado ✓" durante dos segundos es
 * la señal, y el aria-live la comunica a quien usa lector de pantalla.
 */
export default function BotonAgregar({ producto, tamano = "grande", className = "", variante = "contorno" }: Props) {
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
    // Aviso «Agregado · Ver carrito» abajo de la pantalla (AvisoAgregado.tsx).
    // En la tarjeta el botón es chico y el cambio de color solo no alcanza.
    window.dispatchEvent(new CustomEvent("allpet:agregado", { detail: { nombre: producto.nombre } }));
    setConfirmado(true);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setConfirmado(false), 2000);
  };

  const agotado = !producto.disponible;
  const idAyuda = `disp-${producto.sku}`;

  // Se vende con consulta previa (lib/publicacion.ts). En la tarjeta lleva a
  // la ficha, que explica por qué y abre WhatsApp; la ficha grande no usa
  // este botón para esos productos.
  if (producto.solo_consulta && !agotado) {
    if (tamano === "icono") {
      return (
        <Link
          href={`/producto/${encodeURIComponent(producto.sku)}`}
          aria-label={`${TEXTO_CONSULTA[producto.solo_consulta].botonCorto}: ${producto.nombre}`}
          className={`${CLASE_ICONO} bg-white text-navy-500 ring-1 ring-inset ring-navy-500 hover:bg-navy-500 hover:text-crema-100 ${className}`}
        >
          <IconoChat />
        </Link>
      );
    }
    if (tamano !== "chico") return null;
    return (
      <Link
        href={`/producto/${encodeURIComponent(producto.sku)}`}
        className={`flex h-11 w-full items-center justify-center rounded-full border border-navy-500 text-[13px] font-medium text-navy-500 transition-colors duration-150 ease-out hover:bg-navy-500 hover:text-crema-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${className}`}
      >
        {TEXTO_CONSULTA[producto.solo_consulta].botonCorto}
      </Link>
    );
  }

  if (tamano === "icono") {
    // Agotado: la tarjeta ya lo dice sobre la foto; un botón apagado al lado
    // del precio solo ocupa lugar.
    if (agotado) return null;
    return (
      <button
        type="button"
        onClick={alPulsar}
        aria-label={confirmado ? `${producto.nombre} agregado al carrito` : `Agregar ${producto.nombre} al carrito`}
        className={`${CLASE_ICONO} ${confirmado ? "bg-dorado-500 text-navy-700" : "bg-navy-500 text-white hover:bg-navy-600"} ${className}`}
      >
        {confirmado ? <IconoCheck /> : <IconoMas />}
      </button>
    );
  }

  if (tamano === "chico") {
    return (
      <>
        <button
          type="button"
          onClick={alPulsar}
          disabled={agotado}
          aria-describedby={agotado ? idAyuda : undefined}
          // `transition-colors`, no `transition-all`: lo único que cambia acá
          // es el color de fondo y el texto. `transition-all` obliga al
          // navegador a vigilar todas las propiedades animables —incluidas las
          // de diseño— y en la grilla del catálogo eso son 184 botones.
          className={`h-11 w-full rounded-full text-[13px] font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
            agotado
              ? "cursor-not-allowed bg-crema-300 text-navy-300"
              : confirmado
                ? "bg-dorado-500 text-navy-500"
                : variante === "solido"
                  ? "bg-navy-500 text-crema-100 hover:bg-navy-600"
                  : "border border-navy-500 bg-white text-navy-500 hover:bg-navy-500 hover:text-crema-100"
          } ${className}`}
        >
          {agotado ? "Sin existencias" : confirmado ? "Agregado al carrito ✓" : "Agregar al carrito"}
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
        className={`rounded-full px-8 py-3.5 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
          agotado
            ? "cursor-not-allowed bg-crema-300 text-navy-300"
            : confirmado
              ? "bg-dorado-500 text-navy-500"
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

/** 44 × 44: el mínimo cómodo para el pulgar. Píldora (círculo): se presiona. */
const CLASE_ICONO =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-150 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 motion-reduce:transition-none";

function IconoMas() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function IconoChat() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.6-4.6A8.4 8.4 0 1 1 21 11.5Z" />
    </svg>
  );
}
