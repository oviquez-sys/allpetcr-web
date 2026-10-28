"use client";

import { usePathname } from "next/navigation";
import { urlWhatsApp } from "@/lib/negocio";

/**
 * WhatsApp siempre a mano en el celular (28/10/2026, pedido de Oscar).
 *
 * En el celular WhatsApp solo estaba dentro del menú, y es el canal donde
 * se cierra la venta. Un botón fijo abajo a la derecha, solo en pantallas
 * chicas (en escritorio el enlace ya está en la barra superior).
 *
 * No aparece donde estorbaría o sobraría:
 *  - /producto/*: ahí está la barra de compra fija abajo, que ya trae su
 *    propio «Consultar por WhatsApp»;
 *  - /carrito y /checkout: el pedido mismo termina en WhatsApp.
 *
 * Verde de estado (emerald-700) y la palabra «WhatsApp», sin el logo de la
 * marca: se reconoce igual y respeta la paleta del sitio. emerald-700 con
 * texto blanco da 5.5:1 (WCAG AA); el 600 no alcanza para texto.
 */
const RUTAS_SIN_BOTON = [/^\/producto\//, /^\/carrito/, /^\/checkout/];

export default function BotonWhatsAppFlotante() {
  const ruta = usePathname() ?? "";
  const href = urlWhatsApp("Hola, les escribo desde allpetcr.com");
  if (!href || RUTAS_SIN_BOTON.some((r) => r.test(ruta))) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-emerald-700 pl-4 pr-5 text-sm font-medium text-white shadow-lg shadow-navy-900/20 transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 lg:hidden"
    >
      {/* Globo de conversación genérico (no el logo de WhatsApp). */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.6-4.6A8.4 8.4 0 1 1 21 11.5Z" />
      </svg>
      WhatsApp
    </a>
  );
}
