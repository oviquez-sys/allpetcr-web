"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * «Agregado al carrito · Ver carrito» (17/11/2026).
 *
 * Con el botón redondo «+» de las tarjetas, la confirmación necesita algo más
 * visible que el cambio de color del propio botón: este aviso aparece abajo,
 * dura 3,5 s y lleva directo al carrito. Lo dispara BotonAgregar con el
 * evento "allpet:agregado". Es también lo que escucha el lector de pantalla.
 */
export default function AvisoAgregado() {
  const [nombre, setNombre] = useState<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ruta = usePathname();

  useEffect(() => {
    const alAgregar = (e: Event) => {
      const n = (e as CustomEvent<{ nombre?: string }>).detail?.nombre;
      setNombre(n ?? "Producto");
      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setNombre(null), 3500);
    };
    window.addEventListener("allpet:agregado", alAgregar);
    return () => {
      window.removeEventListener("allpet:agregado", alAgregar);
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  // En el carrito y la confirmación no hace falta: ya se ve todo ahí.
  const oculto = !nombre || ruta?.startsWith("/carrito") || ruta?.startsWith("/checkout");

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[45] flex justify-center px-4 lg:bottom-8">
      {!oculto && (
        <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-navy-700 py-2 pl-4 pr-2 text-sm text-white shadow-lg shadow-navy-900/25 motion-safe:animate-[aparecer_180ms_ease-out]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-dorado-300" aria-hidden="true"><path d="m20 6-11 11-5-5" /></svg>
          <span className="min-w-0 truncate">
            <span className="sr-only">Agregado al carrito: </span>
            <span aria-hidden="true">Agregado: </span>{nombre}
          </span>
          <Link href="/carrito" className="shrink-0 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-navy-500 hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            Ver carrito
          </Link>
        </div>
      )}
    </div>
  );
}
