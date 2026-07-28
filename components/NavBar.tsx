"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCarrito } from "@/lib/carrito";

// Solo las categorías raíz. Alimento y Snacks viven como subcategorías
// dentro de Perros/Gatos (ver data/categorias.json) y aparecen al entrar,
// no como items separados en este menú.
const categorias = [
  { href: "/catalogo?c=perros", label: "Perros" },
  { href: "/catalogo?c=gatos", label: "Gatos" },
  { href: "/catalogo?c=higiene", label: "Higiene" },
  { href: "/catalogo?c=accesorios", label: "Accesorios" },
];

function IconoBuscar({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export default function NavBar() {
  const { unidades, listo } = useCarrito();
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  const botonMenu = useRef<HTMLButtonElement>(null);

  // Cerrar el menú al navegar: sin esto queda abierto sobre la página nueva.
  // Se ajusta durante el render comparando la ruta anterior, en vez de en un
  // efecto: así no hay un fotograma con el menú abierto sobre la página nueva.
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (ruta !== rutaPrevia) {
    setRutaPrevia(ruta);
    if (abierto) setAbierto(false);
  }

  // Escape cierra el menú y devuelve el foco al botón (WCAG 2.1.2).
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        botonMenu.current?.focus();
      }
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  return (
    <>
      <div className="bg-navy-500 px-6 py-2 text-center text-xs text-crema-200">
        Retiro en tienda sin costo · Asesoría honesta para tu mascota
      </div>

      <header className="sticky top-0 z-50 border-b border-crema-400 bg-crema-100/95 backdrop-blur">
        <div className="mx-auto max-w-contenido px-6">
          <div className="flex items-center gap-4 py-4 sm:gap-7 sm:py-5">
            {/* Botón de menú: solo en móvil. 44×44 px, mínimo táctil (WCAG 2.5.8). */}
            <button
              ref={botonMenu}
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-expanded={abierto}
              aria-controls="menu-movil"
              aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              className="-ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy-500 transition-colors hover:bg-crema-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 lg:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                {abierto ? (
                  <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>
                ) : (
                  <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>
                )}
              </svg>
            </button>

            <Link
              href="/"
              className="shrink-0 whitespace-nowrap rounded font-display text-2xl text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
            >
              All<span className="text-dorado-500">Pet</span>
            </Link>

            <form
              action="/catalogo"
              role="search"
              className="hidden flex-1 items-center gap-3 rounded-full border border-crema-400 bg-crema-200 px-5 py-2.5 transition-colors focus-within:border-navy-300 sm:flex"
            >
              <IconoBuscar className="shrink-0 text-navy-300" />
              <input
                type="search"
                name="q"
                placeholder="Buscar alimento, juguetes, arena…"
                aria-label="Buscar productos"
                className="w-full bg-transparent text-sm text-navy-500 outline-none placeholder:text-navy-300"
              />
            </form>

            <nav aria-label="Principal" className="ml-auto hidden items-center gap-6 whitespace-nowrap text-sm text-navy-400 lg:flex">
              {categorias.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="rounded transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
                >
                  {c.label}
                </Link>
              ))}
              <Link
                href="/contacto"
                className="rounded transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
              >
                Contacto
              </Link>
            </nav>

            <Link
              href="/carrito"
              className="relative ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy-500 transition-colors hover:bg-crema-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 lg:ml-0"
              aria-label={
                listo && unidades > 0
                  ? `Carrito, ${unidades} ${unidades === 1 ? "artículo" : "artículos"}`
                  : "Carrito, vacío"
              }
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {/* Solo tras hidratar: evita que el servidor pinte un número y
                  el cliente lo cambie de golpe (desajuste de hidratación). */}
              {listo && unidades > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-dorado-500 px-1 text-[10.5px] font-semibold text-white">
                  {unidades > 99 ? "99+" : unidades}
                </span>
              )}
            </Link>
          </div>

          {/* Buscador en móvil: fuera de la fila, con ancho completo */}
          <form
            action="/catalogo"
            role="search"
            className="mb-4 flex items-center gap-3 rounded-full border border-crema-400 bg-crema-200 px-5 py-2.5 focus-within:border-navy-300 sm:hidden"
          >
            <IconoBuscar className="shrink-0 text-navy-300" />
            <input
              type="search"
              name="q"
              placeholder="Buscar productos…"
              aria-label="Buscar productos"
              className="w-full bg-transparent text-sm text-navy-500 outline-none placeholder:text-navy-300"
            />
          </form>
        </div>

        {abierto && (
          <nav
            id="menu-movil"
            aria-label="Categorías"
            className="border-t border-crema-400 bg-crema-100 lg:hidden"
          >
            <ul className="mx-auto max-w-contenido px-6 py-2">
              {[
                ...categorias,
                { href: "/catalogo", label: "Todo el catálogo" },
                { href: "/contacto", label: "Contacto" },
              ].map((c) => (
                <li key={c.href + c.label}>
                  <Link
                    href={c.href}
                    className="block rounded-lg px-2 py-3.5 text-[15px] text-navy-500 transition-colors hover:bg-crema-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
