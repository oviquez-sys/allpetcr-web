"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCarrito } from "@/lib/carrito";
import Marca from "./Marca";
import IconoCategoria from "./IconoCategoria";
import type { SeccionNav } from "@/lib/navegacion";

/**
 * ENCABEZADO
 *
 * Las decisiones de aquí salen de mirar cómo resuelven el problema las
 * tiendas grandes —Chewy en particular— pero ajustadas a un catálogo de 184
 * productos, no de cien mil. Copiar a Chewy sin ajustar la escala sería un
 * error: buena parte de sus decisiones existen porque su catálogo es
 * inabarcable, y este no lo es.
 *
 * ── POR QUÉ EL BUSCADOR OCUPA EL CENTRO Y ES GRANDE
 * Quien escribe en el buscador ya sabe qué quiere: es el tráfico con más
 * intención de compra del sitio y el que menos pasos necesita para llegar al
 * carrito. Chewy le da el espacio dominante del encabezado por eso, y aquí
 * aplica igual: escribir "arena" es más rápido que navegar dos niveles.
 *
 * ── POR QUÉ UN MEGA MENÚ Y NO UN DESPLEGABLE SIMPLE
 * Un menú de un nivel obliga a hacer clic para descubrir qué hay dentro. El
 * mega menú enseña la profundidad del catálogo sin navegar, y eso baja el
 * costo de exploración. Solo lo llevan las secciones que agrupan varias
 * categorías reales; poner una flecha en una sección sin hijos sería mentir
 * sobre lo que hay detrás.
 *
 * ── POR QUÉ NO HAY LIBRERÍA DE MENÚ
 * Esto son dos estados de React y CSS. Radix o Headless UI serían ~15 KB
 * comprimidos en la ruta crítica para resolver algo que el navegador ya sabe
 * hacer. El encabezado se pinta en todas las páginas: es el peor sitio para
 * agregar peso.
 *
 * ── POR QUÉ LA BARRA SUPERIOR DICE LO QUE DICE
 * El costo de envío es la primera objeción del comercio electrónico
 * costarricense. Enunciar "retiro en tienda sin costo" antes de que el
 * visitante vea un solo precio desactiva la fricción por adelantado. Misma
 * lógica del "Free shipping over $49" de Chewy, con una promesa que este
 * negocio sí puede cumplir.
 */

function IconoBuscar({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export default function NavBar({ navegacion }: { navegacion: SeccionNav[] }) {
  const { unidades, listo } = useCarrito();
  const [abierto, setAbierto] = useState(false);
  const [megaAbierto, setMegaAbierto] = useState<string | null>(null);
  const ruta = usePathname();
  const botonMenu = useRef<HTMLButtonElement>(null);
  const cierreDiferido = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cerrar al navegar. Se ajusta durante el render comparando la ruta previa
  // en vez de en un efecto: así no hay un fotograma con el menú abierto
  // encima de la página nueva.
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (ruta !== rutaPrevia) {
    setRutaPrevia(ruta);
    if (abierto) setAbierto(false);
    if (megaAbierto) setMegaAbierto(null);
  }

  // Escape cierra lo que esté abierto y devuelve el foco (WCAG 2.1.2).
  useEffect(() => {
    if (!abierto && !megaAbierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (megaAbierto) {
        document.getElementById(`menu-boton-${megaAbierto}`)?.focus();
        setMegaAbierto(null);
      }
      if (abierto) {
        setAbierto(false);
        botonMenu.current?.focus();
      }
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierto, megaAbierto]);

  useEffect(() => {
    return () => {
      if (cierreDiferido.current) clearTimeout(cierreDiferido.current);
    };
  }, []);

  // Un retardo corto al salir evita que el panel se cierre cuando el cursor
  // cruza el hueco entre el botón y el panel. Sin esto el menú parpadea, que
  // es el defecto clásico de los mega menús mal hechos.
  const abrirMega = (id: string) => {
    if (cierreDiferido.current) clearTimeout(cierreDiferido.current);
    setMegaAbierto(id);
  };
  const cerrarMega = () => {
    if (cierreDiferido.current) clearTimeout(cierreDiferido.current);
    cierreDiferido.current = setTimeout(() => setMegaAbierto(null), 140);
  };

  const buscador = (id: string) => (
    <form
      action="/catalogo"
      role="search"
      className="flex items-center gap-3 rounded-full border border-crema-400 bg-white py-1.5 pl-5 pr-1.5 transition-shadow focus-within:border-navy-300 focus-within:shadow-[0_0_0_3px_rgba(9,46,94,0.08)]"
    >
      <IconoBuscar className="shrink-0 text-navy-300" />
      <label htmlFor={id} className="sr-only">
        Buscar productos
      </label>
      <input
        id={id}
        type="search"
        name="q"
        placeholder="Buscar juguetes, collares, shampoo…"
        className="w-full rounded bg-transparent text-sm text-navy-500 placeholder:text-navy-400 focus-visible:ring-2 focus-visible:ring-navy-500"
      />
      <button
        type="submit"
        // h-11 (44px): antes medía 28px de alto, bajo el mínimo táctil.
        className="grid h-11 shrink-0 place-items-center rounded-full bg-navy-500 px-4 text-xs font-medium text-white transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
      >
        Buscar
      </button>
    </form>
  );

  return (
    <>
      {/* Barra de promesa + franja dorada: es exactamente el remate del
          rótulo de la fachada —masa navy con una línea fina de dorado
          debajo—. Ahí el dorado funciona como texto (5.07:1 sobre navy);
          sobre crema no llegaría, y por eso solo aparece en superficie
          oscura. */}
      <p className="bg-navy-500 px-6 py-2 text-center text-xs font-light text-crema-200">
        Retiro en tienda sin costo · Asesoría honesta para tu mascota
      </p>
      <div className="franja-dorada" aria-hidden="true" />

      <header className="sticky top-0 z-50 border-b border-crema-400 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-contenido px-6">
          {/* Fila 1: menú móvil · logo · buscador · carrito */}
          <div className="flex items-center gap-4 py-3.5 sm:gap-7">
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

            {/* El logo real, en línea en el HTML: cero peticiones de red y
                cero salto de diseño en la ruta crítica. */}
            <Link
              href="/"
              aria-label="AllPetcr.com — ir al inicio"
              className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
            >
              <Marca variante="horizontal" decorativo className="h-6 w-auto sm:h-7" />
            </Link>

            <div className="hidden flex-1 sm:block">{buscador("buscar-esc")}</div>

            <Link
              href="/carrito"
              className="relative ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy-500 transition-colors hover:bg-crema-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 sm:ml-0"
              aria-label={
                listo && unidades > 0
                  ? `Carrito, ${unidades} ${unidades === 1 ? "artículo" : "artículos"}`
                  : "Carrito, vacío"
              }
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {/* Solo tras hidratar: si el servidor pinta un número y el
                  cliente lo cambia, hay desajuste de hidratación. */}
              {listo && unidades > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-dorado-500 px-1 text-[10.5px] font-semibold text-navy-700">
                  {unidades > 99 ? "99+" : unidades}
                </span>
              )}
            </Link>
          </div>

          {/* Buscador móvil: ancho completo, fuera de la fila apretada. */}
          <div className="pb-3 sm:hidden">{buscador("buscar-mov")}</div>

          {/* Fila 2: categorías con mega menú (solo escritorio) */}
          <nav aria-label="Categorías" className="hidden lg:block" onClick={(e) => {
            if ((e.target as Element).closest("a")) setMegaAbierto(null);
          }}>
            <ul className="flex items-center gap-1 pb-1">
              {navegacion.map((seccion) => {
                const tieneHijos = seccion.grupos.length > 0;
                const desplegado = megaAbierto === seccion.id;
                return (
                  <li
                    key={seccion.id}
                    className="relative flex items-center"
                    onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMegaAbierto(null); }}
                    onMouseEnter={() => tieneHijos && abrirMega(seccion.id)}
                    onMouseLeave={cerrarMega}
                  >
                    <Link
                      href={seccion.href}
                      className="flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm text-navy-400 transition-colors hover:bg-crema-200 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                    >
                      {seccion.label}
                    </Link>
                    {tieneHijos && (
                      <button
                        type="button"
                        id={`menu-boton-${seccion.id}`}
                        aria-label={`Categorías de ${seccion.label}`}
                        aria-expanded={desplegado}
                        aria-controls={`submenu-${seccion.id}`}
                        onClick={() => setMegaAbierto(desplegado ? null : seccion.id)}
                        className="grid min-h-11 min-w-11 place-items-center rounded-lg text-navy-500 hover:bg-crema-200 focus-visible:ring-2 focus-visible:ring-navy-500"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                          className={`transition-transform duration-200 motion-reduce:transition-none ${desplegado ? "rotate-180" : ""}`}>
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    )}

                    {tieneHijos && desplegado && (
                      <div
                        id={`submenu-${seccion.id}`}
                        onMouseEnter={() => abrirMega(seccion.id)}
                        onMouseLeave={cerrarMega}
                        className="absolute left-0 top-full z-50 w-max min-w-[270px] rounded-2xl border border-crema-400 bg-white p-4 shadow-[0_16px_48px_rgba(9,46,94,0.13)]"
                      >
                        <ul className="space-y-0.5">
                          {seccion.grupos.map((g) => (
                            <li key={g.href + g.label}>
                              <Link
                                href={g.href}
                                className="block rounded-lg px-3 py-2 text-sm text-navy-400 transition-colors hover:bg-crema-200 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                              >
                                {g.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={seccion.href}
                          className="mt-2 block border-t border-crema-300 px-3 pt-3 text-xs font-medium text-dorado-700 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                        >
                          Ver todo en {seccion.label} →
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}

              <li className="ml-auto">
                <Link
                  href="/recompra"
                  className="rounded-lg px-3.5 py-2.5 text-sm text-navy-400 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                >
                  Repetir pedido
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="rounded-lg px-3.5 py-2.5 text-sm text-navy-400 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Menú móvil: lista con las subcategorías indentadas. Un acordeón
            anidado agregaría estado y un toque extra sin beneficio real con
            este número de categorías. */}
        {abierto && (
          <nav
            id="menu-movil"
            onClick={(e) => { if ((e.target as Element).closest("a")) setAbierto(false); }}
            aria-label="Categorías"
            className="max-h-[calc(100dvh-10rem)] overflow-y-auto overscroll-contain border-t border-crema-400 bg-white lg:hidden"
          >
            <ul className="mx-auto max-w-contenido px-6 py-3">
              {navegacion.map((seccion) => (
                <li key={seccion.id} className="border-b border-crema-300 py-1 last:border-0">
                  {/* Icono solo en móvil: en una lista vertical ayuda a
                      escanear sin leer, igual que la señalética del local.
                      En la fila de escritorio se omite a propósito —ahí
                      compite con el texto y agrega ruido sin aportar. */}
                  <Link
                    href={seccion.href}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 text-[15px] font-medium text-navy-500 transition-colors hover:bg-crema-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dorado-500/35 text-navy-400"
                      aria-hidden="true"
                    >
                      <IconoCategoria nombre={seccion.id} className="h-4 w-4" />
                    </span>
                    {seccion.label}
                  </Link>
                  {seccion.grupos.length > 0 && (
                    <details>
                    <summary className="cursor-pointer rounded-lg px-5 py-3 text-sm text-navy-500">Ver categorías de {seccion.label.toLowerCase()}</summary>
                    <ul className="pb-1.5">
                      {seccion.grupos.map((g) => (
                        <li key={g.href + g.label}>
                          <Link
                            href={g.href}
                            className="block rounded-lg py-2.5 pl-5 pr-2 text-sm font-light text-navy-400 transition-colors hover:bg-crema-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                          >
                            {g.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    </details>
                  )}
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/recompra"
                  className="block rounded-lg px-2 py-3 text-[15px] text-navy-500 transition-colors hover:bg-crema-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                >
                  Repetir pedido
                </Link>
                <Link
                  href="/contacto"
                  className="block rounded-lg px-2 py-3 text-[15px] text-navy-500 transition-colors hover:bg-crema-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
